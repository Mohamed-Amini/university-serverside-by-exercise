import { relations } from 'drizzle-orm';
import { district, station } from './model.ts';

export const districtRelations = relations(district, ({ many }) => ({
    stations: many(station),
}));

export const stationRelations = relations(station, ({ one }) => ({
    district: one(district, { fields: [station.districtId], references: [district.id] }),
}));
