# Serverside programming: one folder per exercise

Each folder holds only what its task sheet asks for: the code, no comments, no tests.

| Folder | Exercise | Run |
| --- | --- | --- |
| `pz1-database-design` | 1. Database design, CROSS JOIN (SQLite) | `npm start` |
| `pz2-relations-joins-generation` | 2. Relations, JOINs, generated data | `npm run pg:start`, `npm start` |
| `pz3-indexes-explain` | 3. 500,000 rows, indexes, EXPLAIN ANALYZE | `npm run pg:start`, `npm start` |
| `pz4-orm-setup` | 4. ORM setup (Drizzle instead of Hibernate) | `npm run pg:start`, `npm start` |
| `pz5-entities-criteria-repositories` | 5. Entities, Criteria, repositories | `npm run pg:start`, `npm start` |
| `pz6-rest-transactions` | 6. REST (Express) and transactions | `npm run pg:start`, `npm start` (server), `npm run demo` |

Stop the PostgreSQL server with `npm run pg:stop` in any of exercises 2 to 6.

Every folder also keeps its report in `report\` (rebuilt on 5 November from this code) and its task text in `task\`.

## After cloning

`node_modules\` and `.pgdata\` are not in the repository. Run `npm install` inside the folder you want to run. The first `npm run pg:start` creates a fresh database; then run `npm start` in exercise 2 and after it in exercise 3 to fill it.

## Shared parts

- `node_modules\` – dependencies for all folders (found automatically from the folders below it).
- `.pgdata\` – the private PostgreSQL data (about 1 GB, database `velograd`, 300 stations, 50,000 clients, 400,000 rentals). Exercises 2 to 6 share it. Only one server can use port 54329.
- `guides\` – the English defense guide for exercises 1 to 6 (`How_to_defend_serverside_PZ1-6_EN.pdf`) and the text of all six task sheets.

## Notes

- `npm start` in exercise 2 recreates the whole database from scratch. Run `npm start` in exercise 3 afterwards to load the 400,000 rentals again (it loads only when fewer than 100,000 rentals exist).
- Exercise 3 adds rows to the tables that exercise 2 created, so it needs exercise 2 to have run first (the shared `.pgdata` already has everything).
- Exercise 4 adds one station on every run and leaves it in the table. Exercises 5 and 6 remove what they add.
- Checked on 5 November: `tsc` is clean in all six folders and every `npm start` ran without errors (exercise 6 also through `npm run demo` and the real server on port 8080). The six reports and the guide were rebuilt from fresh runs of this code.
