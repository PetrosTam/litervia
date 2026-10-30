<?php

namespace Tests\Feature;

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\AssertionFailedError;
use Tests\TestCase;

class PostgreSQLConnectionTest extends TestCase
{
    // Exact identities: no integration test may redirect to a runtime database.
    private const TEST_CONNECTION_IDENTITIES = [
        'catalogue_test_app' => ['litervia_catalogue_test', 'litervia_catalogue_test_app'],
        'catalogue_test_migrator' => ['litervia_catalogue_test', 'litervia_catalogue_test_migrator'],
        'private_test_app' => ['litervia_private_test', 'litervia_private_test_app'],
        'private_test_migrator' => ['litervia_private_test', 'litervia_private_test_migrator'],
    ];

    public function test_isolated_postgresql_identity_and_privilege_contracts(): void
    {
        // Opt-in only: ordinary PHPUnit runs remain isolated on SQLite.
        if (getenv('LITERVIA_PG_INTEGRATION') !== '1') {
            $this->markTestSkipped('Set LITERVIA_PG_INTEGRATION=1 to run PostgreSQL integration checks.');
        }

        $expected = [
            'catalogue_test_app' => ['litervia_catalogue_test', 'litervia_catalogue_test_app', 'no'],
            'catalogue_test_migrator' => ['litervia_catalogue_test', 'litervia_catalogue_test_migrator', 'yes'],
            'private_test_app' => ['litervia_private_test', 'litervia_private_test_app', 'no'],
            'private_test_migrator' => ['litervia_private_test', 'litervia_private_test_migrator', 'yes'],
        ];

        $this->assertDisposableTestConnectionConfiguration();

        foreach ($expected as $name => [$database, $role, $canCreate]) {
            $connection = DB::connection($name);

            try {
                $result = $connection->selectOne(<<<'SQL'
                    SELECT current_database() AS database_name,
                           current_user AS role_name,
                           current_setting('server_encoding') AS encoding,
                           d.datlocprovider::text AS provider,
                           d.datlocale AS icu_locale,
                           CASE WHEN has_schema_privilege(current_user, 'public', 'CREATE')
                               THEN 'yes' ELSE 'no' END AS schema_create,
                           CASE WHEN has_database_privilege(current_user, 'litervia_catalogue', 'CONNECT')
                                  OR has_database_privilege(current_user, 'litervia_private', 'CONNECT')
                               THEN 'yes' ELSE 'no' END AS runtime_database_access
                    FROM pg_database d
                    WHERE d.datname = current_database()
                    SQL);

                $this->assertNotNull($result);
                $this->assertSame($database, $result->database_name);
                $this->assertSame($role, $result->role_name);
                $this->assertSame('UTF8', $result->encoding);
                $this->assertSame('i', $result->provider);
                $this->assertSame('und', $result->icu_locale);
                $this->assertSame($canCreate, $result->schema_create);
                $this->assertSame('no', $result->runtime_database_access);
            } finally {
                DB::disconnect($name);
            }
        }
    }

