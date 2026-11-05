import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const PG_BIN = process.env['PG_BIN'] ?? 'C:/Program Files/PostgreSQL/17/bin';

export const connection = {
    PGHOST: process.env['PGHOST'] ?? '127.0.0.1',
    PGPORT: process.env['PGPORT'] ?? '54329',
    PGUSER: process.env['PGUSER'] ?? 'postgres',
    PGDATABASE: process.env['PGDATABASE'] ?? 'velograd',
};

const dataDir = process.env['PGDATA_DIR'] ?? join(import.meta.dirname, '..', '..', '.pgdata');

function run(tool: string, args: string[]): { ok: boolean; output: string } {
    const result = spawnSync(`${PG_BIN}/${tool}.exe`, args, {
        encoding: 'utf8',
        env: { ...process.env, ...connection, PGCLIENTENCODING: 'UTF8' },
    });
    return { ok: result.status === 0, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
}

export function isReady(): boolean {
    return run('pg_isready', ['-h', connection.PGHOST, '-p', connection.PGPORT]).ok;
}

export function start(): void {
    if (!existsSync(join(dataDir, 'PG_VERSION'))) {
        const init = run('initdb', ['-D', dataDir, '-U', connection.PGUSER, '--auth=trust', '-E', 'UTF8', '--locale-provider=icu', '--icu-locale=ru-RU', '--locale=C']);
        if (!init.ok) throw new Error(init.output);
    }
    if (!isReady()) {
        const args = ['-D', dataDir, '-o', `-p ${connection.PGPORT} -c listen_addresses=${connection.PGHOST} -c shared_buffers=256MB`, '-l', join(dataDir, 'server.log'), 'start'];
        spawn(`${PG_BIN}/pg_ctl.exe`, args, { stdio: 'ignore', detached: true, windowsHide: true }).unref();
        for (let i = 0; i < 240 && !isReady(); i++) spawnSync('node', ['-e', 'setTimeout(() => {}, 500)']);
        if (!isReady()) throw new Error('PostgreSQL did not start');
    }
    const exists = run('psql', ['-d', 'postgres', '-Atc', `SELECT 1 FROM pg_database WHERE datname = '${connection.PGDATABASE}'`]).output.trim();
    if (exists !== '1') {
        const created = run('psql', ['-d', 'postgres', '-c', `CREATE DATABASE ${connection.PGDATABASE} ENCODING 'UTF8' LOCALE_PROVIDER icu ICU_LOCALE 'ru-RU' LOCALE 'C' TEMPLATE template0`]);
        if (!created.ok) throw new Error(created.output);
    }
}

export function stop(): void {
    if (isReady()) run('pg_ctl', ['-D', dataDir, '-m', 'fast', 'stop']);
}

export function psqlFile(file: string): { ok: boolean; output: string } {
    return run('psql', ['-d', connection.PGDATABASE, '-v', 'ON_ERROR_STOP=1', '-f', file]);
}

export function psqlScalar(sql: string): string {
    return run('psql', ['-d', connection.PGDATABASE, '-Atc', sql]).output.trim();
}

if (import.meta.main) {
    const command = process.argv[2];
    if (command === 'start') {
        start();
        console.log('started');
    } else if (command === 'stop') {
        stop();
        console.log('stopped');
    }
}
