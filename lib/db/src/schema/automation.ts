import { pgTable, text, serial, boolean, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const emailAccountsTable = pgTable("email_accounts", {
  id: serial("id").primaryKey(),
  label: text("label").notNull().default(""),
  provider: text("provider").notNull().default("gmail"),
  host: text("host").notNull().default("smtp.gmail.com"),
  port: integer("port").notNull().default(587),
  secure: boolean("secure").notNull().default(false),
  user: text("user").notNull().default(""),
  password: text("password").notNull().default(""),
  fromName: text("from_name").notNull().default("DevStudio"),
  fromEmail: text("from_email").notNull().default(""),
  imapEnabled: boolean("imap_enabled").notNull().default(false),
  imapHost: text("imap_host").notNull().default("imap.gmail.com"),
  imapPort: integer("imap_port").notNull().default(993),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const automationSettingsTable = pgTable("automation_settings", {
  id: serial("id").primaryKey(),
  autoHuntEnabled: boolean("auto_hunt_enabled").notNull().default(false),
  huntCategory: text("hunt_category").notNull().default("Restaurant"),
  huntCity: text("hunt_city").notNull().default(""),
  huntCountry: text("hunt_country").notNull().default(""),
  huntCount: integer("hunt_count").notNull().default(10),
  huntExtraContext: text("hunt_extra_context").notNull().default(""),
  huntIntervalHours: integer("hunt_interval_hours").notNull().default(24),
  autoScore: boolean("auto_score").notNull().default(true),
  autoEmail: boolean("auto_email").notNull().default(false),
  emailDelayMinutes: integer("email_delay_minutes").notNull().default(20),
  autoReply: boolean("auto_reply").notNull().default(false),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  runStats: jsonb("run_stats").default("{}"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type EmailAccount = typeof emailAccountsTable.$inferSelect;
export type AutomationSettings = typeof automationSettingsTable.$inferSelect;
