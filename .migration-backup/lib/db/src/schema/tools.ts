import { pgTable, text, serial, boolean, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const toolStatusEnum = pgEnum("tool_status", ["available", "coming_soon", "beta"]);

export const toolsTable = pgTable("tools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  status: toolStatusEnum("status").notNull().default("coming_soon"),
  featured: boolean("featured").notNull().default(false),
  emoji: text("emoji"),
  tagline: text("tagline"),
  features: text("features").array().notNull().default([]),
});

export const insertToolSchema = createInsertSchema(toolsTable).omit({ id: true });
export type InsertTool = z.infer<typeof insertToolSchema>;
export type Tool = typeof toolsTable.$inferSelect;
