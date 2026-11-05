import { join } from 'node:path';
import { psqlFile, psqlScalar, start } from './cluster.ts';

start();

const files = ['02_query.sql', '03_indexes.sql'];
if (Number(psqlScalar('SELECT count(*) FROM rental')) < 100000) files.unshift('01_load.sql');

for (const file of files) {
    console.log(`=== ${file}`);
    const result = psqlFile(join(import.meta.dirname, '..', 'sql', file));
    console.log(result.output);
    if (!result.ok) {
        process.exitCode = 1;
        break;
    }
}
