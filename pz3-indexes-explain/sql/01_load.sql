\set seed 0.3
\set stations 228
\set bicycles 4386
\set clients 47988
\set rentals 389984
\ir generate.sql

SELECT c.relname                                  AS table_name,
       c.reltuples::bigint                         AS rows_estimate,
       pg_size_pretty(pg_table_size(c.oid))        AS table_size,
       pg_size_pretty(pg_indexes_size(c.oid))      AS indexes_size
FROM pg_class AS c
WHERE c.relnamespace = 'public'::regnamespace AND c.relkind = 'r'
ORDER BY c.reltuples DESC;
