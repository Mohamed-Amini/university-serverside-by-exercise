SELECT client_id AS demo_client
FROM rental
GROUP BY client_id
ORDER BY count(*) DESC, client_id
LIMIT 1 \gset

SELECT :demo_client AS client_id,
       (SELECT last_name || ' ' || first_name FROM client WHERE id = :demo_client) AS client;

SELECT r.id                                   AS rental_id,
       to_char(r.started_at, 'YYYY-MM-DD HH24:MI') AS started,
       ss.name                                AS from_station,
       es.name                                AS to_station,
       t.code                                 AS tariff,
       r.distance_km                          AS km,
       r.total_cost                           AS cost,
       coalesce(p.status, 'нет платежа')      AS payment
FROM rental AS r
JOIN station AS ss ON ss.id = r.start_station_id
LEFT JOIN station AS es ON es.id = r.end_station_id
JOIN tariff AS t ON t.id = r.tariff_id
LEFT JOIN payment AS p ON p.rental_id = r.id
WHERE r.client_id = :demo_client
  AND r.started_at >= date '2025-01-01'
ORDER BY r.started_at DESC
LIMIT 8;
