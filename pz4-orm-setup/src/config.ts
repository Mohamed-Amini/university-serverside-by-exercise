export const config = {
    host: process.env['PGHOST'] ?? '127.0.0.1',
    port: Number(process.env['PGPORT'] ?? 54329),
    database: process.env['PGDATABASE'] ?? 'velograd',
    user: process.env['PGUSER'] ?? 'postgres',
};
