<?php

namespace Tests\Feature;

use Illuminate\Database\Connection;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CatalogueSourceProvenanceTest extends TestCase
{
    private const MIGRATOR = 'catalogue_test_migrator';

    private const APP = 'catalogue_test_app';

    public function test_provenance_schema_and_roles_are_isolated(): void
    {
        $this->requireSafeTestDatabase();

        $migrator = DB::connection(self::MIGRATOR);
        $app = DB::connection(self::APP);
        try {
            $schema = $migrator->selectOne(<<<'SQL'
                SELECT has_schema_privilege(current_user, 'research', 'USAGE') AS can_use,
                       has_schema_privilege(current_user, 'research', 'CREATE') AS can_create,
                       to_regclass('research.source_snapshots') IS NOT NULL AS snapshots_exist,
                       to_regclass('research.source_records') IS NOT NULL AS records_exist
                SQL);
            $this->assertTrue((bool) $schema->can_use);
            $this->assertTrue((bool) $schema->can_create);
            $this->assertTrue((bool) $schema->snapshots_exist);
            $this->assertTrue((bool) $schema->records_exist);

            // The app intentionally lacks schema USAGE, so a table-name lookup
            // inside has_table_privilege() would itself raise SQLSTATE 42501.
            $identity = $app->selectOne(<<<'SQL'
                SELECT current_database() AS db, current_user AS role_name,
                       has_schema_privilege(current_user, 'research', 'USAGE') AS can_use,
                       has_schema_privilege(current_user, 'research', 'CREATE') AS can_create
                SQL);
            $this->assertSame('litervia_catalogue_test', $identity->db);
            $this->assertSame('litervia_catalogue_test_app', $identity->role_name);
            $this->assertFalse((bool) $identity->can_use);
            $this->assertFalse((bool) $identity->can_create);

            // Inspect the relation OID through read-only system catalogs.
            // No schema/table privileges are granted to the restricted role.
            $tablePrivileges = $app->selectOne(<<<'SQL'
                SELECT has_table_privilege(current_user, c.oid, 'SELECT') AS can_select,
                       has_table_privilege(current_user, c.oid, 'INSERT') AS can_insert
                FROM pg_catalog.pg_class AS c
                JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
                WHERE n.nspname = 'research'
                  AND c.relname = 'source_records'
                  AND c.relkind IN ('r', 'p')
                SQL);
            $this->assertNotNull($tablePrivileges, 'Expected test relation is missing');
            $this->assertFalse((bool) $tablePrivileges->can_select);
            $this->assertFalse((bool) $tablePrivileges->can_insert);

            $this->expectSqlState('42501', static function () use ($app): void {
                $app->select('SELECT id FROM research.source_records LIMIT 1');
            });
        } finally {
            DB::disconnect(self::APP);
            DB::disconnect(self::MIGRATOR);
        }
    }

    public function test_restricted_app_cannot_modify_research_data_or_create_tables(): void
    {
        $this->requireSafeTestDatabase();

        $app = DB::connection(self::APP);

        try {
            $identity = $app->selectOne('SELECT current_database() AS db, current_user AS role_name');
            $this->assertSame('litervia_catalogue_test', $identity->db);
            $this->assertSame('litervia_catalogue_test_app', $identity->role_name);

            // Even if a grant is accidentally widened, every probe is rolled back.
            // UPDATE and DELETE cannot change rows because their predicates are false.
            $deniedStatements = [
                'INSERT' => "INSERT INTO research.source_snapshots (provider, snapshot_label) VALUES ('dblp', 'permission-probe')",
                'UPDATE' => 'UPDATE research.source_snapshots SET snapshot_label = snapshot_label WHERE FALSE',
                'DELETE' => 'DELETE FROM research.source_snapshots WHERE FALSE',
                'CREATE TABLE' => 'CREATE TABLE research.source_provenance_permission_probe (id bigint)',
            ];

            foreach ($deniedStatements as $operation => $statement) {
                $app->beginTransaction();

                try {
                    $denied = false;

                    try {
                        $app->statement($statement);
                    } catch (QueryException $exception) {
                        $this->assertSame('42501', $exception->errorInfo[0] ?? null, "Unexpected SQLSTATE for {$operation}");
                        $denied = true;
                    }

                    $this->assertTrue($denied, "Restricted application role unexpectedly allowed {$operation}");
                } finally {
                    if ($app->transactionLevel() > 0) {
                        $app->rollBack();
                    }
                }
            }
        } finally {
            DB::disconnect(self::APP);
        }

        // A denied (or accidentally permitted) DDL attempt must not leave a table.
        $migrator = DB::connection(self::MIGRATOR);

        try {
            $probe = $migrator->selectOne("SELECT to_regclass('research.source_provenance_permission_probe') AS relation_name");
            $this->assertNull($probe->relation_name);
        } finally {
            DB::disconnect(self::MIGRATOR);
        }
    }

    public function test_upstream_keys_are_scoped_to_snapshots_and_fields_are_preserved(): void
    {
        $this->requireSafeTestDatabase();
        $db = DB::connection(self::MIGRATOR);
        $db->beginTransaction();
        try {
            $one = $this->snapshot($db, 'snapshot A');
            $two = $this->snapshot($db, 'snapshot B');
            $this->record($db, $one, 'conf/chi/Candidate26', 0, 'inproceedings',
                ['title' => 'Ερευνητική ανακάλυψη', 'authors' => ['Αθηνά', 'Zoë']]);
            $this->record($db, $two, 'conf/chi/Candidate26', 0, 'inproceedings',
                ['title' => 'Ερευνητική ανακάλυψη', 'authors' => ['Αθηνά', 'Zoë']]);
            $this->record($db, $one, 'conf/chi/Volume26', 1, 'proceedings',
                ['title' => 'Proceedings volume', 'authors' => []]);

            $results = $db->select('SELECT snapshot_id, source_record_key, record_kind, source_fields_json FROM research.source_records ORDER BY source_ordinal, snapshot_id');
            $this->assertCount(3, $results);
            $this->assertCount(2, array_filter($results, static fn (object $r): bool => $r->source_record_key === 'conf/chi/Candidate26'));
            $this->assertCount(1, array_filter($results, static fn (object $r): bool => $r->record_kind === 'proceedings'));
            $fields = array_map(static fn (object $r): array => json_decode($r->source_fields_json, true, 512, JSON_THROW_ON_ERROR), $results);
            $this->assertContains(['title' => 'Ερευνητική ανακάλυψη', 'authors' => ['Αθηνά', 'Zoë']], $fields);
        } finally {
            $db->rollBack();
            DB::disconnect(self::MIGRATOR);
        }
    }

    public function test_duplicate_snapshot_key_and_ordinal_are_rejected(): void
    {
        $this->requireSafeTestDatabase();
        $db = DB::connection(self::MIGRATOR);
        try {
            foreach (['key', 'ordinal'] as $mode) {
                $this->expectSqlState('23505', function () use ($db, $mode): void {
                    $db->transaction(function () use ($db, $mode): void {
                        $snapshot = $this->snapshot($db, 'duplicate probe');
                        $this->record($db, $snapshot, 'key-1', 0, 'inproceedings');
                        $this->record($db, $snapshot, $mode === 'key' ? 'key-1' : 'key-2',
                            $mode === 'key' ? 1 : 0, 'inproceedings');
                    });
                });
            }
        } finally {
            DB::disconnect(self::MIGRATOR);
        }
    }

    public function test_known_source_archive_hash_cannot_be_reused_for_same_provider(): void
    {
        $this->requireSafeTestDatabase();
        $db = DB::connection(self::MIGRATOR);
        try {
            $this->expectSqlState('23505', function () use ($db): void {
                $db->transaction(function () use ($db): void {
                    $db->insert(
                        'INSERT INTO research.source_snapshots (provider, snapshot_label, archive_sha256) VALUES (?, ?, ?)',
                        ['dblp', 'first', str_repeat('b', 64)]
                    );
                    $db->insert(
                        'INSERT INTO research.source_snapshots (provider, snapshot_label, archive_sha256) VALUES (?, ?, ?)',
                        ['dblp', 'second', str_repeat('b', 64)]
                    );
                });
            });
        } finally {
            DB::disconnect(self::MIGRATOR);
        }
    }

    public function test_invalid_kind_ordinal_hash_and_foreign_key_are_rejected(): void
    {
        $this->requireSafeTestDatabase();
        $db = DB::connection(self::MIGRATOR);
        try {
            $cases = [
                ['23514', 'invalid-kind', 0, 'article', str_repeat('a', 64), null],
                ['23514', 'negative-ordinal', -1, 'inproceedings', str_repeat('a', 64), null],
                ['23514', 'bad-hash', 0, 'inproceedings', str_repeat('x', 64), null],
                ['23503', 'bad-fk', 0, 'inproceedings', str_repeat('a', 64), '00000000-0000-4000-8000-000000000000'],
            ];
            foreach ($cases as [$sqlState, $key, $ordinal, $kind, $hash, $overrideSnapshot]) {
                $this->expectSqlState($sqlState, function () use ($db, $key, $ordinal, $kind, $hash, $overrideSnapshot): void {
                    $db->transaction(function () use ($db, $key, $ordinal, $kind, $hash, $overrideSnapshot): void {
                        $snapshot = $this->snapshot($db, 'negative probe');
                        $this->record($db, $overrideSnapshot ?? $snapshot, $key, $ordinal, $kind, [], $hash);
                    });
                });
            }
        } finally {
            DB::disconnect(self::MIGRATOR);
        }
    }

    public function test_snapshot_rejects_malformed_archive_hash(): void
    {
        $this->requireSafeTestDatabase();
        $db = DB::connection(self::MIGRATOR);
        try {
            $this->expectSqlState('23514', function () use ($db): void {
                $db->transaction(function () use ($db): void {
                    $db->insert(
                        'INSERT INTO research.source_snapshots (provider, snapshot_label, archive_sha256) VALUES (?, ?, ?)',
                        ['dblp', 'bad hash test', str_repeat('g', 64)]
                    );
                });
            });
        } finally {
            DB::disconnect(self::MIGRATOR);
        }
    }

    private function requireSafeTestDatabase(): void
    {
        if (getenv('LITERVIA_PG_INTEGRATION') !== '1') {
            $this->markTestSkipped('Research catalogue requires explicit opt-in disposable PostgreSQL integration testing.');
        }

        foreach ([
            self::MIGRATOR => 'litervia_catalogue_test_migrator',
            self::APP => 'litervia_catalogue_test_app',
        ] as $name => $username) {
            $config = config("database.connections.{$name}");
            $this->assertSame('pgsql', $config['driver'] ?? null);
            $this->assertSame('127.0.0.1', $config['host'] ?? null);
            $this->assertSame('5432', (string) ($config['port'] ?? ''));
            $this->assertSame('litervia_catalogue_test', $config['database'] ?? null);
            $this->assertSame($username, $config['username'] ?? null);
            $this->assertNotEmpty($config['password'] ?? null);
        }

        $db = DB::connection(self::MIGRATOR);
        $identity = $db->selectOne(<<<'SQL'
            SELECT current_database() AS db, current_user AS role_name,
                   host(inet_server_addr()) AS host,
                   current_setting('server_version_num')::int / 10000 AS pg_major
            SQL);
        $expectedServerAddress = '127.0.0.1';

        if (getenv('GITHUB_ACTIONS') === 'true') {
            $ciServerAddress = getenv('LITERVIA_CI_PG_SERVER_ADDRESS');
            $this->assertIsString($ciServerAddress);
            $this->assertNotFalse(filter_var($ciServerAddress, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4));
            $this->assertNotSame('127.0.0.1', $ciServerAddress);
            $expectedServerAddress = $ciServerAddress;
        } else {
            $this->assertFalse(getenv('LITERVIA_CI_PG_SERVER_ADDRESS'));
        }

        $this->assertSame('litervia_catalogue_test', $identity->db);
        $this->assertSame('litervia_catalogue_test_migrator', $identity->role_name);
        $this->assertSame($expectedServerAddress, $identity->host);
        $this->assertSame(18, (int) $identity->pg_major);
    }

    private function snapshot(Connection $db, string $label): string
    {
        return $db->selectOne(
            'INSERT INTO research.source_snapshots (provider, snapshot_label) VALUES (?, ?) RETURNING id',
            ['dblp', $label]
        )->id;
    }

    private function record(
        Connection $db,
        string $snapshot,
        string $key,
        int $ordinal,
        string $kind,
        array $fields = [],
        ?string $hash = null
    ): void {
        $db->insert(<<<'SQL'
            INSERT INTO research.source_records
              (snapshot_id, source_record_key, record_kind, source_ordinal,
               source_fields_json, source_attributes_json, serialized_record_hash, hash_algorithm_version)
            VALUES (?, ?, ?, ?, CAST(? AS jsonb), CAST(? AS jsonb), ?, ?)
            SQL, [
            $snapshot,
            $key,
            $kind,
            $ordinal,
            json_encode($fields, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE),
            '{}',
            $hash ?? str_repeat('a', 64),
            'synthetic-fixture-sha256-v1',
        ]);
    }

    private function expectSqlState(string $expected, callable $operation): void
    {
        try {
            $operation();
        } catch (QueryException $exception) {
            $this->assertSame($expected, $exception->errorInfo[0] ?? null);

            return;
        }

        $this->fail("Expected PostgreSQL SQLSTATE {$expected}, but the operation was accepted");
    }
}
