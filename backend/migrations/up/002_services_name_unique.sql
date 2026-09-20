BEGIN;

CREATE UNIQUE INDEX services_name_unique_ci ON services (LOWER(name));
INSERT INTO schema_migrations(version) VALUES ('002_services_name_unique') ON CONFLICT (version) DO NOTHING;

COMMIT;