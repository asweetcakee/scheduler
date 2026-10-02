BEGIN;

-- Expand
CREATE TABLE master_schedule_versions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    master_id BIGINT NOT NULL REFERENCES masters(id),
    effective_from DATE NOT NULL,

    UNIQUE(master_id, effective_from)
);

-- NOT NULL is not added to schedule_version_id YET, due to the table having active rows
ALTER TABLE master_schedule_intervals
ADD COLUMN schedule_version_id BIGINT
    REFERENCES master_schedule_versions(id)
    ON DELETE CASCADE;

-- 2. Backfill
-- moving data and fix the date as '2026-10-01' to make the migration idempotent and reproducible
INSERT INTO master_schedule_versions (master_id, effective_from)
SELECT DISTINCT master_id, '2026-10-01'::date
FROM master_schedule_intervals;

UPDATE master_schedule_intervals AS i
SET schedule_version_id = v.id
FROM master_schedule_versions AS v
WHERE i.master_id = v.master_id;

-- 3. Verify
-- in case there are intervals w/o a version, migration will raise an exception
DO $$
DECLARE
    null_count integer;
BEGIN
    SELECT COUNT(*)
    INTO null_count
    FROM master_schedule_intervals
    WHERE schedule_version_id IS NULL;

    IF null_count > 0 THEN
        RAISE EXCEPTION 'Migration terminated: found % NULL rows in schedule_version_id', null_count;
    END IF;
END $$;

-- 4. Tighten
ALTER TABLE master_schedule_intervals
ALTER COLUMN schedule_version_id SET NOT NULL;

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE master_schedule_intervals
ADD CONSTRAINT master_schedule_intervals_no_overlap
EXCLUDE USING gist (
    schedule_version_id WITH =,
    day_of_week WITH =,
    numrange(
        EXTRACT (EPOCH FROM starts_at)::numeric,
        EXTRACT (EPOCH FROM ends_at)::numeric,
        '[)'
    ) WITH &&
);

-- 5. Contract
-- delete old entries
ALTER TABLE master_schedule_intervals
DROP CONSTRAINT master_schedule_intervals_master_id_day_of_week_numrange_excl;

DROP INDEX idx_master_schedule_intervals_master_day;

ALTER TABLE master_schedule_intervals
DROP CONSTRAINT master_schedule_intervals_master_id_fkey;

ALTER TABLE master_schedule_intervals
DROP COLUMN master_id;

-- Fix the new migration into table
INSERT INTO schema_migrations (version)
VALUES ('004_master_schedule_versions');

COMMIT;