\if :{?seed}     \else \set seed     0.2026 \endif
\if :{?stations} \else \set stations 60     \endif
\if :{?bicycles} \else \set bicycles 600    \endif
\if :{?clients}  \else \set clients  2000   \endif
\if :{?rentals}  \else \set rentals  10000  \endif

SELECT setseed(:seed);

SELECT coalesce(max(id), 0) AS client_before FROM client \gset
SELECT coalesce(max(id), 0) AS rental_before FROM rental \gset

BEGIN;

WITH base AS (SELECT coalesce(max(id), 0) AS m FROM station),
     dict AS (
         SELECT ARRAY['ул. Ленина', 'ул. Мира', 'пр. Победы', 'ул. Советская', 'ул. Гагарина', 'ул. Пушкина',
                      'ул. Садовая', 'ул. Лесная', 'пр. Мира', 'ул. Кирова', 'ул. Горького', 'наб. Речная',
                      'ул. Школьная', 'ул. Молодёжная', 'пр. Строителей', 'ул. Парковая'] AS street
     )
INSERT INTO station (district_id, name, address, capacity, latitude, longitude, opened_on)
SELECT (ARRAY[1, 2, 3, 4, 5, 6, 7, 8, 10])[1 + (g % 9)],
       'Станция №' || (base.m + g),
       dict.street[1 + floor(random() * cardinality(dict.street))::int] || ', ' || (1 + floor(random() * 120))::int,
       (8 + floor(random() * 40))::smallint,
       round((55.70 + random() * 0.12)::numeric, 6),
       round((37.50 + random() * 0.20)::numeric, 6),
       date '2021-05-01' + floor(random() * 1800)::int
FROM generate_series(1, :stations) AS g
CROSS JOIN base
CROSS JOIN dict;

WITH base AS (SELECT coalesce(max(id), 0) AS m FROM bicycle),
     st   AS (SELECT max(id) AS m FROM station),
     g AS MATERIALIZED (
         SELECT n, random() AS r_kind, random() AS r_model, random() AS r_station, random() AS r_date,
                random() AS r_odo, random() AS r_status
         FROM generate_series(1, :bicycles) AS n
     )
INSERT INTO bicycle (serial_number, model, kind, home_station_id, purchased_on, odometer_km, status)
SELECT 'VG-' || lpad((base.m + g.n)::text, 6, '0'),
       CASE k.kind
           WHEN 'city'     THEN (ARRAY['Stels Navigator', 'Forward Racer', 'Giant Escape', 'Merida Crossway'])[1 + floor(g.r_model * 4)::int]
           WHEN 'electric' THEN (ARRAY['Eltreco Cross', 'Xiaomi Mi Smart', 'Volteco Flex'])[1 + floor(g.r_model * 3)::int]
           WHEN 'cargo'    THEN (ARRAY['Bakfiets Cargo', 'Urban Arrow'])[1 + floor(g.r_model * 2)::int]
           ELSE                 (ARRAY['Stels Pilot', 'Altair Junior', 'Trek Precaliber'])[1 + floor(g.r_model * 3)::int]
       END,
       k.kind,
       1 + floor(g.r_station * st.m)::int,
       date '2021-05-01' + floor(g.r_date * 1700)::int,
       round((g.r_odo * g.r_odo * 6000)::numeric, 1),
       CASE WHEN g.r_status < 0.70 THEN 'free' WHEN g.r_status < 0.85 THEN 'rented'
            WHEN g.r_status < 0.95 THEN 'service' ELSE 'written_off' END
FROM g
CROSS JOIN base
CROSS JOIN st
CROSS JOIN LATERAL (
    SELECT CASE WHEN g.r_kind < 0.55 THEN 'city' WHEN g.r_kind < 0.75 THEN 'electric'
                WHEN g.r_kind < 0.85 THEN 'cargo' ELSE 'teen' END AS kind
) AS k;

