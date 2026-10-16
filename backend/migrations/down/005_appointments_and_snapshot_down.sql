BEGIN;

DROP INDEX appointments_starts_at_idx;

ALTER TABLE appointments DROP CONSTRAINT appointments_client_no_overlap;
ALTER TABLE appointments DROP CONSTRAINT appointments_master_no_overlap;

DROP TABLE appointment_snapshots;

ALTER TABLE appointments DROP COLUMN status;

COMMIT;