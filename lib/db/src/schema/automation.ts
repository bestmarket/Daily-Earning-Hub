import { pgTable, text, serial, boolean, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";

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
  sentCount: integer("sent_count").notNull().default(0),
  dailyLimit: integer("daily_limit").notNull().default(0),
  sentToday: integer("sent_today").notNull().default(0),
  lastSentDay: text("last_sent_day").notNull().default(""),
  consecutiveFailures: integer("consecutive_failures").notNull().default(0),
  lastError: text("last_error").notNull().default(""),
  lastErrorAt: timestamp("last_error_at"),
  autoPaused: boolean("auto_paused").notNull().default(false),
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
  followUpEnabled: boolean("follow_up_enabled").notNull().default(false),
  followUpDays: integer("follow_up_days").notNull().default(4),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  runStats: jsonb("run_stats").default("{}"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const emailTrackingTable = pgTable("email_tracking", {
  id: serial("id").primaryKey(),
  trackingId: text("tracking_id").notNull().unique(),
  prospectEmail: text("prospect_email").notNull().default(""),
  emailType: text("email_type").notNull().default("outreach"),
  subject: text("subject").notNull().default(""),
  opens: integer("opens").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  firstOpenAt: timestamp("first_open_at"),
  lastOpenAt: timestamp("last_open_at"),
  firstClickAt: timestamp("first_click_at"),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
}, (t) => [index("idx_email_tracking_email").on(t.prospectEmail)]);

// ─── Follow-up queue ──────────────────────────────────────────────────────────

export const followUpQueueTable = pgTable("follow_up_queue", {
  id: serial("id").primaryKey(),
  prospectEmail: text("prospect_email").notNull(),
  businessName: text("business_name").notNull().default(""),
  originalSubject: text("original_subject").notNull().default(""),
  originalBody: text("original_body").notNull().default(""),
  firstSentAt: timestamp("first_sent_at").notNull().defaultNow(),
  followUpSentAt: timestamp("follow_up_sent_at"),
  followUpDays: integer("follow_up_days").notNull().default(4),
  accountId: integer("account_id"),
  status: text("status").notNull().default("pending"), // pending | sent | skipped | opened
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type EmailAccount = typeof emailAccountsTable.$inferSelect;
export type AutomationSettings = typeof automationSettingsTable.$inferSelect;
export type EmailTracking = typeof emailTrackingTable.$inferSelect;
export type FollowUpQueue = typeof followUpQueueTable.$inferSelect;
