import { sql } from 'drizzle-orm';
import { type AnyPgColumn, boolean, date, integer, numeric, pgTable, primaryKey, smallint, text, timestamp } from 'drizzle-orm/pg-core';

export const district = pgTable('district', {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    name: text().notNull().unique(),
    population: integer().notNull(),
    areaKm2: numeric('area_km2', { precision: 7, scale: 2 }).notNull(),
    isCentral: boolean('is_central').notNull().default(false),
});

export const station = pgTable('station', {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    districtId: integer('district_id').notNull().references(() => district.id),
    name: text().notNull(),
    address: text().notNull(),
    capacity: smallint().notNull(),
    latitude: numeric({ precision: 9, scale: 6 }).notNull(),
    longitude: numeric({ precision: 9, scale: 6 }).notNull(),
    openedOn: date('opened_on').notNull(),
});

export const bicycle = pgTable('bicycle', {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    serialNumber: text('serial_number').notNull().unique(),
    model: text().notNull(),
    kind: text().notNull(),
    homeStationId: integer('home_station_id').notNull().references(() => station.id),
    purchasedOn: date('purchased_on').notNull(),
    odometerKm: numeric('odometer_km', { precision: 10, scale: 1 }).notNull().default('0'),
    status: text().notNull().default('free'),
});

export const client = pgTable('client', {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    lastName: text('last_name').notNull(),
    firstName: text('first_name').notNull(),
    phone: text().notNull().unique(),
    email: text().unique(),
    birthDate: date('birth_date').notNull(),
    registeredAt: timestamp('registered_at', { mode: 'string' }).notNull().defaultNow(),
    isBlocked: boolean('is_blocked').notNull().default(false),
    referredBy: integer('referred_by').references((): AnyPgColumn => client.id, { onDelete: 'set null' }),
});

export const tariff = pgTable('tariff', {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    code: text().notNull().unique(),
    name: text().notNull(),
    unlockPrice: numeric('unlock_price', { precision: 8, scale: 2 }).notNull(),
    pricePerMinute: numeric('price_per_minute', { precision: 8, scale: 2 }).notNull(),
    freeMinutes: integer('free_minutes').notNull().default(0),
    isSubscription: boolean('is_subscription').notNull().default(false),
    validFrom: date('valid_from').notNull(),
    validTo: date('valid_to'),
});

export const rental = pgTable('rental', {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    clientId: integer('client_id').notNull().references(() => client.id),
    bicycleId: integer('bicycle_id').notNull().references(() => bicycle.id),
    tariffId: integer('tariff_id').notNull().references(() => tariff.id),
    startStationId: integer('start_station_id').notNull().references(() => station.id),
    endStationId: integer('end_station_id').references(() => station.id),
    startedAt: timestamp('started_at', { mode: 'string' }).notNull(),
    finishedAt: timestamp('finished_at', { mode: 'string' }),
    distanceKm: numeric('distance_km', { precision: 7, scale: 2 }),
    totalCost: numeric('total_cost', { precision: 10, scale: 2 }),
});

export const payment = pgTable('payment', {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    rentalId: integer('rental_id').notNull().unique().references(() => rental.id, { onDelete: 'cascade' }),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    method: text().notNull(),
    status: text().notNull().default('pending'),
    paidAt: timestamp('paid_at', { mode: 'string' }).notNull(),
    externalId: text('external_id').notNull().unique(),
});

export const clientWallet = pgTable('client_wallet', {
    clientId: integer('client_id').primaryKey().references(() => client.id, { onDelete: 'cascade' }),
    balance: numeric({ precision: 10, scale: 2 }).notNull().default('0'),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
});

export const clientFavoriteStation = pgTable('client_favorite_station', {
    clientId: integer('client_id').notNull().references(() => client.id, { onDelete: 'cascade' }),
    stationId: integer('station_id').notNull().references(() => station.id, { onDelete: 'cascade' }),
    addedOn: date('added_on').notNull().default(sql`current_date`),
}, (table) => [primaryKey({ columns: [table.clientId, table.stationId] })]);

export type Station = typeof station.$inferSelect;
export type NewStation = typeof station.$inferInsert;
