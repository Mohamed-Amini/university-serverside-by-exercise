import { date, integer, numeric, pgTable, smallint, text } from 'drizzle-orm/pg-core';

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

export type NewStation = typeof station.$inferInsert;
