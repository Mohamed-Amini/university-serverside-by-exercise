DROP INDEX IF EXISTS idx_rental_started_at;
DROP INDEX IF EXISTS idx_client_last_name;
DROP INDEX IF EXISTS idx_client_last_name_pattern;
DROP INDEX IF EXISTS idx_rental_client_id;
DROP INDEX IF EXISTS idx_rental_start_station;

\ir 04_explain.sql

CREATE INDEX idx_rental_started_at ON rental (started_at);
\ir 04_explain.sql

CREATE INDEX idx_client_last_name ON client (last_name);
\ir 04_explain.sql

CREATE INDEX idx_client_last_name_pattern ON client (last_name text_pattern_ops);
\ir 04_explain.sql

CREATE INDEX idx_rental_client_id ON rental (client_id);
\ir 04_explain.sql

CREATE INDEX idx_rental_start_station ON rental (start_station_id);
\ir 04_explain.sql

REINDEX TABLE rental;
REINDEX TABLE client;
ANALYZE rental;
ANALYZE client;
\ir 04_explain.sql