WITH base AS (SELECT coalesce(max(id), 0) AS m FROM client),
     dict AS (
         SELECT ARRAY['Александр', 'Михаил', 'Иван', 'Дмитрий', 'Артём', 'Максим', 'Андрей', 'Сергей', 'Никита', 'Егор',
                      'Илья', 'Кирилл', 'Павел', 'Владимир', 'Роман', 'Денис', 'Алексей', 'Тимофей', 'Матвей', 'Фёдор'] AS male_first,
                ARRAY['Анна', 'Мария', 'Елена', 'Ольга', 'Наталья', 'Екатерина', 'Анастасия', 'Дарья', 'Полина', 'Ксения',
                      'Виктория', 'Юлия', 'Татьяна', 'Ирина', 'Софья', 'Алиса', 'Вера', 'Светлана', 'Алёна', 'Милана'] AS female_first,
                ARRAY['Иванов', 'Петров', 'Сидоров', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Соколов', 'Михайлов', 'Новиков',
                      'Фёдоров', 'Морозов', 'Волков', 'Алексеев', 'Лебедев', 'Семёнов', 'Егоров', 'Павлов', 'Козлов', 'Степанов',
                      'Николаев', 'Орлов', 'Андреев', 'Макаров', 'Захаров', 'Зайцев', 'Соловьёв', 'Борисов', 'Яковлев', 'Григорьев',
                      'Романов', 'Воробьёв', 'Сергеев', 'Куликов', 'Тарасов', 'Беляев', 'Комаров', 'Киселёв', 'Ильин', 'Гусев',
                      'Титов', 'Кузьмин', 'Кудрявцев', 'Баранов', 'Куприянов', 'Осипов', 'Мартынов', 'Лазарев', 'Белов', 'Горбунов'] AS surname
     ),
     g AS MATERIALIZED (
         SELECT n, random() < 0.5 AS male, random() AS r_first, random() AS r_last, random() AS r_birth, random() AS r_reg,
                random() AS r_block, random() AS r_mail, random() AS r_ref, random() AS r_ref_id
         FROM generate_series(1, :clients) AS n
     )
INSERT INTO client (last_name, first_name, phone, email, birth_date, registered_at, is_blocked, referred_by)
SELECT CASE WHEN g.male THEN s.surname ELSE s.surname || 'а' END,
       CASE WHEN g.male THEN dict.male_first[1 + floor(g.r_first * cardinality(dict.male_first))::int]
            ELSE dict.female_first[1 + floor(g.r_first * cardinality(dict.female_first))::int] END,
       '+7999' || lpad((base.m + g.n)::text, 7, '0'),
       CASE WHEN g.r_mail < 0.85 THEN 'user' || (base.m + g.n) || '@example.test' END,
       date '1955-01-01' + floor(g.r_birth * 365 * 55)::int,
       date_trunc('second', timestamp '2022-01-01' + g.r_reg * interval '1750 days'),
       g.r_block < 0.02,
       CASE WHEN g.r_ref < 0.15 THEN 1 + floor(g.r_ref_id * (base.m + g.n - 1))::int END
FROM g
CROSS JOIN base
CROSS JOIN dict
CROSS JOIN LATERAL (SELECT dict.surname[1 + floor(g.r_last * cardinality(dict.surname))::int] AS surname) AS s;

INSERT INTO client_wallet (client_id, balance)
SELECT id, round((random() * 2000)::numeric, 2) FROM client WHERE id > :client_before;

INSERT INTO client_favorite_station (client_id, station_id, added_on)
SELECT DISTINCT c.id, 1 + floor(random() * (SELECT max(id) FROM station))::int, date '2025-01-01' + floor(random() * 600)::int
FROM client AS c
CROSS JOIN LATERAL generate_series(1, 1 + floor(random() * 4)::int) AS k
WHERE c.id > :client_before AND random() < 0.6
ON CONFLICT DO NOTHING;

