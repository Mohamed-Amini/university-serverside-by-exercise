EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT c.last_name, c.first_name, s.name AS start_station, r.started_at, r.distance_km, r.total_cost
FROM rental  AS r
JOIN client  AS c ON c.id = r.client_id
JOIN station AS s ON s.id = r.start_station_id
WHERE c.last_name LIKE 'Кузн%'
  AND c.first_name = 'Мария'
  AND r.total_cost BETWEEN 100 AND 600
  AND r.started_at >= timestamp '2025-01-01'
ORDER BY r.started_at DESC
LIMIT 100;
