import { DAO } from './DAO.ts';
import { app } from './app.ts';

const server = app.listen(0);
const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;

async function call(method: string, path: string, body?: unknown): Promise<{ status: number; body: unknown }> {
    const response = await fetch(base + path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const text = await response.text();
    return { status: response.status, body: text === '' ? null : JSON.parse(text) };
}

const phone = `+7999${String(Date.now()).slice(-7)}`;
const client = { lastName: 'Тестов', firstName: 'Тест', phone, birthDate: '2000-01-01', favoriteStationIds: [1, 2] };

console.log('GET /api/stations ->', (await call('GET', '/api/stations')).status);
console.log('GET /api/rentals?limit=2 ->', JSON.stringify((await call('GET', '/api/rentals?limit=2')).body));
console.log('GET /api/stations/999999 ->', (await call('GET', '/api/stations/999999')).status);

const failed = await call('POST', '/api/clients?fail=true', client);
console.log('POST /api/clients?fail=true ->', failed.status, JSON.stringify(failed.body));
console.log('clients with this phone after the error:', await DAO.run(async () => {
    const session = await DAO.getSession();
    const result = await session.$client.query('SELECT count(*)::int AS n FROM client WHERE phone = $1', [phone]);
    return result.rows[0].n;
}));

const created = await call('POST', '/api/clients', client);
console.log('POST /api/clients ->', created.status, JSON.stringify(created.body));
const id = (created.body as { id: number }).id;
console.log(`GET /api/clients/${id} ->`, (await call('GET', `/api/clients/${id}`)).status);
console.log(`DELETE /api/clients/${id} ->`, (await call('DELETE', `/api/clients/${id}`)).status);

server.close();
await DAO.shutdown();
