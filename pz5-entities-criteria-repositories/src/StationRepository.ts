import { eq, ilike } from 'drizzle-orm';
import { DAO } from './DAO.ts';
import { JpaRepository } from './JpaRepository.ts';
import { district, type Station, station } from './model.ts';

export class StationRepository extends JpaRepository<typeof station> {
    constructor() {
        super(station);
    }

    async findByNameStartingWithIgnoreCase(prefix: string): Promise<Station[]> {
        const session = await DAO.getSession();
        return session.select().from(station).where(ilike(station.name, `${prefix}%`)).orderBy(station.id);
    }

    async findStationsByDistrictName(name: string): Promise<Station[]> {
        const session = await DAO.getSession();
        const rows = await session
            .select({ station })
            .from(station)
            .innerJoin(district, eq(district.id, station.districtId))
            .where(eq(district.name, name))
            .orderBy(station.id);
        return rows.map((row) => row.station);
    }
}
