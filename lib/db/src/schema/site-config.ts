import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const siteConfigTable = pgTable("site_config", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type SiteConfig = typeof siteConfigTable.$inferSelect;
