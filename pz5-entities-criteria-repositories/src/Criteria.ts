import { and, asc, between, desc, eq, gte, ilike, lte, like, type SQL } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import type { Session } from './DAO.ts';

export const Restrictions = { eq, ge: gte, le: lte, between, like, ilike };
export const Order = { asc, desc };

export class Criteria<T extends PgTable> {
    private session: Session;
    private table: T;
    private conditions: SQL[] = [];
    private orders: SQL[] = [];

    constructor(session: Session, table: T) {
        this.session = session;
        this.table = table;
    }

    add(condition: SQL): this {
        this.conditions.push(condition);
        return this;
    }

    addOrder(order: SQL): this {
        this.orders.push(order);
        return this;
    }

    async list(): Promise<Array<T['$inferSelect']>> {
        let query = this.session.select().from(this.table as PgTable).$dynamic();
        if (this.conditions.length > 0) query = query.where(and(...this.conditions));
        if (this.orders.length > 0) query = query.orderBy(...this.orders);
        return (await query) as Array<T['$inferSelect']>;
    }

    async uniqueResult(): Promise<T['$inferSelect'] | undefined> {
        return (await this.list())[0];
    }
}
