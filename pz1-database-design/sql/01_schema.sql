PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS payment;
DROP TABLE IF EXISTS rental;
DROP TABLE IF EXISTS tariff;
DROP TABLE IF EXISTS client;
DROP TABLE IF EXISTS bicycle;
DROP TABLE IF EXISTS station;
DROP TABLE IF EXISTS district;

CREATE TABLE district (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    population  INTEGER NOT NULL CHECK (population > 0),
    area_km2    REAL    NOT NULL CHECK (area_km2 > 0),
    is_central  INTEGER NOT NULL DEFAULT 0 CHECK (is_central IN (0, 1))
);

CREATE TABLE station (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    district_id  INTEGER NOT NULL,
    name         TEXT    NOT NULL,
    address      TEXT    NOT NULL,
    capacity     INTEGER NOT NULL CHECK (capacity BETWEEN 4 AND 60),
    latitude     REAL    NOT NULL CHECK (latitude  BETWEEN -90  AND 90),
    longitude    REAL    NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    opened_on    TEXT    NOT NULL CHECK (opened_on IS date(opened_on)),

    CONSTRAINT uq_station_name_in_district UNIQUE (district_id, name),
    CONSTRAINT fk_station_district FOREIGN KEY (district_id)
        REFERENCES district (id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE bicycle (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    serial_number   TEXT    NOT NULL UNIQUE,
    model           TEXT    NOT NULL,
    kind            TEXT    NOT NULL CHECK (kind IN ('city', 'electric', 'cargo', 'teen')),
    home_station_id INTEGER NOT NULL,
    purchased_on    TEXT    NOT NULL CHECK (purchased_on IS date(purchased_on)),
    odometer_km     REAL    NOT NULL DEFAULT 0 CHECK (odometer_km >= 0),
    status          TEXT    NOT NULL DEFAULT 'free'
                            CHECK (status IN ('free', 'rented', 'service', 'written_off')),

    CONSTRAINT fk_bicycle_station FOREIGN KEY (home_station_id)
        REFERENCES station (id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE client (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    last_name     TEXT    NOT NULL,
    first_name    TEXT    NOT NULL,
    phone         TEXT    NOT NULL UNIQUE CHECK (length(phone) = 12 AND phone LIKE '+7%'),
    email         TEXT    NULL UNIQUE CHECK (email IS NULL OR email LIKE '%_@_%._%'),
    birth_date    TEXT    NOT NULL CHECK (birth_date IS date(birth_date)),
    registered_at TEXT    NOT NULL DEFAULT (datetime('now')),
    is_blocked    INTEGER NOT NULL DEFAULT 0 CHECK (is_blocked IN (0, 1))
);

CREATE TABLE tariff (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    code             TEXT    NOT NULL UNIQUE,
    name             TEXT    NOT NULL,
    unlock_price     NUMERIC NOT NULL CHECK (unlock_price >= 0),
    price_per_minute NUMERIC NOT NULL CHECK (price_per_minute >= 0),
    free_minutes     INTEGER NOT NULL DEFAULT 0 CHECK (free_minutes >= 0),
    is_subscription  INTEGER NOT NULL DEFAULT 0 CHECK (is_subscription IN (0, 1)),
    valid_from       TEXT    NOT NULL CHECK (valid_from IS date(valid_from)),
    valid_to         TEXT    NULL     CHECK (valid_to IS NULL OR valid_to > valid_from)
);

CREATE TABLE rental (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id        INTEGER NOT NULL,
    bicycle_id       INTEGER NOT NULL,
    tariff_id        INTEGER NOT NULL,
    start_station_id INTEGER NOT NULL,
    end_station_id   INTEGER NULL,
    started_at       TEXT    NOT NULL CHECK (started_at IS datetime(started_at)),
    finished_at      TEXT    NULL     CHECK (finished_at IS NULL OR finished_at IS datetime(finished_at)),
    distance_km      REAL    NULL     CHECK (distance_km IS NULL OR distance_km >= 0),
    total_cost       NUMERIC NULL     CHECK (total_cost  IS NULL OR total_cost  >= 0),

    CONSTRAINT ck_rental_finished CHECK (finished_at IS NULL OR finished_at > started_at),

    CONSTRAINT ck_rental_complete CHECK (
        (finished_at IS     NULL AND end_station_id IS     NULL AND total_cost IS     NULL) OR
        (finished_at IS NOT NULL AND end_station_id IS NOT NULL AND total_cost IS NOT NULL)
    ),

    CONSTRAINT fk_rental_client  FOREIGN KEY (client_id)        REFERENCES client  (id) ON DELETE RESTRICT,
    CONSTRAINT fk_rental_bicycle FOREIGN KEY (bicycle_id)       REFERENCES bicycle (id) ON DELETE RESTRICT,
    CONSTRAINT fk_rental_tariff  FOREIGN KEY (tariff_id)        REFERENCES tariff  (id) ON DELETE RESTRICT,
    CONSTRAINT fk_rental_start   FOREIGN KEY (start_station_id) REFERENCES station (id) ON DELETE RESTRICT,
    CONSTRAINT fk_rental_end     FOREIGN KEY (end_station_id)   REFERENCES station (id) ON DELETE RESTRICT
);

CREATE TABLE payment (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    rental_id   INTEGER NOT NULL UNIQUE,
    amount      NUMERIC NOT NULL CHECK (amount > 0),
    method      TEXT    NOT NULL CHECK (method IN ('card', 'sbp', 'wallet', 'cash')),
    status      TEXT    NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    paid_at     TEXT    NOT NULL CHECK (paid_at IS datetime(paid_at)),
    external_id TEXT    NOT NULL UNIQUE,

    CONSTRAINT fk_payment_rental FOREIGN KEY (rental_id)
        REFERENCES rental (id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX idx_station_district  ON station (district_id);
CREATE INDEX idx_bicycle_station   ON bicycle (home_station_id);
CREATE INDEX idx_bicycle_status    ON bicycle (status);
CREATE INDEX idx_rental_client     ON rental  (client_id);
CREATE INDEX idx_rental_bicycle    ON rental  (bicycle_id);
CREATE INDEX idx_rental_tariff     ON rental  (tariff_id);
CREATE INDEX idx_rental_start      ON rental  (start_station_id);
CREATE INDEX idx_rental_end        ON rental  (end_station_id);
CREATE INDEX idx_rental_started_at ON rental  (started_at);
