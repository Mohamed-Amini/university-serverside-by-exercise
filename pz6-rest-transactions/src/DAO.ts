import { AsyncLocalStorage } from 'node:async_hooks';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, type PoolClient } from 'pg';
import { config } from './config.ts';

function open(client: PoolClient) {
    return drizzle(client);
}

export type Session = ReturnType<typeof open>;

interface Scope {
    session: Session | null;
    inTransaction: boolean;
}

export class DAO {
    static sessionFactory = new Pool(config);
    static storage = new AsyncLocalStorage<Scope>();

    static async run<T>(fn: () => Promise<T>): Promise<T> {
        return DAO.storage.run({ session: null, inTransaction: false }, async () => {
            try {
                return await fn();
            } finally {
                DAO.scope().session?.$client.release();
            }
        });
    }

    static scope(): Scope {
        const scope = DAO.storage.getStore();
        if (scope === undefined) throw new Error('DAO.run() is required');
        return scope;
    }

    static async getSession(): Promise<Session> {
        const scope = DAO.scope();
        if (scope.session === null) scope.session = open(await DAO.sessionFactory.connect());
        return scope.session;
    }

    static async begin(readOnly = false): Promise<void> {
        const session = await DAO.getSession();
        await session.$client.query(readOnly ? 'BEGIN READ ONLY' : 'BEGIN');
        DAO.scope().inTransaction = true;
    }

    static async commit(): Promise<void> {
        const session = await DAO.getSession();
        await session.$client.query('COMMIT');
        DAO.scope().inTransaction = false;
    }

    static async rollback(): Promise<void> {
        const session = await DAO.getSession();
        await session.$client.query('ROLLBACK');
        DAO.scope().inTransaction = false;
    }

    static async transactional<T>(fn: () => Promise<T>, options: { readOnly?: boolean } = {}): Promise<T> {
        if (DAO.scope().inTransaction) return fn();
        await DAO.begin(options.readOnly ?? false);
        try {
            const result = await fn();
            await DAO.commit();
            return result;
        } catch (error) {
            await DAO.rollback();
            throw error;
        }
    }

    static async shutdown(): Promise<void> {
        await DAO.sessionFactory.end();
    }
}
