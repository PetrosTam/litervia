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

## Local verification evidence

Owner-executed checks on 2026-11-06, against the disposable PostgreSQL 18.6 catalogue test database:

- Schema bootstrap, ownership and least-privilege preflight: **PASS**; test migrator has schema DDL permission, test app does not have schema `USAGE`.
- Initial `up()` migration: **PASS**; only `research.source_snapshots` and `research.source_records` created.
- `down()` via `migrate:rollback --step=1`: **PASS**; both tables removed, `research` schema retained and the specific migration record removed.
- Subsequent `up()` reapplication: **PASS**; both tables restored, zero remaining test records, one migration record.
- Second run while already applied: **PASS**, Laravel reported `Nothing to migrate.`
- Full opted-in Laravel/PostgreSQL suite after the additional permission-denial test: **32 passed, 653 assertions, zero skipped**. The provenance-specific suite passed **7 tests, 147 assertions**.
- Ordinary Laravel suite after the additional security test: **20 passed, 268 assertions**, with 12 expected PostgreSQL opt-in skips.
- React/Vitest: **20 tests passed**; Vite production build: **PASS**; Laravel Pint: **PASS, 29 files**.
- Composer validation/platform checks: **PASS**; Composer and npm security audits: no advisories/vulnerabilities reported by the executed checks.
- Authenticated restricted application-role denial checks for `INSERT`, `UPDATE`, `DELETE` and `CREATE TABLE`: **PASS**. Each operation was rejected with PostgreSQL SQLSTATE `42501`; probes used transactional rollback.

Not yet verified or authorized:

- GitHub Actions on the final catalogue PR head (PHP 8.4, PHP 8.5, Node.js 24).
- Runtime catalogue migration, populated-data recovery, real CHI ingestion, or production deployment. These require separate review and explicit approval.

These results validate a bounded, synthetic-data implementation in a disposable database; they do not establish production readiness or historical catalogue completeness.

## Open work / exclusions

- D-06 work-level identity adjudication, D-07 DOI resolution, D-10 search API, D-11 redirects and the rest of D-12.
- Future importer/publisher grants, release immutability, rights holds, `api_public` views, migrations on `litervia_catalogue`, primary CHI source ingestion, 150-record pilot import and deployment.
- Any dependency/version difference or failure discovered during the first owner-side execution must be reported and reviewed before continuing.
