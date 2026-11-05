import { eq } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import { DAO } from './DAO.ts';

export class JpaRepository<T extends PgTable & { id: PgColumn }> {
    protected table: T;

    constructor(table: T) {
        this.table = table;
    }

    async findAll(): Promise<Array<T['$inferSelect']>> {
        const session = await DAO.getSession();
        return (await session.select().from(this.table as PgTable).orderBy(this.table.id)) as Array<T['$inferSelect']>;
    }

    async findById(id: number): Promise<T['$inferSelect'] | undefined> {
        const session = await DAO.getSession();
        const rows = await session.select().from(this.table as PgTable).where(eq(this.table.id, id));
        return rows[0] as T['$inferSelect'] | undefined;
    }

    async save(data: T['$inferInsert']): Promise<T['$inferSelect']> {
        const session = await DAO.getSession();
        const rows = await session.insert(this.table).values(data).returning();
        return rows[0] as T['$inferSelect'];
    }

    async deleteById(id: number): Promise<void> {
        const session = await DAO.getSession();
        await session.delete(this.table).where(eq(this.table.id, id));
    }
}
