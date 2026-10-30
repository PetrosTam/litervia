-- Litervia Issue #11 — PostgreSQL 18 local role / privilege bootstrap.
-- Requires successful completion of 01_postgresql_databases.sql.
-- Execute ONCE, with psql -X -v ON_ERROR_STOP=1, as local postgres against
-- the 'postgres' maintenance database. Never run against production.
-- This file contains NO secrets; it intentionally creates login roles with
-- NULL passwords. Set four separate passwords interactively with \password
-- after successful execution. Do not use postgres or owner roles in Laravel.
-- Existing research tables and user-data tables are NOT created or modified.
\set ON_ERROR_STOP on

-- Fail before any mutations if the connection or prerequisites are wrong.
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
    IF (
        SELECT count(*) FROM pg_database AS db
        JOIN pg_roles AS owner_role ON owner_role.oid = db.datdba
        WHERE ((db.datname = 'litervia_catalogue' AND owner_role.rolname = 'litervia_catalogue_owner')
            OR (db.datname = 'litervia_private' AND owner_role.rolname = 'litervia_private_owner'))
          AND pg_encoding_to_char(db.encoding) = 'UTF8'
          AND db.datlocprovider = 'i'
          AND db.datlocale = 'und'
    ) <> 2 THEN
        RAISE EXCEPTION 'Expected both UTF8/ICU und application databases with their dedicated owners; run/review script 01';
    END IF;
    IF EXISTS (
        SELECT 1 FROM pg_roles
        WHERE rolname IN (
            'litervia_catalogue_app', 'litervia_catalogue_migrator',
            'litervia_private_app', 'litervia_private_migrator'
        )
    ) THEN
        RAISE EXCEPTION 'One or more target roles already exist; inspect before rerunning';
    END IF;
END
$$;

-- The application identities have no superuser, database creation, role
-- creation, replication, bypass-RLS, or inherited role privileges.
-- NULL password prevents password authentication until the owner sets a secret.
BEGIN;
CREATE ROLE litervia_catalogue_app
    LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION
    NOBYPASSRLS PASSWORD NULL;
CREATE ROLE litervia_catalogue_migrator
    LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION
    NOBYPASSRLS PASSWORD NULL;
CREATE ROLE litervia_private_app
    LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION
    NOBYPASSRLS PASSWORD NULL;
CREATE ROLE litervia_private_migrator
    LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION
    NOBYPASSRLS PASSWORD NULL;

-- Grant CONNECT only to the matching store. Never grant TEMP or CREATE on
-- database level. PUBLIC database CONNECT was revoked in step 01.
GRANT CONNECT ON DATABASE litervia_catalogue
    TO litervia_catalogue_app, litervia_catalogue_migrator;
GRANT CONNECT ON DATABASE litervia_private
    TO litervia_private_app, litervia_private_migrator;
COMMIT;

-- The migrator can create tables in its own store. The application can only
-- look up objects explicitly granted to it later. Deliberately no blanket
-- GRANT on tables/sequences or ALTER DEFAULT PRIVILEGES: such grants could
-- expose future migrations, ingestion staging or sensitive internal tables.
\connect litervia_catalogue
BEGIN;
GRANT USAGE ON SCHEMA public TO litervia_catalogue_app;
GRANT USAGE, CREATE ON SCHEMA public TO litervia_catalogue_migrator;
COMMIT;

\connect litervia_private
BEGIN;
GRANT USAGE ON SCHEMA public TO litervia_private_app;
GRANT USAGE, CREATE ON SCHEMA public TO litervia_private_migrator;
COMMIT;

\connect postgres
-- Expected: each app/migrator CONNECT=true only for its matching store;
-- CONNECT=false for the other store. All four roles have rolpassword NULL.
SELECT rolname,
       rolcanlogin,
       rolcreatedb,
       rolcreaterole,
       rolsuper,
       rolbypassrls,
       (rolpassword IS NULL) AS password_not_set
FROM pg_authid
WHERE rolname IN (
    'litervia_catalogue_app', 'litervia_catalogue_migrator',
    'litervia_private_app', 'litervia_private_migrator'
)
ORDER BY rolname;

SELECT rolname,
       has_database_privilege(rolname, 'litervia_catalogue', 'CONNECT') AS catalogue_connect,
       has_database_privilege(rolname, 'litervia_private', 'CONNECT') AS private_connect
FROM pg_roles
WHERE rolname IN (
    'litervia_catalogue_app', 'litervia_catalogue_migrator',
    'litervia_private_app', 'litervia_private_migrator'
)
ORDER BY rolname;
