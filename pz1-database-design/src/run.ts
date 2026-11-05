import { DatabaseSync } from 'node:sqlite';
import { readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const file = join(root, 'velograd.db');
rmSync(file, { force: true });

const db = new DatabaseSync(file);
db.exec(readFileSync(join(root, 'sql', '01_schema.sql'), 'utf8'));
db.exec(readFileSync(join(root, 'sql', '02_seed.sql'), 'utf8'));

for (const table of ['district', 'station', 'bicycle', 'client', 'tariff', 'rental', 'payment']) {
    const row = db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number };
    console.log(`${table}: ${row.n} rows`);
}

const statements = readFileSync(join(root, 'sql', '03_cross_join.sql'), 'utf8')
    .split(';')
    .map((statement) => statement.trim())
    .filter((statement) => statement !== '');

for (const statement of statements) {
    console.log(`\n${statement}\n`);
    const query = db.prepare(statement);
    console.log(query.columns().map((column) => column.name).join(' | '));
    query.setReturnArrays(true);
    for (const row of query.all()) console.log((row as unknown as unknown[]).join(' | '));
}
