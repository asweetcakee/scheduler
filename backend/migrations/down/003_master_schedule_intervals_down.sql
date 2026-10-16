BEGIN;

DROP INDEX IF EXISTS idx_master_schedule_intervals_master_day;
DROP TABLE IF EXISTS master_schedule_intervals;

COMMIT;