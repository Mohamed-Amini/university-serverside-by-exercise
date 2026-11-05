import { eq } from 'drizzle-orm';
import { Criteria, Order, Restrictions } from './Criteria.ts';
import { DAO } from './DAO.ts';
import { district } from './model.ts';

export class DistrictDao extends DAO {
    async createCriteria(): Promise<Criteria<typeof district>> {
        return new Criteria(await DAO.getSession(), district);
    }

    async findAll(): Promise<Array<typeof district.$inferSelect>> {
        const criteria = await this.createCriteria();
        return criteria.addOrder(Order.asc(district.id)).list();
    }

    async get(id: number): Promise<typeof district.$inferSelect | undefined> {
        const criteria = await this.createCriteria();
        return criteria.add(Restrictions.eq(district.id, id)).uniqueResult();
    }

    async getWithStations(id: number) {
        const session = await DAO.getSession();
        return session.query.district.findFirst({ where: eq(district.id, id), with: { stations: true } });
    }
}
