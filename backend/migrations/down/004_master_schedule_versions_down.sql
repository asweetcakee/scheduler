BEGIN;

-- ALL data will be erased. An old version 003 holds only 1 entity of schedule unlike 004
-- Each master holds the most latest schedule based on effective_from
-- Intervals of deleted versions will be erased (ON DELETE CASCADE)
DELETE FROM master_schedule_versions AS v
WHERE v.effective_from < (
    SELECT MAX(v2.effective_from)
    FROM master_schedule_versions AS v2
    WHERE v2.master_id = v.master_id
);

-- Add master_id column back as nullable, due to the table having active rows
ALTER TABLE master_schedule_intervals
ADD COLUMN master_id BIGINT;

-- Fill in master_id from versions
UPDATE master_schedule_intervals AS i
SET master_id = v.master_id
FROM master_schedule_versions AS v
WHERE i.schedule_version_id = v.id;

-- Verify, rows w/o master_id will raise and exception
DO $$
DECLARE
    null_count integer;
BEGIN
    SELECT COUNT(*)
    INTO null_count
    FROM master_schedule_intervals
    WHERE master_id IS NULL;

    IF null_count > 0 THEN
        RAISE EXCEPTION 'Down terminated: found % NULL rows in master_id', null_count;
    END IF;
END $$;

-- Tighten, NOT NULL and FK on intervals master are back
ALTER TABLE master_schedule_intervals
ALTER COLUMN master_id SET NOT NULL;

ALTER TABLE master_schedule_intervals
ADD CONSTRAINT master_schedule_intervals_master_id_fkey
FOREIGN KEY (master_id) REFERENCES masters(id);

-- Restores 003 EXCLUDE CONSTRAINT (master_id, day_of_week)
ALTER TABLE master_schedule_intervals
ADD CONSTRAINT master_schedule_intervals_master_id_day_of_week_numrange_excl
EXCLUDE USING gist (
    master_id WITH =,
    day_of_week WITH =,
    numrange(
        EXTRACT (EPOCH FROM starts_at)::numeric,
        EXTRACT (EPOCH FROM ends_at)::numeric,
        '[)'
    ) WITH &&
);

CREATE INDEX idx_master_schedule_intervals_master_day
    ON master_schedule_intervals (master_id, day_of_week);

-- Removes 004 CONSTRAINT, COLUMN and TABLE
ALTER TABLE master_schedule_intervals
DROP CONSTRAINT master_schedule_intervals_no_overlap;

ALTER TABLE master_schedule_intervals
DROP COLUMN schedule_version_id;

DROP TABLE master_schedule_versions;

-- Removes 004 migration out of history
DELETE FROM schema_migrations
WHERE version = '004_master_schedule_versions';

COMMIT;