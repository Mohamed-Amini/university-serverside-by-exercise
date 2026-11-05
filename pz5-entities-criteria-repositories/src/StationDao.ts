import { eq } from 'drizzle-orm';
import { Criteria, Order, Restrictions } from './Criteria.ts';
import { DAO } from './DAO.ts';
import { type NewStation, type Station, station } from './model.ts';

export class StationDao extends DAO {
    async createCriteria(): Promise<Criteria<typeof station>> {
        return new Criteria(await DAO.getSession(), station);
    }

    async findAll(): Promise<Station[]> {
        const criteria = await this.createCriteria();
        return criteria.addOrder(Order.asc(station.id)).list();
    }

    async getName(id: number): Promise<string | undefined> {
        const criteria = await this.createCriteria();
        const found = await criteria.add(Restrictions.eq(station.id, id)).uniqueResult();
        return found?.name;
    }

    async listByIdRange(from: number, to: number): Promise<string[]> {
        const criteria = await this.createCriteria();
        const rows = await criteria.add(Restrictions.between(station.id, from, to)).addOrder(Order.asc(station.id)).list();
        return rows.map((row) => row.name);
    }

    async findByNameLike(prefix: string): Promise<Station[]> {
        const criteria = await this.createCriteria();
        return criteria.add(Restrictions.ilike(station.name, `${prefix}%`)).addOrder(Order.asc(station.id)).list();
    }

    async search(name: string | null, capacityFrom: number | null, capacityTo: number | null): Promise<Station[]> {
        const criteria = await this.createCriteria();
        if (name !== null) criteria.add(Restrictions.ilike(station.name, `%${name}%`));
        if (capacityFrom !== null) criteria.add(Restrictions.ge(station.capacity, capacityFrom));
        if (capacityTo !== null) criteria.add(Restrictions.le(station.capacity, capacityTo));
        return criteria.addOrder(Order.asc(station.id)).list();
    }

    async findByDistrict(districtId: number): Promise<Station[]> {
        const criteria = await this.createCriteria();
        return criteria.add(Restrictions.eq(station.districtId, districtId)).addOrder(Order.asc(station.id)).list();
    }

    async get(id: number): Promise<Station | undefined> {
        const criteria = await this.createCriteria();
        return criteria.add(Restrictions.eq(station.id, id)).uniqueResult();
    }

    async save(data: NewStation): Promise<Station> {
        const session = await DAO.getSession();
        const rows = await session.insert(station).values(data).returning();
        return rows[0]!;
    }

    async delete(id: number): Promise<number> {
        const session = await DAO.getSession();
        const result = await session.delete(station).where(eq(station.id, id));
        return result.rowCount ?? 0;
    }
}
