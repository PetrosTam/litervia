# CHI Catalogue — Source Provenance Schema

**Status:** Implemented and locally tested in the disposable PostgreSQL 18 catalogue database. Production rollout remains unapproved.
**Scope:** PostgreSQL 18 disposable `litervia_catalogue_test` database ONLY.
**Architecture references:** [ADR-0001](adr-0001-chi-catalogue-identity.md); [physical-design contract](chi-catalogue-physical-design-contract.md).

## Purpose

Introduce the first two evidence-preserving research relations in a deliberately bounded test-only implementation. The canonical distinction between upstream source observations, bibliographic appearances and research works remains intact; this slice does not implement an importer, identity resolution, publication views, API reads, or public catalogue.

## Implemented test schema contract (bounded D-12)

- `research.source_snapshots`: UUIDv4 PK, upstream provider/label, nullable archive/DTD SHA-256, nullable source/retrieval dates and rights-evidence reference, insertion timestamp.
- `research.source_records`: UUIDv4 PK, snapshot FK, original source key, `inproceedings`/`proceedings` kind, nonnegative exporter ordinal, JSONB exporter fields/attributes, serialized-record SHA-256 plus hash algorithm contract version, nullable observed year, insertion timestamp.
- Unique `(provider, archive_sha256)` where the hash is present (PostgreSQL UNIQUE allows multiple NULL values); unique `(snapshot_id, source_record_key)` and `(snapshot_id, source_ordinal)`.
- Preserve hash value provenance and exporter contract version; hash-format checks are not cryptographic validation against raw XML. JSONB represents the exported interpretation and is **not** byte-exact archived XML. Original raw artefacts remain outside Git.
- `source_ordinal >= 0` accepts either zero-based or one-based source ordering; the exporter convention must be verified before release-boundary semantics are frozen.
- This first slice does not enforce full write-once immutability. Importer role, ingestion-run auditing, audit triggers and publication rights gates are separate pending decisions; never treat these tables alone as a safe publication system.

## Ownership and least privilege

The test schema is created in a separate, manually reviewed **privileged setup transaction** owned by `litervia_catalogue_test_owner` (`NOLOGIN`); `litervia_catalogue_test_migrator` gets only `USAGE, CREATE` on `research`. No database-level `CREATE` is added. The test app role receives no schema/table access. Normal runtime and private PostgreSQL databases are never targets. The normal Laravel `catalogue` runtime connection and its `search_path=public` remain unchanged.

The Laravel migration deliberately binds to `catalogue_test_migrator` and refuses any other database, role, host, PostgreSQL major version or unset opt-in flag. This does **not** authorize production migrations; after tested review, a separate explicit rollout design is required.

## Validation obligations

- Real PostgreSQL 18 authenticated positive / negative probes for FK, uniqueness, check constraints, UUID, JSONB Unicode, privilege denial and disposable transaction rollback.
- Command evidence for `up`, second-run idempotency via Laravel's migration repository, and `down` on the same disposable target. Never use `migrate:fresh`, `db:wipe`, runtime DBs or broad schema cascade.
- Existing PHP / frontend regressions, real GitHub Actions CI on the final PR HEAD, final Issue re-audit and owner-approved merge. Do not mark ACs complete from source inspection alone.

## Recovery from interrupted test-only provisioning or migration

**Scope:** Disposable `litervia_catalogue_test` only.
**Evidence status:** Apply, controlled rollback, reapply and repeated no-op are PASS. An unexpected partial-failure injection has NOT RUN.

