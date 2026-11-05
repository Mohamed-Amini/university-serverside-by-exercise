SELECT
    (SELECT COUNT(*) FROM district) AS district,
    (SELECT COUNT(*) FROM station)  AS station,
    (SELECT COUNT(*) FROM bicycle)  AS bicycle,
    (SELECT COUNT(*) FROM client)   AS client,
    (SELECT COUNT(*) FROM tariff)   AS tariff,
    (SELECT COUNT(*) FROM rental)   AS rental,
    (SELECT COUNT(*) FROM payment)  AS payment,
    (SELECT COUNT(*) FROM district)
  * (SELECT COUNT(*) FROM station)
  * (SELECT COUNT(*) FROM bicycle)
  * (SELECT COUNT(*) FROM client)
  * (SELECT COUNT(*) FROM tariff)
  * (SELECT COUNT(*) FROM rental)
  * (SELECT COUNT(*) FROM payment) AS expected_rows;

SELECT COUNT(*) AS actual_rows
FROM district
CROSS JOIN station
CROSS JOIN bicycle
CROSS JOIN client
CROSS JOIN tariff
CROSS JOIN rental
CROSS JOIN payment;

SELECT *
FROM district
CROSS JOIN station
CROSS JOIN bicycle
CROSS JOIN client
CROSS JOIN tariff
CROSS JOIN rental
CROSS JOIN payment
LIMIT 5;
