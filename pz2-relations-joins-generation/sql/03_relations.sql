ALTER TABLE client
    ADD COLUMN referred_by integer NULL
        CONSTRAINT fk_client_referred_by REFERENCES client (id) ON DELETE SET NULL;

ALTER TABLE client
    ADD CONSTRAINT ck_client_not_self_referral CHECK (referred_by IS NULL OR referred_by <> id);

UPDATE client SET referred_by = 1 WHERE id IN (4, 7, 9);
UPDATE client SET referred_by = 4 WHERE id = 11;

CREATE TABLE client_wallet (
    client_id  integer        PRIMARY KEY,
    balance    numeric(10, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    updated_at timestamp      NOT NULL DEFAULT now(),

    CONSTRAINT fk_wallet_client FOREIGN KEY (client_id)
        REFERENCES client (id) ON DELETE CASCADE
);

INSERT INTO client_wallet (client_id, balance)
SELECT id, 100 + (id * 37) % 900 FROM client;

CREATE TABLE client_favorite_station (
    client_id  integer NOT NULL,
    station_id integer NOT NULL,
    added_on   date    NOT NULL DEFAULT current_date,

    CONSTRAINT pk_client_favorite_station PRIMARY KEY (client_id, station_id),
    CONSTRAINT fk_favorite_client  FOREIGN KEY (client_id)  REFERENCES client  (id) ON DELETE CASCADE,
    CONSTRAINT fk_favorite_station FOREIGN KEY (station_id) REFERENCES station (id) ON DELETE CASCADE
);

INSERT INTO client_favorite_station (client_id, station_id, added_on)
SELECT c.id, s.id, date '2025-01-01' + (c.id * 5 + s.id) % 300
FROM client AS c
JOIN station AS s ON (c.id * 7 + s.id * 3) % 5 = 0
WHERE s.id <= 8;
