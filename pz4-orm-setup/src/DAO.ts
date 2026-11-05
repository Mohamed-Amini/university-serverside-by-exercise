import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, type PoolClient } from 'pg';
import { config } from './config.ts';

function open(client: PoolClient) {
    return drizzle(client);
}

export type Session = ReturnType<typeof open>;

export class DAO {
    static sessionFactory = new Pool(config);
    static session: Session | null = null;

    static async getSession(): Promise<Session> {
        if (DAO.session === null) DAO.session = open(await DAO.sessionFactory.connect());
        return DAO.session;
    }

    static async begin(): Promise<void> {
        const session = await DAO.getSession();
        await session.$client.query('BEGIN');
    }

    static async commit(): Promise<void> {
        const session = await DAO.getSession();
        await session.$client.query('COMMIT');
    }

    static async close(): Promise<void> {
        DAO.session?.$client.release();
        DAO.session = null;
        await DAO.sessionFactory.end();
    }
}
