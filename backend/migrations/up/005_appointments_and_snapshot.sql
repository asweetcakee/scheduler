BEGIN;

-- Expand
ALTER TABLE appointments
ADD COLUMN status TEXT NOT NULL DEFAULT 'scheduled'
CHECK (status IN ('scheduled', 'completed', 'cancelled'));

CREATE TABLE appointment_snapshots (
    appointment_id BIGINT PRIMARY KEY REFERENCES appointments(id) ON DELETE CASCADE,
    client_name VARCHAR(200) NOT NULL,
    client_phone VARCHAR(15) NOT NULL,
    master_name VARCHAR(200) NOT NULL,
    master_phone VARCHAR(15) NOT NULL,
    master_active_at_booking BOOLEAN NOT NULL,
    service_name VARCHAR(200) NOT NULL,
    service_default_price NUMERIC(12, 2) NOT NULL CHECK(service_default_price >= 0),
    service_default_duration INTEGER NOT NULL CHECK (service_default_duration > 0)
);

-- Backfill
INSERT INTO appointment_snapshots(
    appointment_id,
    client_name,
    client_phone,
    master_name,
    master_phone,
    master_active_at_booking,
    service_name,
    service_default_price,
    service_default_duration
)
SELECT
    a.id,
    c.name,
    c.phone,
    m.name,
    m.phone,
    m.active,
    s.name,
    s.price,
    s.duration
FROM appointments AS a
JOIN clients AS c ON c.id = a.client_id
JOIN masters AS m ON m.id = a.master_id
JOIN services AS s ON s.id = a.service_id;

-- Verify
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM appointments AS a
        LEFT JOIN appointment_snapshots AS s
            ON s.appointment_id = a.id
        WHERE s.appointment_id IS NULL
    ) THEN
        RAISE EXCEPTION
            'Snapshot backfill incomplete: one or more appointments have no snapshot';
    END IF;
END
$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM appointments AS a
        JOIN appointments AS b
            ON a.id < b.id
           AND a.master_id = b.master_id
        WHERE a.status <> 'cancelled'
          AND b.status <> 'cancelled'
          AND tstzrange(a.starts_at, a.ends_at, '[)')
              && tstzrange(b.starts_at, b.ends_at, '[)')
    ) THEN
        RAISE EXCEPTION
            'Migration aborted: existing appointments overlap for the same Master';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM appointments AS a
        JOIN appointments AS b
            ON a.id < b.id
           AND a.client_id = b.client_id
        WHERE a.status <> 'cancelled'
          AND b.status <> 'cancelled'
          AND tstzrange(a.starts_at, a.ends_at, '[)')
              && tstzrange(b.starts_at, b.ends_at, '[)')
    ) THEN
        RAISE EXCEPTION
            'Migration aborted: existing appointments overlap for the same Client';
    END IF;
END
$$;

-- Tighten
ALTER TABLE appointments
ADD CONSTRAINT appointments_master_no_overlap
EXCLUDE USING gist(
    master_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
)
WHERE (status <> 'cancelled');

ALTER TABLE appointments
ADD CONSTRAINT appointments_client_no_overlap
EXCLUDE USING gist(
    client_id WITH =,
    tstzrange(starts_at, ends_at, '[)') WITH &&
)
WHERE (status <> 'cancelled');

CREATE INDEX appointments_starts_at_idx ON appointments(starts_at);

COMMIT;