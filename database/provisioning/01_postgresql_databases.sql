-- Litervia Issue #11: local PostgreSQL 18 foundation.
-- Review before first use. Run exactly once via TCP 127.0.0.1 against the
-- local PostgreSQL 18 postgres maintenance database as the postgres login.
-- Fail before mutations when target databases OR owner roles already exist.
-- It does NOT create application tables, login roles, or store passwords.
-- psql-specific commands below require psql (not pgAdmin Query Tool).
\set ON_ERROR_STOP on

-- Validate the one-time target before creating cluster-global roles/databases.
-- A loopback address is a safety check, not proof that this cluster is disposable.
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
    IF session_user <> 'postgres' THEN
        RAISE EXCEPTION 'Expected postgres administrator login; found %', session_user;
    END IF;
    IF EXISTS (
        SELECT 1 FROM pg_database
        WHERE datname IN ('litervia_catalogue', 'litervia_private')
    ) THEN
        RAISE EXCEPTION 'A target application database already exists; inspect before rerunning';
    END IF;
    IF EXISTS (
        SELECT 1 FROM pg_roles
        WHERE rolname IN ('litervia_catalogue_owner', 'litervia_private_owner')
    ) THEN
        RAISE EXCEPTION 'A target application owner role already exists; inspect before rerunning';
    END IF;
END
$$;

-- Separate, non-login database owners: the Laravel application must never
-- connect as these roles or as the postgres superuser.
-- Both owner roles are created atomically. CREATE DATABASE is separately
-- committed by PostgreSQL and cannot be wrapped in this transaction.
BEGIN;
CREATE ROLE litervia_catalogue_owner NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
CREATE ROLE litervia_private_owner NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
COMMIT;

-- ICU 'und' (undetermined / language-neutral) is a baseline for a multilingual
-- catalogue, not a final decision on search normalization or locale-aware UI sorting.
-- TEMPLATE template0 avoids copying installation-specific template1 objects.
CREATE DATABASE litervia_catalogue
    WITH OWNER = litervia_catalogue_owner
         TEMPLATE = template0
         ENCODING = 'UTF8'
         LOCALE_PROVIDER = icu
         ICU_LOCALE = 'und'
         ALLOW_CONNECTIONS = false;

CREATE DATABASE litervia_private
    WITH OWNER = litervia_private_owner
         TEMPLATE = template0
         ENCODING = 'UTF8'
         LOCALE_PROVIDER = icu
         ICU_LOCALE = 'und'
         ALLOW_CONNECTIONS = false;

-- PostgreSQL otherwise grants CONNECT and TEMPORARY on a new database to PUBLIC.
-- Create both databases with ALLOW_CONNECTIONS=false, then revoke PUBLIC
-- before enabling connections. No application/migrator LOGIN role exists yet.
REVOKE ALL ON DATABASE litervia_catalogue FROM PUBLIC;
REVOKE ALL ON DATABASE litervia_private FROM PUBLIC;

-- Assert that neither database accepted connections while the default
-- PUBLIC grants were being removed. Fail closed on an unexpected state.
DO $$
BEGIN
    IF (
        SELECT count(*)
        FROM pg_database
        WHERE datname IN ('litervia_catalogue', 'litervia_private')
          AND NOT datallowconn
    ) <> 2 THEN
        RAISE EXCEPTION 'Both new application databases must remain closed during privilege revocation';
    END IF;
END
$$;

-- Only the postgres administrator connects at this stage: script 02 has not
-- created any application or migrator LOGIN roles yet. Database-level PUBLIC
-- CONNECT and TEMPORARY have already been revoked.
ALTER DATABASE litervia_catalogue ALLOW_CONNECTIONS true;
ALTER DATABASE litervia_private ALLOW_CONNECTIONS true;

-- Public schema usage is granted to PUBLIC by default. Remove it in each store;
-- later we will grant named, narrowly scoped roles the rights they need.
\connect litervia_catalogue
REVOKE ALL ON SCHEMA public FROM PUBLIC;

\connect litervia_private
REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- Verification query uses the shared pg_database catalog.
SELECT datname,
       pg_encoding_to_char(encoding) AS encoding,
       datlocprovider AS locale_provider,
       datlocale AS icu_locale,
       pg_get_userbyid(datdba) AS owner
FROM pg_database
WHERE datname IN ('litervia_catalogue', 'litervia_private')
ORDER BY datname;
