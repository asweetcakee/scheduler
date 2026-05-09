-- ============================================================
-- IMPORTANT: Add this to db.js on every connection, before 
-- anything else runs:
--   db.pragma('foreign_keys = ON')
-- SQLite ignores all FK constraints without this
-- ============================================================


CREATE TABLE IF NOT EXISTS clients (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  phone       TEXT    NOT NULL UNIQUE
                        CHECK(length(phone) >= 7 AND length(phone) <= 15),
  isRegular   BOOLEAN NOT NULL DEFAULT 0 CHECK(isRegular  IN (0, 1)),
  isAllergic  BOOLEAN NOT NULL DEFAULT 0 CHECK(isAllergic IN (0, 1)),
  createdAt   TEXT NOT NULL DEFAULT (datetime('now'))
);


CREATE TABLE IF NOT EXISTS staff (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT    NOT NULL,
  phone          TEXT    NOT NULL UNIQUE
                         CHECK(length(phone) >= 7 AND length(phone) <= 15),
  isActive       BOOLEAN NOT NULL DEFAULT 1 CHECK(isActive IN (0, 1))
);

CREATE TABLE IF NOT EXISTS specializations (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS staff_specializations (
  staffId          INTEGER NOT NULL,
  specializationId INTEGER NOT NULL,
  PRIMARY KEY (staffId, specializationId),
  FOREIGN KEY (staffId)          REFERENCES staff(id)           ON DELETE CASCADE,
  FOREIGN KEY (specializationId) REFERENCES specializations(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS services (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  name     TEXT    NOT NULL UNIQUE,
  duration INTEGER NOT NULL CHECK(duration >= 5),  -- minutes, 5 is shortest bookable slot
  price    INTEGER NOT NULL CHECK(price > 0),       -- stored in tiyns, never zero 500050 = 5000.50
  isActive BOOLEAN NOT NULL DEFAULT 1 CHECK(isActive IN (0, 1))
);


CREATE TABLE IF NOT EXISTS appointments (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  clientId      INTEGER,                            -- NULL = anonymous booking
  staffId       INTEGER NOT NULL,
  date          TEXT    NOT NULL,                   -- store as 'YYYY-MM-DD'
  startTime     TEXT    NOT NULL,                   -- store as 'HH:MM'
  endTime       TEXT    NOT NULL CHECK(endTime > startTime),
  actualRevenue INTEGER NOT NULL CHECK(actualRevenue >= 0), -- in tiyns, 0 = fully comped
  status        TEXT    NOT NULL DEFAULT 'scheduled'
                        CHECK(status IN ('scheduled', 'completed', 'cancelled')),
  isConfirmed   BOOLEAN NOT NULL DEFAULT 0 CHECK(isConfirmed IN (0, 1)),
  isAnonymous   BOOLEAN GENERATED ALWAYS AS (clientId IS NULL) STORED,
  createdAt     TEXT    NOT NULL DEFAULT (datetime('now')),
  adminNotes    TEXT,
  FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE RESTRICT,
  FOREIGN KEY (staffId)  REFERENCES staff(id)   ON DELETE RESTRICT
);

-- UNIQUE constraint removed from (appointmentId, serviceId) to support 'Line Item' logic
-- Needed for edge cases where one appointment has the same service twice
-- (e.g., Mother + Child haircuts, or two separate nail repairs)
CREATE TABLE IF NOT EXISTS appointment_services (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  appointmentId     INTEGER NOT NULL,
  serviceId         INTEGER NOT NULL,
  serviceName       TEXT NOT NULL,
  catalogDuration   INTEGER NOT NULL CHECK(catalogDuration >= 5),
  catalogPrice      INTEGER NOT NULL CHECK(catalogPrice > 0),    -- snapshot of services.price at booking time
  appliedDiscount   INTEGER NOT NULL DEFAULT 0
                    CHECK(appliedDiscount BETWEEN 0 AND 100),    -- whole % only
  actualChargedPrice INTEGER NOT NULL CHECK(actualChargedPrice >= 0), -- 0 = fully discounted
  FOREIGN KEY (appointmentId) REFERENCES appointments(id) ON DELETE CASCADE,  -- line items die with appointment
  FOREIGN KEY (serviceId)     REFERENCES services(id)     ON DELETE RESTRICT -- protect historical rows
);


CREATE TABLE IF NOT EXISTS client_discounts (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  clientId        INTEGER NOT NULL,
  serviceId       INTEGER NOT NULL,
  discountPercent INTEGER NOT NULL CHECK(discountPercent BETWEEN 0 AND 100),
  FOREIGN KEY (clientId)  REFERENCES clients(id)  ON DELETE CASCADE,  -- discount gone if client deleted
  FOREIGN KEY (serviceId) REFERENCES services(id) ON DELETE RESTRICT,
  UNIQUE(clientId, serviceId)
);


CREATE TABLE IF NOT EXISTS staff_schedules (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  staffId     INTEGER NOT NULL,
  date        TEXT    NOT NULL,               -- 'YYYY-MM-DD'
  shiftStart  TEXT    NOT NULL,               -- 'HH:MM'
  shiftEnd    TEXT    NOT NULL CHECK(shiftEnd > shiftStart),
  isCancelled BOOLEAN NOT NULL DEFAULT 0 CHECK(isCancelled IN (0, 1)),
  notes       TEXT,
  FOREIGN KEY (staffId) REFERENCES staff(id) ON DELETE RESTRICT,
  UNIQUE(staffId, date)
);