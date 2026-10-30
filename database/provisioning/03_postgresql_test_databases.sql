-- Litervia Issue #11 — isolated LOCAL PostgreSQL 18 integration-test databases.
-- Requires 01_postgresql_databases.sql and 02_postgresql_roles.sql.
-- Review before use. Run ONCE with psql -X -v ON_ERROR_STOP=1 against
-- the local 'postgres' maintenance database as postgres administrator.
-- This script creates no research or user-data tables and contains NO passwords.
-- Test identities must never be configured for the normal Litervia databases.
-- Do not use this local provisioning script on production or a shared server.
\set ON_ERROR_STOP on

-- Fail before any changes if the target is not the expected local PostgreSQL 18
-- installation or the requested test names already exist. There is deliberately
-- no DROP DATABASE or CREATE ... IF NOT EXISTS: never silently reuse a database.
DO $$
BEGIN
    IF current_database() <> 'postgres' THEN
        RAISE EXCEPTION 'Expected postgres maintenance database; found %', current_database();
    END IF;
    IF inet_server_addr() IS DISTINCT FROM inet '127.0.0.1' THEN
        RAISE EXCEPTION 'Expected TCP connection to local IPv4 127.0.0.1; found %', inet_server_addr();
    END IF;
    IF current_setting('server_version_num')::integer / 10000 <> 18 THEN
        RAISE EXCEPTION 'Designed for PostgreSQL 18, found %', current_setting('server_version');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'litervia_catalogue')
       OR NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'litervia_private') THEN
        RAISE EXCEPTION 'Expected both normal Litervia databases to exist';
    END IF;
    IF EXISTS (
        SELECT 1 FROM pg_database
        WHERE datname IN ('litervia_catalogue_test', 'litervia_private_test')
    ) THEN
        RAISE EXCEPTION 'A target test database already exists; inspect before proceeding';
    END IF;
    IF EXISTS (
        SELECT 1 FROM pg_roles
        WHERE rolname IN (
            'litervia_catalogue_test_owner', 'litervia_private_test_owner',
            'litervia_catalogue_test_app', 'litervia_catalogue_test_migrator',
            'litervia_private_test_app', 'litervia_private_test_migrator'
        )
    ) THEN
        RAISE EXCEPTION 'A target test role already exists; inspect before proceeding';
    END IF;
END
$$;

-- Separate NOLOGIN database owners and dedicated test-only login identities.
-- Passwords intentionally remain unset until supplied interactively via psql.
BEGIN;
CREATE ROLE litervia_catalogue_test_owner
    NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
CREATE ROLE litervia_private_test_owner
    NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;

CREATE ROLE litervia_catalogue_test_app
    LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION
    NOBYPASSRLS PASSWORD NULL;
CREATE ROLE litervia_catalogue_test_migrator
    LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION
    NOBYPASSRLS PASSWORD NULL;
CREATE ROLE litervia_private_test_app
    LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION
    NOBYPASSRLS PASSWORD NULL;
CREATE ROLE litervia_private_test_migrator
    LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION
    NOBYPASSRLS PASSWORD NULL;
COMMIT;

-- Start with connections disabled until default PUBLIC CONNECT/TEMP rights
-- have been removed. template0 allows choosing ICU irrespective of template1.
CREATE DATABASE litervia_catalogue_test
    WITH OWNER = litervia_catalogue_test_owner
         TEMPLATE = template0
         ENCODING = 'UTF8'
         LOCALE_PROVIDER = icu
         ICU_LOCALE = 'und'
         ALLOW_CONNECTIONS = false;
CREATE DATABASE litervia_private_test
    WITH OWNER = litervia_private_test_owner
         TEMPLATE = template0
         ENCODING = 'UTF8'
         LOCALE_PROVIDER = icu
         ICU_LOCALE = 'und'
         ALLOW_CONNECTIONS = false;

REVOKE ALL ON DATABASE litervia_catalogue_test FROM PUBLIC;
REVOKE ALL ON DATABASE litervia_private_test FROM PUBLIC;
GRANT CONNECT ON DATABASE litervia_catalogue_test
    TO litervia_catalogue_test_app, litervia_catalogue_test_migrator;
GRANT CONNECT ON DATABASE litervia_private_test
    TO litervia_private_test_app, litervia_private_test_migrator;
ALTER DATABASE litervia_catalogue_test ALLOW_CONNECTIONS true;
ALTER DATABASE litervia_private_test ALLOW_CONNECTIONS true;

-- Restrict schema access; migrations have CREATE but app roles do not.
\connect litervia_catalogue_test
BEGIN;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO litervia_catalogue_test_app;
GRANT USAGE, CREATE ON SCHEMA public TO litervia_catalogue_test_migrator;
COMMIT;

\connect litervia_private_test
BEGIN;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO litervia_private_test_app;
GRANT USAGE, CREATE ON SCHEMA public TO litervia_private_test_migrator;
COMMIT;

\connect postgres
-- Expected two UTF8/ICU 'und' test databases, owned by their NOLOGIN roles.
SELECT datname,
       pg_encoding_to_char(encoding) AS encoding,
       datlocprovider AS locale_provider,
       datlocale AS icu_locale,
       pg_get_userbyid(datdba) AS owner
FROM pg_database
WHERE datname IN ('litervia_catalogue_test', 'litervia_private_test')
ORDER BY datname;

-- Expected: only each matching test role can CONNECT to each test database.
SELECT rolname,
       has_database_privilege(rolname, 'litervia_catalogue_test', 'CONNECT') AS catalogue_test_connect,
       has_database_privilege(rolname, 'litervia_private_test', 'CONNECT') AS private_test_connect,
       has_database_privilege(rolname, 'litervia_catalogue', 'CONNECT') AS normal_catalogue_connect,
       has_database_privilege(rolname, 'litervia_private', 'CONNECT') AS normal_private_connect
FROM pg_roles
WHERE rolname IN (
    'litervia_catalogue_test_app', 'litervia_catalogue_test_migrator',
    'litervia_private_test_app', 'litervia_private_test_migrator'
)
ORDER BY rolname;