WITH m AS (SELECT (SELECT max(id) FROM client) AS c, (SELECT max(id) FROM bicycle) AS b, (SELECT max(id) FROM station) AS s),
     g AS MATERIALIZED (
         SELECT n,
                1 + floor(random() * m.c)::int AS client_id,
                1 + floor(random() * m.b)::int AS bicycle_id,
                1 + floor(random() * m.s)::int AS start_station_id,
                1 + floor(random() * m.s)::int AS end_station_id,
                date_trunc('second', timestamp '2024-03-01 06:00' + random() * interval '970 days') AS started_at,
                least(600, 3 + floor(-ln(1 - random()) * 25))::int AS minutes,
                random() AS r_speed
         FROM generate_series(1, :rentals) AS n
         CROSS JOIN m
     )
INSERT INTO rental (client_id, bicycle_id, tariff_id, start_station_id, end_station_id, started_at, finished_at, distance_km, total_cost)
SELECT g.client_id, g.bicycle_id, t.id, g.start_station_id,
       CASE WHEN g.started_at < timestamp '2026-10-29 20:00' THEN g.end_station_id END,
       g.started_at,
       CASE WHEN g.started_at < timestamp '2026-10-29 20:00' THEN g.started_at + g.minutes * interval '1 minute' END,
       CASE WHEN g.started_at < timestamp '2026-10-29 20:00' THEN round((g.minutes * (0.15 + 0.10 * g.r_speed))::numeric, 2) END,
       CASE WHEN g.started_at < timestamp '2026-10-29 20:00'
            THEN round(t.unlock_price + greatest(0, g.minutes - t.free_minutes) * t.price_per_minute, 2) END
FROM g
CROSS JOIN LATERAL (
    SELECT tt.id, tt.unlock_price, tt.price_per_minute, tt.free_minutes
    FROM tariff AS tt
    WHERE tt.valid_from <= g.started_at::date AND (tt.valid_to IS NULL OR tt.valid_to >= g.started_at::date)
    ORDER BY random() * CASE WHEN tt.is_subscription THEN 4 ELSE 1 END
    LIMIT 1
) AS t
ORDER BY g.started_at;

INSERT INTO payment (rental_id, amount, method, status, paid_at, external_id)
SELECT r.id, r.total_cost,
       CASE WHEN q.x < 0.55 THEN 'card' WHEN q.x < 0.80 THEN 'sbp' WHEN q.x < 0.95 THEN 'wallet' ELSE 'cash' END,
       CASE WHEN q.y < 0.93 THEN 'succeeded' WHEN q.y < 0.96 THEN 'failed' WHEN q.y < 0.98 THEN 'refunded' ELSE 'pending' END,
       r.finished_at + q.delay * interval '1 second',
       'pay_' || md5(r.id::text)
FROM rental AS r
CROSS JOIN LATERAL (SELECT random() AS x, random() AS y, floor(random() * 120) AS delay) AS q
WHERE r.id > :rental_before AND r.finished_at IS NOT NULL AND r.total_cost > 0;

COMMIT;

ANALYZE;

SELECT 'district' AS table_name, count(*) AS rows FROM district
UNION ALL SELECT 'station', count(*) FROM station
UNION ALL SELECT 'bicycle', count(*) FROM bicycle
UNION ALL SELECT 'client', count(*) FROM client
UNION ALL SELECT 'tariff', count(*) FROM tariff
UNION ALL SELECT 'rental', count(*) FROM rental
UNION ALL SELECT 'payment', count(*) FROM payment
UNION ALL SELECT 'client_wallet', count(*) FROM client_wallet
UNION ALL SELECT 'client_favorite_station', count(*) FROM client_favorite_station
UNION ALL SELECT 'ИТОГО', (SELECT count(*) FROM district) + (SELECT count(*) FROM station) + (SELECT count(*) FROM bicycle)
       + (SELECT count(*) FROM client) + (SELECT count(*) FROM tariff) + (SELECT count(*) FROM rental) + (SELECT count(*) FROM payment)
       + (SELECT count(*) FROM client_wallet) + (SELECT count(*) FROM client_favorite_station);
