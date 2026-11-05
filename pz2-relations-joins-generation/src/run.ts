import { join } from 'node:path';
import { psqlFile, start } from './cluster.ts';

const files = ['01_schema.sql', '02_seed_base.sql', '03_relations.sql', '04_joins.sql', '05_generate.sql', '06_typical_query.sql'];

start();

for (const file of files) {
    console.log(`=== ${file}`);
    const result = psqlFile(join(import.meta.dirname, '..', 'sql', file));
    console.log(result.output);
    if (!result.ok) {
        process.exitCode = 1;
        break;
    }
}