    public function test_isolated_postgresql_ddl_permissions_and_rollback(): void
    {
        if (getenv('LITERVIA_PG_INTEGRATION') !== '1') {
            $this->markTestSkipped('Set LITERVIA_PG_INTEGRATION=1 to run PostgreSQL integration checks.');
        }

        $cases = [
            'catalogue_test_app' => ['litervia_catalogue_test', 'litervia_catalogue_test_app', false],
            'catalogue_test_migrator' => ['litervia_catalogue_test', 'litervia_catalogue_test_migrator', true],
            'private_test_app' => ['litervia_private_test', 'litervia_private_test_app', false],
            'private_test_migrator' => ['litervia_private_test', 'litervia_private_test_migrator', true],
        ];

        $this->assertDisposableTestConnectionConfiguration();

        foreach ($cases as $name => [$database, $role, $shouldCreate]) {
            $connection = DB::connection($name);
            $created = false;

            try {
                $this->assertNull($connection->selectOne(
                    "SELECT to_regclass('public.litervia_issue11_ddl_probe') AS relation_name"
                )->relation_name, "Unexpected existing probe in {$database}");

                // PostgreSQL supports transactional DDL: both allowed and denied
                // attempts leave the disposable test databases unchanged.
                $connection->beginTransaction();

                try {
                    $connection->statement('CREATE TABLE public.litervia_issue11_ddl_probe (id BIGINT)');
                    $created = true;
                } catch (QueryException $exception) {
                    $this->assertSame('42501', (string) $exception->getCode(), "Unexpected SQLSTATE for {$role}");
                } finally {
                    if ($connection->transactionLevel() > 0) {
                        $connection->rollBack();
                    }
                }

                $this->assertSame($shouldCreate, $created, "Unexpected CREATE privilege for {$role}");
                $this->assertNull($connection->selectOne(
                    "SELECT to_regclass('public.litervia_issue11_ddl_probe') AS relation_name"
                )->relation_name, "Probe remained after rollback in {$database}");
            } finally {
                DB::disconnect($name);
            }
        }
    }

    public function test_postgresql_test_roles_cannot_connect_to_opposite_test_database(): void
    {
        if (getenv('LITERVIA_PG_INTEGRATION') !== '1') {
            $this->markTestSkipped('Set LITERVIA_PG_INTEGRATION=1 to run PostgreSQL integration checks.');
        }

        // Both the source credentials and the destination are fixed to disposable
        // _test identities. Validate EVERY source before opening any connection.
        $cases = [
            'catalogue_test_app' => ['litervia_catalogue_test', 'litervia_catalogue_test_app', 'litervia_private_test'],
            'catalogue_test_migrator' => ['litervia_catalogue_test', 'litervia_catalogue_test_migrator', 'litervia_private_test'],
            'private_test_app' => ['litervia_private_test', 'litervia_private_test_app', 'litervia_catalogue_test'],
            'private_test_migrator' => ['litervia_private_test', 'litervia_private_test_migrator', 'litervia_catalogue_test'],
        ];

        $this->assertDisposableTestConnectionConfiguration();

        foreach ($cases as $name => [, $role, $oppositeTestDatabase]) {
            $configured = config("database.connections.{$name}");

            // Prove the source credentials work, the target database is online,
            // and PostgreSQL denies this authenticated role CONNECT privilege.
            // This avoids relying on English/libpq-localized error messages.
            $source = DB::connection($name);

            try {
                $preflight = $source->selectOne(<<<'SQL'
                    SELECT has_database_privilege(current_user, ?, 'CONNECT') AS allowed,
                           EXISTS (
                               SELECT 1 FROM pg_database
                               WHERE datname = ? AND datallowconn
                           ) AS target_is_open
                    SQL, [$oppositeTestDatabase, $oppositeTestDatabase]);
                $this->assertFalse((bool) $preflight->allowed, "Unexpected CONNECT grant for {$role}");
                $this->assertTrue((bool) $preflight->target_is_open, 'Disposable opposite database is unavailable');
            } finally {
                DB::disconnect($name);
            }

            try {
                // No Laravel connection config is mutated. Never attempt to
                // connect to litervia_catalogue or litervia_private here.
                $unexpectedConnection = new \PDO(
                    "pgsql:host=127.0.0.1;port=5432;dbname={$oppositeTestDatabase};connect_timeout=3",
                    $configured['username'],
                    $configured['password'],
                    [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION]
                );
            } catch (\PDOException $exception) {
                // Connection-class SQLSTATEs vary across PDO/libpq versions.
                // Explicit denied privileges and working source credentials
                // establish the intended negative condition without parsing
                // an English PostgreSQL error message.
                $this->assertNotSame('', (string) $exception->getCode());

                continue;
            }

            unset($unexpectedConnection);
            $this->fail("{$role} unexpectedly connected to {$oppositeTestDatabase}");
        }
    }

