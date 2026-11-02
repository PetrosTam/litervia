# PostgreSQL foundation (Issue #11)

**Status:** Locally executed local PostgreSQL integration passed **6 tests / 406 assertions**; the complete Laravel + PostgreSQL suite passed **25 tests / 506 assertions**. GitHub [PR #12](https://github.com/PetrosTam/litervia/pull/12) head `b25b66e` passed [Actions run #40980614901](https://github.com/PetrosTam/litervia/actions/runs/40980614901): **3/3 jobs** (PHP 8.4, PHP 8.5 and Node.js 24), including fresh isolated PostgreSQL provisioning, credential-bootstrap negative checks, Laravel config-cache and PostgreSQL integration verification. No CHI ingestion, user tables, production database or hosted deployment has been created by this deliverable.

## Boundaries

- PostgreSQL **18** replaces the earlier proposed SQLite application-storage baseline. The existing default PHPUnit suite deliberately continues using SQLite in-memory for its existing tests; it is **not** evidence of PostgreSQL behavior.
- Two separate *application* databases: `litervia_catalogue` and `litervia_private`, with UTF8 and ICU locale `und` (language-neutral baseline, not an approved multilingual search/sort policy). The initial Windows maintenance database's `libc` locale need not be changed.
- Two **isolated integration-test** databases: `litervia_catalogue_test` and `litervia_private_test`, also UTF8/ICU `und`. They are disposable **test fixtures**, never replicas of real research/private data.
- For each database: a `NOLOGIN` owner, an application login (schema `USAGE`, no schema `CREATE`), and a migration login (schema `USAGE, CREATE`). No login has `SUPERUSER`, `CREATEDB`, `CREATEROLE` or `BYPASSRLS`. `PUBLIC` database/schema privileges are revoked; `CONNECT` is granted only to matching identities.
- No application role has blanket table permissions. Research/user schema migrations, default grants, actual data access and cross-database application transactions remain outside Issue #11. Laravel is never allowed to connect as `postgres` or a migrator during normal requests.

## One-time local setup (Windows PowerShell)

Prerequisites: installed PostgreSQL 18 server and `psql`, PHP with `pdo_pgsql`, locally owned database cluster, and a separately stored credential manager. Scripts **01, 02 and 03 are one-time, non-idempotent provisioning files** and should not be rerun after success. Never execute them against staging, production, or any shared server. Review each SQL file first. Scripts 01 and 02 now refuse a wrong maintenance database, non-loopback connection, unsupported server major version or unexpected login **before creating objects**. Script 01 also rejects an existing target database or owner role; script 02 checks database ownership plus UTF8/ICU `und` before creating application logins. Loopback alone cannot prove a server is a safe development target: confirm the cluster's identity independently before initial provisioning.

```powershell
cd C:\Dev\litervia
$psql = 'C:\Program Files\PostgreSQL\18\bin\psql.exe'
& $psql -X -h 127.0.0.1 -p 5432 -U postgres -d postgres -v ON_ERROR_STOP=1 -f.\database\provisioning\01_postgresql_databases.sql
& $psql -X -h 127.0.0.1 -p 5432 -U postgres -d postgres -v ON_ERROR_STOP=1 -f.\database\provisioning\02_postgresql_roles.sql
& $psql -X -h 127.0.0.1 -p 5432 -U postgres -d postgres -v ON_ERROR_STOP=1 -f.\database\provisioning\03_postgresql_test_databases.sql
```

**Fresh-cluster hardening (verified in disposable PR CI on PHP 8.4 and 8.5):** Script 01 now creates each application database with `ALLOW_CONNECTIONS = false`, revokes database-level `PUBLIC` permissions while connections remain disabled, verifies both databases are still closed, and then enables connections before connecting as the administrator to revoke `public` schema permissions. This avoids a setup-time window where default `PUBLIC CONNECT`/`TEMP` permissions would otherwise be active. The fresh 01→02→03 sequence passed in isolated PostgreSQL 18.6 GitHub Actions services on both PHP jobs; **do not use the existing Windows cluster for this regression check**. Mid-script failure can leave partially created objects: stop and inspect instead of rerunning.

**Existing developer setup:** All three scripts have already been executed successfully on the local Windows PostgreSQL 18.6; **do not execute them again**. The local roles have already been given distinct passwords interactively through `\password` inside `psql`.

Use the example `LITERVIA_*` variable names in `.env.example` to configure the local **private** (default) and **catalogue** runtime connections, plus four named test connections. Copy only the required variables to the ignored `.env`; keep the existing `APP_KEY`. Do not commit `.env`, exported credentials, password manager vaults or database files. Migration role passwords belong outside the ordinary Laravel `.env` and must be supplied only for separately approved migration operations.

**Never run** `php artisan migrate`, `migrate:fresh` or `db:wipe` against `litervia_catalogue` or `litervia_private` without a separately approved migration plan. This issue introduces **no** definitive research/user schema.

## Local verification (already performed unless otherwise noted)

A read-only check confirms a database's encoding/locale/owner without disclosing credentials:

```powershell
& $psql -X -h 127.0.0.1 -p 5432 -U postgres -d postgres -c "SELECT datname, pg_encoding_to_char(encoding), datlocprovider, datlocale, pg_get_userbyid(datdba) FROM pg_database WHERE datname IN ('litervia_catalogue', 'litervia_private', 'litervia_catalogue_test', 'litervia_private_test') ORDER BY datname;"
```

Database permission checks completed locally: the two application identities can connect to their own runtime DB, not the opposite one, and lack public-schema `CREATE`; both migrators successfully created a probe table **inside a rolled-back transaction** and could not connect to the opposite DB. The four testing accounts successfully connected to their respective test DBs; a test account was refused from a runtime DB. This is observed provided output, **not** an independent hostile review of PostgreSQL ACLs.

First clear config and then run the opt-in PostgreSQL integration check. It connects only to two hardcoded local test databases on `127.0.0.1`; its full config is checked before connecting.

```powershell
php artisan config:clear
$env:LITERVIA_PG_INTEGRATION = '1'
try {
 php artisan test --filter=PostgreSQLConnectionTest --fail-on-skipped --fail-on-empty-test-suite
} finally {
 Remove-Item Env:\LITERVIA_PG_INTEGRATION -ErrorAction SilentlyContinue
}
```

**Observed local results (; locally executed):** Opt-in PostgreSQL suite `6 passed (406 assertions)` including identity/privileges, rolled-back DDL permissions, four rejected cross-test-database connections, rejection of an invalid password, multilingual ICU/version probes and fail-closed configuration checks. The first run of the new password test failed due to an overly narrow PDO exception-code assertion; after correcting that assertion, all six tests passed. Ordinary Laravel suite without PostgreSQL opt-in: `20 passed (268 assertions), 5 intentionally skipped`. Pint `27 files PASS` after correcting one `class_attributes_separation` style issue. Composer strict validation, locked platform requirements and audit (no advisories), React/Vitest `20 passed`, Vite production build, npm audit (0 vulnerabilities) and `git diff --check` all passed locally. These local results are provided; GitHub Actions PostgreSQL bootstrap, configuration-cache checks and PR-head integration verification independently **passed in run #40980614901** on both PHP versions.

Do not paste `php artisan config:show database`, completed `.env`, passwords, masked token values, or pgpass files into an Issue/PR: they may reveal credentials.

## CI design and verified PR-head results

The PHP 8.4 and PHP 8.5 jobs each launch an isolated `postgres:18.6` GitHub Actions service mapped to runner-local port 5432. Its official multi-platform Docker Hub OCI index digest is pinned in the workflow (retrieved); the in-container image identity assertion uses the same literal reference. On PostgreSQL image security updates, verify the new official index digest and update both locations together. The pinned image was exercised successfully in PR-head CI on PHP 8.4 and PHP 8.5. Privileged provisioning scripts 01-03 and CI password-bootstrap now run via `docker exec` with `psql` **inside that exact service container**, selected by GitHub's `job.services.postgres.id` and checked for the expected image. SQL input is streamed through stdin, with `PGHOST=127.0.0.1` inside the container, retaining the strict PostgreSQL `inet_server_addr` loopback guard. The Laravel integration tests still run from the Ubuntu runner and connect to the isolated `_test` databases through runner-local `127.0.0.1:5432`. The workflow generates four independent ephemeral masked test-role passwords on the runner and runs the opt-in integration suite **in addition** to the ordinary Laravel suite. `.github/scripts/ci-postgresql-role-passwords.sql` reads only the ephemeral job variables and assigns a distinct password to each temporary test role. The repository contains **no local developer password** and does not require GitHub repository secrets for these throwaway service credentials. The existing Node.js 24 frontend job remains unchanged.

Cross-store denial assertions now verify from the authenticated source test connection that PostgreSQL reports `CONNECT=false` for the opposite disposable database and that the target is online; the actual opposite-database PDO attempt must still fail. This avoids coupling the test to the English phrase `permission denied for database`, which may vary by server locale or PDO/libpq. These revised assertions passed in the locally executed 6-test / 406-assertion integration run.

A new opt-in negative authentication test checks that an invalid random password is rejected by the fixed `litervia_catalogue_test_app` role against the disposable `litervia_catalogue_test` database, with successful connections immediately before and after the rejection. It does not connect to a normal application database or log credentials. The test **passed locally** in the project's 6-test/406-assertion rerun, following a correction for PDO constructor exceptions that can return a numeric driver code while carrying a `SQLSTATE[...]` prefix in the exception message. It does not depend on localized error prose. A connection-class SQLSTATE is not itself conclusive proof of the reason for failure; confirmation is limited to these controlled fixtures and surrounding positive connections.

The PostgreSQL opt-in suite additionally includes a read-only multilingual ICU probe using synthetic Latin, accented Latin, Greek and CJK `VALUES` (no schema writes). It checks stored versus actual database collation versions and verifies representative Latin/Greek ordering and cross-store consistency, but does **not** approve a final case/diacritic-aware product search policy. An always-on PHPUnit configuration-guard test injects synthetic invalid host, port, role, database and missing/empty password settings solely in memory; it makes **no** network connection. The GitHub PHP jobs also verify `config:cache` using an isolated temporary cache file, check the expected four disposable role identities and credentials without printing their values, and confirm that environment drift cannot redirect a cached test database host. That CI-only cache file is removed after the check; no local developer config cache is written by this procedure. The ICU and in-memory configuration-guard tests **passed locally and in both PHP CI jobs**; the distinct CI-only `config:cache` gate **passed in run #40980614901**.

The workflow includes **CI-only negative smoke probes** for an absent GitHub Actions indicator, an unset password and an empty password; all must fail with a nonzero exit status and an expected diagnostic before any test-role password is assigned. These probes **passed in both PHP jobs** of PR-head CI run #40980614901. The dedicated PostgreSQL integration command also requires PHPUnit to return a nonzero exit status if any integration test is skipped or if no tests are executed (`--fail-on-skipped --fail-on-empty-test-suite`); the integration step completed successfully in both jobs.

The CI-only in-container `psql` approach addresses the Docker host-versus-server address mismatch and **passed in both GitHub Actions PHP jobs**. The CI service includes empty normal-named databases *only as prerequisites of the reviewed local test bootstrap scripts*. The integration code accesses **only** its test databases, checks role identity, privileges, server encoding, ICU locale, transactional DDL permission boundaries and failed cross-store connections for both app and migrator test identities. On job completion, all service containers and their temporary databases are discarded. **Do not reuse the CI password scheme for hosted or shared PostgreSQL.**

**Limitations / follow-ups:** The expanded opt-in suite is designed to test privilege metadata, transactional CREATE permissions and actual denial of cross-store connections **between disposable `_test` databases only**. The four cross-test-database negative attempts **passed in the locally executed local PostgreSQL integration suite**; CI also executed these tests successfully, but they do not substitute for checks against production-like authorization policies. Broader password-policy cases, cross-database application write contracts and actual user-owned-table policies remain outside this negative connection check and require separately approved schemas or test contracts. Separate read-only/modifying app roles and catalogue ingestion grants will be decided with the normalization pilot. The new synthetic ICU/version probe is not a historical-source pilot, and a case/diacritic-aware final search/sort contract still requires realistic representative data and approval. The privileged SQL preflight requires server-side loopback in both local development and the in-container CI execution path; the Laravel test connections require runner-side or local host loopback.

## Recovery and safety

If a provisioning script fails, **stop** and inspect roles, databases, and privileges before deciding on a recovery plan. `CREATE DATABASE` cannot run inside a transaction, so a mid-script failure of 01 may leave some roles or databases already created; the new preflight deliberately rejects a repeat run rather than trying to reconcile partial state. No automatic teardown, `DROP DATABASE`, or rollback claim is provided. The revised one-time sequence passed on new isolated GitHub CI fixtures; any future provisioning changes must be rechecked on a newly provisioned disposable fixture, never on the already initialized local cluster. Do not rerun non-idempotent scripts or drop any databases automatically. If a role password changes, update only its corresponding local secret. If tests fail with `password authentication failed`, compare the intended role's password with its `.env` variable without printing it. If tests fail with `permission denied for database`, determine whether it is an intentionally negative check before altering grants.

**References:** [PostgreSQL 18 `CREATE DATABASE`](https://www.postgresql.org/docs/18/sql-createdatabase.html), [PostgreSQL role privileges](https://www.postgresql.org/docs/18/sql-grant.html), [psql variables](https://www.postgresql.org/docs/18/app-psql.html), [GitHub Actions PostgreSQL service](https://docs.github.com/en/actions/tutorials/use-containerized-services/create-postgresql-service-containers).
