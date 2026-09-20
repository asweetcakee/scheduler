BEGIN;

DROP INDEX IF EXISTS services_name_unique_ci;
DELETE FROM schema_migrations WHERE version = '002_services_name_unique';

COMMIT;