    public function test_disposable_postgresql_rejects_an_invalid_password(): void
    {
        if (getenv('LITERVIA_PG_INTEGRATION') !== '1') {
            $this->markTestSkipped('Set LITERVIA_PG_INTEGRATION=1 to run PostgreSQL integration checks.');
        }

        // Only the fixed disposable catalogue test database and its app role.
        // First prove that the intended identity can connect successfully, so
        // an unavailable server is not mistaken for an authentication denial.
        $this->assertDisposableTestConnectionConfiguration();
        $connection = DB::connection('catalogue_test_app');

        try {
            $identity = $connection->selectOne('SELECT current_database() AS db, current_user AS role');
            $this->assertSame('litervia_catalogue_test', $identity->db);
            $this->assertSame('litervia_catalogue_test_app', $identity->role);
        } finally {
            DB::disconnect('catalogue_test_app');
        }

        // Wrong credentials exist only in process memory; do not print them.
        // Both destination and role are fixed; no runtime user database is used.
        $wrongPassword = 'invalid-'.bin2hex(random_bytes(32));
        $wasDenied = false;

        try {
            $unexpectedConnection = new \PDO(
                'pgsql:host=127.0.0.1;port=5432;dbname=litervia_catalogue_test;connect_timeout=3',
                'litervia_catalogue_test_app',
                $wrongPassword,
                [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION]
            );
        } catch (\PDOException $exception) {
            // PDO::__construct() may expose libpq's numeric driver code
            // (for example 7) instead of a five-character SQLSTATE. The
            // SQLSTATE is then reported in the machine-readable prefix of
            // the exception message; do not parse localized error prose.
            $code = (string) $exception->getCode();

            if (ctype_digit($code)) {
                $this->assertMatchesRegularExpression(
                    '/\ASQLSTATE\[(?:08006|28P01|28000)\]/',
                    $exception->getMessage()
                );
            } else {
                $this->assertContains($code, ['08006', '28P01', '28000']);
            }

            $this->assertStringNotContainsString($wrongPassword, $exception->getMessage());
            $wasDenied = true;
        }

        if (! $wasDenied) {
            unset($unexpectedConnection);
            $this->fail('An invalid test-role password unexpectedly authenticated.');
        }

        // Confirm the test database is still reachable after the failed attempt.
        $connection = DB::connection('catalogue_test_app');

        try {
            $this->assertSame('litervia_catalogue_test_app', $connection->selectOne('SELECT current_user AS role')->role);
        } finally {
            DB::disconnect('catalogue_test_app');
        }
    }

    public function test_disposable_postgresql_icu_sorting_and_collation_version(): void
    {
        if (getenv('LITERVIA_PG_INTEGRATION') !== '1') {
            $this->markTestSkipped('Set LITERVIA_PG_INTEGRATION=1 to run PostgreSQL integration checks.');
        }

        $this->assertDisposableTestConnectionConfiguration();

        // No CREATE/INSERT or external catalogue data: multilingual fixtures
        // are supplied by this read-only VALUES query.
        $samples = ['Alpha', 'Eclair', 'Éclair', 'Αθήνα', 'Άλφα', 'Αλφα', 'Βήτα', '東京'];
        $referenceOrder = null;

        foreach (['catalogue_test_app', 'private_test_app'] as $name) {
            $connection = DB::connection($name);

            try {
                $versions = $connection->selectOne(<<<'SQL'
                    SELECT d.datcollversion AS recorded_version,
                           pg_database_collation_actual_version(d.oid) AS actual_version
                    FROM pg_database d
                    WHERE d.datname = current_database()
                    SQL);

                $this->assertNotNull($versions);
                $this->assertNotEmpty($versions->recorded_version);
                $this->assertSame($versions->recorded_version, $versions->actual_version);

                $rows = $connection->select(<<<'SQL'
                    SELECT label FROM (VALUES
                        ('Alpha'), ('Eclair'), ('Éclair'), ('Αθήνα'),
                        ('Άλφα'), ('Αλφα'), ('Βήτα'), ('東京')
                    ) AS sample(label)
                    ORDER BY label COLLATE "default", label COLLATE "C"
                    SQL);

                $order = array_map(static fn (object $row): string => $row->label, $rows);
                $this->assertCount(count($samples), $order);
                $this->assertEqualsCanonicalizing($samples, $order);

                // These two basic within-script comparisons are meaningful,
                // but no exact accent/script ordering is frozen as product policy.
                $comparisons = $connection->selectOne(<<<'SQL'
                    SELECT CASE WHEN 'Alpha' COLLATE "default" < 'Beta' THEN 1 ELSE 0 END AS latin,
                           CASE WHEN 'Αλφα' COLLATE "default" < 'Βήτα' THEN 1 ELSE 0 END AS greek
                    SQL);
                $this->assertSame(1, (int) $comparisons->latin);
                $this->assertSame(1, (int) $comparisons->greek);

                if ($referenceOrder === null) {
                    $referenceOrder = $order;
                } else {
                    $this->assertSame($referenceOrder, $order, 'Disposable stores disagree on ICU sorting');
                }
            } finally {
                DB::disconnect($name);
            }
        }
    }

