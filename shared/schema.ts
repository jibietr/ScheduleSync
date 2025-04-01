import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  timezone: text("timezone").notNull().default("America/New_York"),
  calendarUrl: text("calendar_url"),
  autoSync: boolean("auto_sync").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Meeting template model
export const meetingTemplates = pgTable("meeting_templates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in minutes
  location: text("location").notNull().default("zoom"),
  daysOfWeek: json("days_of_week").$type<number[]>().notNull(),
  startTime: text("start_time").notNull(), // Format: "HH:MM" in 24h format
  endTime: text("end_time").notNull(),     // Format: "HH:MM" in 24h format
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  bufferBefore: integer("buffer_before").default(0),
  bufferAfter: integer("buffer_after").default(0),
  additionalQuestions: text("additional_questions"),
  collectName: boolean("collect_name").default(true),
  collectEmail: boolean("collect_email").default(true),
  collectPhone: boolean("collect_phone").default(false),
  notifyOnBooking: boolean("notify_on_booking").default(true),
  notifyCancellation: boolean("notify_cancellation").default(true),
  notifyReminder: boolean("notify_reminder").default(true),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Booking model
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull(),
  inviteeName: text("invitee_name").notNull(),
  inviteeEmail: text("invitee_email").notNull(),
  inviteePhone: text("invitee_phone"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  additionalInfo: text("additional_info"),
  status: text("status").notNull().default("confirmed"), // "confirmed", "cancelled", "completed"
  timezone: text("timezone").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Calendar events model
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  externalId: text("external_id"),
  summary: text("summary"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  lastSynced: timestamp("last_synced").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertMeetingTemplateSchema = createInsertSchema(meetingTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
  createdAt: true,
  lastSynced: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type MeetingTemplate = typeof meetingTemplates.$inferSelect;
export type InsertMeetingTemplate = z.infer<typeof insertMeetingTemplateSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