1. **Stop and preserve evidence.** Record the failed command, exit status, PostgreSQL SQLSTATE and relevant logs without copying passwords. Do not rerun the privileged provisioning script, use `migrate:fresh` or `db:wipe`, or delete research objects automatically.
2. **Reconfirm the target.** Before recovery, verify PostgreSQL 18 server identity, expected host/port, `litervia_catalogue_test` database and the intended authenticated role. Refuse any runtime or private database target.
3. **Inspect provisioning state.** The privileged `04_catalogue_provenance_test_schema.sql` script uses an explicit transaction and is intentionally non-idempotent. Check whether the `research` schema exists and whether ownership and grants match the reviewed contract. Never rerun this script if the schema already exists.
4. **Inspect migration state.** Use Laravel's migration-status command against the isolated test connection and read-only PostgreSQL catalogue queries to determine whether both approved source tables exist and whether the migration is recorded. Do not infer success solely from the existence of one table.
5. **Choose the safe recovery path.** If neither table exists and the migration is unrecorded, investigate the failure before an owner-authorized retry. If both tables exist and the migration is recorded, verify their constraints and permissions instead of repeating the migration. If table state and migration history disagree, stop and require a reviewed repair plan; do not manually drop objects or forge migration history.
6. **Controlled rollback, when explicitly approved.** Verify that the provenance migration is the migration targeted by the rollback before using the existing guarded, one-step Laravel rollback. Inspect the result before any approved reapplication. Never apply these commands to runtime databases.
7. **Revalidate and report.** Repeat the authenticated schema, constraint, permission and integration checks on the disposable target; record PASS, FAIL, BLOCKED or NOT RUN. A failed local recovery must not be represented as successful merely because a fresh CI service passes.

CI may discard its disposable PostgreSQL service and provision a fresh isolated fixture. Local recovery must preserve evidence and follow the reviewed target-specific plan; no production recovery capability is claimed.

## Local verification evidence

Owner-executed checks on 2026-11-06, against the disposable PostgreSQL 18.6 catalogue test database:

- Schema bootstrap, ownership and least-privilege preflight: **PASS**; test migrator has schema DDL permission, test app does not have schema `USAGE`.
- Initial `up()` migration: **PASS**; only `research.source_snapshots` and `research.source_records` created.
- `down()` via `migrate:rollback --step=1`: **PASS**; both tables removed, `research` schema retained and the specific migration record removed.
- Subsequent `up()` reapplication: **PASS**; both tables restored, zero remaining test records, one migration record.
- Second run while already applied: **PASS**, Laravel reported `Nothing to migrate.`
- Full opted-in Laravel/PostgreSQL suite after the additional permission-denial test: **32 passed, 660 assertions, zero skipped**. The provenance-specific suite passed **7 tests, 154 assertions**.
- Ordinary Laravel suite after the additional security test: **20 passed, 268 assertions**, with 12 expected PostgreSQL opt-in skips.
- React/Vitest: **20 tests passed**; Vite production build: **PASS**; Laravel Pint: **PASS, 29 files**.
- Composer validation/platform checks: **PASS**; Composer and npm security audits: no advisories/vulnerabilities reported by the executed checks.
- Authenticated restricted application-role denial checks for `INSERT`, `UPDATE`, `DELETE` and `CREATE TABLE`: **PASS**. Each operation was rejected with PostgreSQL SQLSTATE `42501`; probes used transactional rollback.

## Verified GitHub Actions CI — PR #25

On 2026-11-06, GitHub Actions run [42297412550](https://github.com/PetrosTam/litervia/actions/runs/42297412550) completed successfully on commit `fe019c4e6c2ea2f55d0a40c75571e17dc9daee6f`.

- PHP 8.4 and PHP 8.5: **PASS**. The disposable catalogue provenance migration applied successfully in both jobs.
- PostgreSQL connection tests: **6 passed, 406 assertions** per PHP job.
- Catalogue provenance tests: **7 passed, 168 assertions** per PHP job. CI checks include Docker service identity assertions; the local provenance suite passed with 154 assertions.
- Frontend (Node.js 24): **PASS**, including React tests and production build.

These results apply to the identified commit. Any subsequent documentation or code commit requires successful CI on the new final PR HEAD before merge.

Not yet verified or authorized:

- Runtime catalogue migration, populated-data recovery, real CHI ingestion, or production deployment. These require separate review and explicit approval.

These results validate a bounded, synthetic-data implementation in a disposable database; they do not establish production readiness or historical catalogue completeness.

## Open work / exclusions

- D-06 work-level identity adjudication, D-07 DOI resolution, D-10 search API, D-11 redirects and the rest of D-12.
- Future importer/publisher grants, release immutability, rights holds, `api_public` views, migrations on `litervia_catalogue`, primary CHI source ingestion, 150-record pilot import and deployment.
- Any dependency/version difference or failure discovered during the first owner-side execution must be reported and reviewed before continuing.