    public function test_postgresql_integration_guard_fails_closed_for_invalid_configuration(): void
    {
        // This always-on test uses synthetic in-memory config and NO database
        // connection, so it is safe in the ordinary SQLite regression suite.
        $originals = [];

        foreach (self::TEST_CONNECTION_IDENTITIES as $name => [$database, $role]) {
            $key = "database.connections.{$name}";
            $originals[$name] = config($key);
            config()->set($key, [
                'driver' => 'pgsql',
                'host' => '127.0.0.1',
                'port' => '5432',
                'database' => $database,
                'username' => $role,
                'password' => 'synthetic-never-used',
            ]);
        }

        try {
            $this->assertDisposableTestConnectionConfiguration();
            $invalidValues = [
                ['catalogue_test_app', 'password', null],
                ['catalogue_test_app', 'password', ''],
                ['private_test_app', 'host', '192.0.2.1'],
                ['catalogue_test_migrator', 'database', 'litervia_catalogue'],
                ['private_test_migrator', 'database', 'litervia_private'],
                ['catalogue_test_app', 'port', '5433'],
                ['private_test_app', 'username', 'postgres'],
                ['private_test_migrator', 'driver', 'sqlite'],
            ];

            foreach ($invalidValues as [$name, $field, $badValue]) {
                $key = "database.connections.{$name}.{$field}";
                $goodValue = config($key);
                config()->set($key, $badValue);

                try {
                    $rejected = false;

                    try {
                        $this->assertDisposableTestConnectionConfiguration();
                    } catch (AssertionFailedError) {
                        $rejected = true;
                    }

                    $this->assertTrue($rejected, "Unsafe {$name}.{$field} was accepted");
                } finally {
                    config()->set($key, $goodValue);
                }
            }
        } finally {
            foreach ($originals as $name => $original) {
                config()->set("database.connections.{$name}", $original);
            }
        }
    }

    private function assertDisposableTestConnectionConfiguration(): void
    {
        foreach (self::TEST_CONNECTION_IDENTITIES as $name => [$database, $role]) {
            $configured = config("database.connections.{$name}");
            $this->assertIsArray($configured, "Missing {$name} test connection");
            $this->assertSame('pgsql', $configured['driver'] ?? null);
            $this->assertSame('127.0.0.1', $configured['host'] ?? null);
            $this->assertSame('5432', (string) ($configured['port'] ?? ''));
            $this->assertSame($database, $configured['database'] ?? null);
            $this->assertSame($role, $configured['username'] ?? null);
            $this->assertIsString($configured['password'] ?? null);
            $this->assertNotSame('', $configured['password']);
        }
    }
}
