import { between, eq } from 'drizzle-orm';
import { DAO } from './DAO.ts';
import { type NewStation, station } from './schema.ts';

export class TestSrvs extends DAO {
    async getName(id: number): Promise<string | undefined> {
        const session = await DAO.getSession();
        const rows = await session.select({ name: station.name }).from(station).where(eq(station.id, id));
        return rows[0]?.name;
    }

    async getNames(from: number, to: number): Promise<string[]> {
        const session = await DAO.getSession();
        const rows = await session.select({ name: station.name }).from(station).where(between(station.id, from, to)).orderBy(station.id);
        return rows.map((row) => row.name);
    }

    async addStation(data: NewStation): Promise<number> {
        await DAO.begin();
        const session = await DAO.getSession();
        const result = await session.insert(station).values(data);
        await DAO.commit();
        return result.rowCount ?? 0;
    }
}
