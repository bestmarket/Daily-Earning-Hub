import { pgTable, text, serial, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const customRequestStatusEnum = pgEnum("custom_request_status", [
  "new",
  "contacted",
  "quoted",
  "paid",
  "delivered",
  "cancelled",
]);

export const customRequestsTable = pgTable("custom_requests", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  businessType: text("business_type"),
  description: text("description").notNull(),
  budget: text("budget"),
  whatsapp: text("whatsapp"),
  status: customRequestStatusEnum("status").notNull().default("new"),
  paymentMethod: text("payment_method"),
  paymentAmount: numeric("payment_amount", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCustomRequestSchema = createInsertSchema(customRequestsTable).omit({ id: true, createdAt: true });
export type InsertCustomRequest = z.infer<typeof insertCustomRequestSchema>;
export type CustomRequest = typeof customRequestsTable.$inferSelect;
