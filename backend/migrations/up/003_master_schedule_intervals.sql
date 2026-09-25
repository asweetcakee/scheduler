BEGIN;

CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE master_schedule_intervals (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    master_id BIGINT NOT NULL REFERENCES masters(id),
    day_of_week SMALLINT NOT NULL,
    starts_at TIME NOT NULL,
    ends_at TIME NOT NULL,

    CHECK (day_of_week BETWEEN 1 AND 7),
    CHECK (starts_at < ends_at),

    EXCLUDE USING gist (
        master_id WITH =,
        day_of_week WITH =,
        numrange(
            EXTRACT(EPOCH FROM starts_at)::numeric,
            EXTRACT(EPOCH FROM ends_at)::numeric,
            '[)'
        ) WITH &&
    )
);

CREATE INDEX idx_master_schedule_intervals_master_day
    ON master_schedule_intervals (master_id, day_of_week);

COMMIT;