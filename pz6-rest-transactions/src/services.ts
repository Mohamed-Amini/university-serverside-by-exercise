import { desc, eq, sql } from 'drizzle-orm';
import { DAO } from './DAO.ts';
import { client, clientFavoriteStation, clientWallet, type NewClient, type NewStation, rental, station, type Station, tariff } from './model.ts';

export class NotFoundError extends Error {}

export interface RentalDto {
    rentalId: number;
    client: string;
    startStation: string;
    tariff: string;
    startedAt: string;
    totalCost: string | null;
}

export class StationService {
    async list(): Promise<Station[]> {
        return DAO.transactional(async () => {
            const session = await DAO.getSession();
            return session.select().from(station).orderBy(station.id);
        }, { readOnly: true });
    }

    async get(id: number): Promise<Station> {
        return DAO.transactional(async () => {
            const session = await DAO.getSession();
            const rows = await session.select().from(station).where(eq(station.id, id));
            if (rows[0] === undefined) throw new NotFoundError(`station ${id} not found`);
            return rows[0];
        }, { readOnly: true });
    }

    async create(data: NewStation): Promise<Station> {
        return DAO.transactional(async () => {
            const session = await DAO.getSession();
            const rows = await session.insert(station).values(data).returning();
            return rows[0]!;
        });
    }

    async delete(id: number): Promise<void> {
        return DAO.transactional(async () => {
            const session = await DAO.getSession();
            const result = await session.delete(station).where(eq(station.id, id));
            if (result.rowCount === 0) throw new NotFoundError(`station ${id} not found`);
        });
    }
}

export class ClientService {
    async get(id: number): Promise<typeof client.$inferSelect> {
        return DAO.transactional(async () => {
            const session = await DAO.getSession();
            const rows = await session.select().from(client).where(eq(client.id, id));
            if (rows[0] === undefined) throw new NotFoundError(`client ${id} not found`);
            return rows[0];
        }, { readOnly: true });
    }

    async register(data: NewClient, favoriteStationIds: number[], failAfterSave: boolean): Promise<typeof client.$inferSelect> {
        return DAO.transactional(async () => {
            const session = await DAO.getSession();
            const created = (await session.insert(client).values(data).returning())[0]!;
            await session.insert(clientWallet).values({ clientId: created.id });
            if (favoriteStationIds.length > 0) {
                await session.insert(clientFavoriteStation).values(favoriteStationIds.map((stationId) => ({ clientId: created.id, stationId })));
            }
            if (failAfterSave) throw new Error('test rollback');
            return created;
        });
    }

    async delete(id: number): Promise<void> {
        return DAO.transactional(async () => {
            const session = await DAO.getSession();
            const result = await session.delete(client).where(eq(client.id, id));
            if (result.rowCount === 0) throw new NotFoundError(`client ${id} not found`);
        });
    }
}

export class RentalService {
    async list(limit: number): Promise<RentalDto[]> {
        return DAO.transactional(async () => {
            const session = await DAO.getSession();
            return session
                .select({
                    rentalId: rental.id,
                    client: sql<string>`${client.lastName} || ' ' || ${client.firstName}`,
                    startStation: station.name,
                    tariff: tariff.code,
                    startedAt: rental.startedAt,
                    totalCost: rental.totalCost,
                })
                .from(rental)
                .innerJoin(client, eq(client.id, rental.clientId))
                .innerJoin(station, eq(station.id, rental.startStationId))
                .innerJoin(tariff, eq(tariff.id, rental.tariffId))
                .orderBy(desc(rental.startedAt))
                .limit(limit);
        }, { readOnly: true });
    }
}
