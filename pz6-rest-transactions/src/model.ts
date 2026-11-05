import { sql } from 'drizzle-orm';
import { date, integer, numeric, pgTable, primaryKey, smallint, text, timestamp } from 'drizzle-orm/pg-core';

export const station = pgTable('station', {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    districtId: integer('district_id').notNull(),
    name: text().notNull(),
    address: text().notNull(),
    capacity: smallint().notNull(),
    latitude: numeric({ precision: 9, scale: 6 }).notNull(),
    longitude: numeric({ precision: 9, scale: 6 }).notNull(),
    openedOn: date('opened_on').notNull(),
});

export const client = pgTable('client', {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    lastName: text('last_name').notNull(),
    firstName: text('first_name').notNull(),
    phone: text().notNull().unique(),
    email: text().unique(),
    birthDate: date('birth_date').notNull(),
});

export const tariff = pgTable('tariff', {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    code: text().notNull().unique(),
    name: text().notNull(),
});

export const rental = pgTable('rental', {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    clientId: integer('client_id').notNull(),
    tariffId: integer('tariff_id').notNull(),
    startStationId: integer('start_station_id').notNull(),
    startedAt: timestamp('started_at', { mode: 'string' }).notNull(),
    totalCost: numeric('total_cost', { precision: 10, scale: 2 }),
});

export const clientWallet = pgTable('client_wallet', {
    clientId: integer('client_id').primaryKey(),
    balance: numeric({ precision: 10, scale: 2 }).notNull().default('0'),
});

export const clientFavoriteStation = pgTable('client_favorite_station', {
    clientId: integer('client_id').notNull(),
    stationId: integer('station_id').notNull(),
    addedOn: date('added_on').notNull().default(sql`current_date`),
}, (table) => [primaryKey({ columns: [table.clientId, table.stationId] })]);

export type Station = typeof station.$inferSelect;
export type NewStation = typeof station.$inferInsert;
export type NewClient = typeof client.$inferInsert;
