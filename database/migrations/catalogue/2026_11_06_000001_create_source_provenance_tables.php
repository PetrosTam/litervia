<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'catalogue_test_migrator';

    public function up(): void
    {
        $this->assertDisposableCatalogueConnection();

        Schema::connection($this->connection)->create('research.source_snapshots', function (Blueprint $table): void {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->text('provider');
            $table->text('snapshot_label');
            $table->char('archive_sha256', 64)->nullable();
            $table->char('dtd_sha256', 64)->nullable();
            $table->date('source_date')->nullable();
            $table->timestampTz('retrieved_at')->nullable();
            $table->text('license_evidence_ref')->nullable();
            $table->timestampTz('recorded_at')->useCurrent();
            $table->unique(['provider', 'archive_sha256'], 'source_snapshots_provider_archive_hash_uq');
        });

        Schema::connection($this->connection)->create('research.source_records', function (Blueprint $table): void {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('snapshot_id');
            $table->text('source_record_key');
            $table->string('record_kind', 20);
            $table->bigInteger('source_ordinal');
            $table->jsonb('source_fields_json');
            $table->jsonb('source_attributes_json');
            $table->char('serialized_record_hash', 64);
            $table->text('hash_algorithm_version');
            $table->smallInteger('observed_year')->nullable();
            $table->timestampTz('recorded_at')->useCurrent();
            $table->foreign('snapshot_id', 'source_records_snapshot_fk')
                ->references('id')->on('research.source_snapshots')->restrictOnDelete();
            $table->unique(['snapshot_id', 'source_record_key'], 'source_records_snapshot_key_uq');
            $table->unique(['snapshot_id', 'source_ordinal'], 'source_records_snapshot_ordinal_uq');
        });

        $connection = DB::connection($this->connection);
        $connection->statement(<<<'SQL'
            ALTER TABLE research.source_snapshots
              ADD CONSTRAINT source_snapshots_provider_nonblank CHECK (length(btrim(provider)) > 0),
              ADD CONSTRAINT source_snapshots_label_nonblank CHECK (length(btrim(snapshot_label)) > 0),
              ADD CONSTRAINT source_snapshots_archive_sha256_format CHECK (archive_sha256 IS NULL OR archive_sha256 ~ '^[0-9a-f]{64}$'),
              ADD CONSTRAINT source_snapshots_dtd_sha256_format CHECK (dtd_sha256 IS NULL OR dtd_sha256 ~ '^[0-9a-f]{64}$')
            SQL);
        $connection->statement(<<<'SQL'
            ALTER TABLE research.source_records
              ADD CONSTRAINT source_records_key_nonblank CHECK (length(btrim(source_record_key)) > 0),
              ADD CONSTRAINT source_records_kind_supported CHECK (record_kind IN ('inproceedings', 'proceedings')),
              ADD CONSTRAINT source_records_ordinal_nonnegative CHECK (source_ordinal >= 0),
              ADD CONSTRAINT source_records_hash_format CHECK (serialized_record_hash ~ '^[0-9a-f]{64}$'),
              ADD CONSTRAINT source_records_hash_version_nonblank CHECK (length(btrim(hash_algorithm_version)) > 0)
            SQL);
    }

    public function down(): void
    {
        $this->assertDisposableCatalogueConnection();

        // Only the two approved test tables are removed. Never DROP SCHEMA CASCADE.
        Schema::connection($this->connection)->dropIfExists('research.source_records');
        Schema::connection($this->connection)->dropIfExists('research.source_snapshots');
    }

    private function assertDisposableCatalogueConnection(): void
    {
        if (getenv('LITERVIA_PG_INTEGRATION') !== '1') {
            throw new RuntimeException('Research catalogue migrations are opt-in and disposable-test-only');
        }

        $connection = DB::connection($this->connection);
        $config = $connection->getConfig();

        if (($config['driver'] ?? null) !== 'pgsql'
            || ($config['host'] ?? null) !== '127.0.0.1'
            || (string) ($config['port'] ?? '') !== '5432'
            || ($config['database'] ?? null) !== 'litervia_catalogue_test'
            || ($config['username'] ?? null) !== 'litervia_catalogue_test_migrator'
            || ! is_string($config['password'] ?? null)
            || $config['password'] === '') {
            throw new RuntimeException('Research catalogue refused unexpected catalogue migration connection configuration');
        }

        // Laravel --pretend suppresses SELECT results. Read the identity
        // outside dry-run mode, without executing any DDL or writes.
        $identity = $connection->withoutPretending(fn () => $connection->selectOne(<<<'SQL'
            SELECT current_database() AS db, current_user AS role_name,
                   host(inet_server_addr()) AS server_address,
                   current_setting('server_version_num')::int / 10000 AS pg_major
            SQL));
        if ($identity === null
            || $identity->db !== 'litervia_catalogue_test'
            || $identity->role_name !== 'litervia_catalogue_test_migrator'
            || $identity->server_address !== '127.0.0.1'
            || (int) $identity->pg_major !== 18) {
            throw new RuntimeException('Research catalogue refused unexpected connected PostgreSQL server or identity');
        }
    }
};
