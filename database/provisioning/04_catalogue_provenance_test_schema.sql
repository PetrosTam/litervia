-- Research catalogue: isolated-test-only schema setup; NOT runtime provisioning.
-- Prerequisites: the already initialized Litervia PostgreSQL 18 test database and roles.
-- Execute only after checking the intended local cluster identity.
-- This file is intentionally non-idempotent; do NOT rerun after it succeeds.
\set ON_ERROR_STOP on
\connect litervia_catalogue_test

BEGIN;
DO $$
BEGIN
    IF current_database() <> 'litervia_catalogue_test'
       OR current_user <> 'postgres'
       OR inet_server_addr() IS DISTINCT FROM inet '127.0.0.1'
       OR current_setting('server_version_num')::integer / 10000 <> 18 THEN
        RAISE EXCEPTION 'Research catalogue test-schema bootstrap refused: wrong database, identity, host or PostgreSQL major version';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'research') THEN
        RAISE EXCEPTION 'research schema already exists: inspect; do not rerun';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'litervia_catalogue_test_owner')
       OR NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'litervia_catalogue_test_migrator')
       OR NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'litervia_catalogue_test_app') THEN
        RAISE EXCEPTION 'Expected disposable Litervia catalogue test roles are missing';
    END IF;

    IF has_database_privilege('litervia_catalogue_test_app', 'litervia_catalogue_test', 'CREATE')
       OR has_database_privilege('litervia_catalogue_test_migrator', 'litervia_catalogue_test', 'CREATE') THEN
        RAISE EXCEPTION 'Unexpected database-level CREATE grant';
    END IF;
END
$$;

CREATE SCHEMA research AUTHORIZATION litervia_catalogue_test_owner;
REVOKE ALL ON SCHEMA research FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA research TO litervia_catalogue_test_migrator;

DO $$
BEGIN
    IF NOT has_schema_privilege('litervia_catalogue_test_migrator', 'research', 'CREATE')
       OR has_schema_privilege('litervia_catalogue_test_app', 'research', 'USAGE')
       OR has_schema_privilege('litervia_catalogue_test_app', 'research', 'CREATE') THEN
        RAISE EXCEPTION 'Research catalogue test research schema privilege mismatch';
    END IF;
END
$$;
COMMIT;
