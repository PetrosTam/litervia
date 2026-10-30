-- GitHub Actions ONLY: assign ephemeral service-role passwords, never local/production secrets.
-- The CI runner supplies four separately generated role passwords via masked job variables.
-- Requires the disposable PostgreSQL 18 service and provisioning scripts 01-03.
-- PostgreSQL psql's \getenv and safely quoted SQL literals are required.
\set ON_ERROR_STOP on
\getenv ci_catalogue_test_app_password LITERVIA_CATALOGUE_TEST_APP_PASSWORD
\getenv ci_catalogue_test_migrator_password LITERVIA_CATALOGUE_TEST_MIGRATOR_PASSWORD
\getenv ci_private_test_app_password LITERVIA_PRIVATE_TEST_APP_PASSWORD
\getenv ci_private_test_migrator_password LITERVIA_PRIVATE_TEST_MIGRATOR_PASSWORD
\getenv ci_indicator GITHUB_ACTIONS
\if :{?ci_indicator}
\else
    DO $$ BEGIN RAISE EXCEPTION 'Refusing to rotate test credentials outside GitHub Actions'; END $$;
\endif
\if :ci_indicator
\else
    DO $$ BEGIN RAISE EXCEPTION 'Refusing to rotate test credentials outside GitHub Actions'; END $$;
\endif

\if :{?ci_catalogue_test_app_password}
\else
    DO $$ BEGIN RAISE EXCEPTION 'Missing catalogue app CI password'; END $$;
\endif
\if :{?ci_catalogue_test_migrator_password}
\else
    DO $$ BEGIN RAISE EXCEPTION 'Missing catalogue migrator CI password'; END $$;
\endif
\if :{?ci_private_test_app_password}
\else
    DO $$ BEGIN RAISE EXCEPTION 'Missing private app CI password'; END $$;
\endif
\if :{?ci_private_test_migrator_password}
\else
    DO $$ BEGIN RAISE EXCEPTION 'Missing private migrator CI password'; END $$;
\endif

-- Reject empty passwords as well as missing variables. An empty PostgreSQL
-- password would disable password authentication for that role.
-- Only the boolean result enters a psql variable; never echo secrets.
SELECT (
    length(:'ci_catalogue_test_app_password') > 0
    AND length(:'ci_catalogue_test_migrator_password') > 0
    AND length(:'ci_private_test_app_password') > 0
    AND length(:'ci_private_test_migrator_password') > 0
) AS ci_passwords_nonempty
\gset
\if :ci_passwords_nonempty
\else
    DO $$ BEGIN RAISE EXCEPTION 'One or more CI test role passwords are empty'; END $$;
\endif

-- Fail before mutations unless connected to the CI-only localhost service.
DO $$
BEGIN
    IF current_database() <> 'postgres'
       OR inet_server_addr() IS DISTINCT FROM inet '127.0.0.1'
       OR current_setting('server_version_num')::integer / 10000 <> 18 THEN
        RAISE EXCEPTION 'Refusing CI role bootstrap outside local PostgreSQL 18 maintenance database';
    END IF;
    IF (SELECT COUNT(*) FROM pg_database WHERE datname IN
        ('litervia_catalogue_test', 'litervia_private_test')) <> 2 THEN
        RAISE EXCEPTION 'Expected both disposable test databases';
    END IF;
    IF (SELECT COUNT(*) FROM pg_roles WHERE rolname IN
        ('litervia_catalogue_test_app', 'litervia_catalogue_test_migrator',
         'litervia_private_test_app', 'litervia_private_test_migrator')) <> 4 THEN
        RAISE EXCEPTION 'Expected four disposable test roles';
    END IF;
END
$$;

-- Each test role receives its own ephemeral password. format(%L) escapes
-- values as SQL literals; \gexec executes without printing password values.
-- These roles have no privileges on normal catalogue/private databases.
SELECT format('ALTER ROLE %I PASSWORD %L',
              'litervia_catalogue_test_app', :'ci_catalogue_test_app_password')
\gexec
SELECT format('ALTER ROLE %I PASSWORD %L',
              'litervia_catalogue_test_migrator', :'ci_catalogue_test_migrator_password')
\gexec
SELECT format('ALTER ROLE %I PASSWORD %L',
              'litervia_private_test_app', :'ci_private_test_app_password')
\gexec
SELECT format('ALTER ROLE %I PASSWORD %L',
              'litervia_private_test_migrator', :'ci_private_test_migrator_password')
\gexec
