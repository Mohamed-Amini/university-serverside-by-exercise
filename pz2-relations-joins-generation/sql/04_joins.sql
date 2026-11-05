SELECT d.id AS district_id, d.name AS district, s.name AS station
FROM district AS d
INNER JOIN station AS s ON s.district_id = d.id
ORDER BY d.id, s.id;

SELECT d.id AS district_id, d.name AS district, s.name AS station
FROM district AS d
LEFT JOIN station AS s ON s.district_id = d.id
ORDER BY d.id, s.id;

SELECT s.id AS station_id, s.name AS station, r.id AS rental_id,
       CASE WHEN s.id IS NULL THEN 'поездка не завершена'
            WHEN r.id IS NULL THEN 'на станцию никто не приезжал'
            ELSE 'пара найдена' END AS match_kind
FROM station AS s
FULL OUTER JOIN rental AS r ON r.end_station_id = s.id
ORDER BY s.id NULLS LAST, r.id;

SELECT d.name AS district, t.code AS tariff
FROM district AS d
CROSS JOIN tariff AS t
WHERE d.id <= 2 AND t.id <= 3
ORDER BY d.id, t.id;
