import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").default("citizen"), // citizen, admin, department_staff
});

export const issues = pgTable("issues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // roads, sanitation, electricity, water, traffic, environment, other
  priority: text("priority").notNull(), // low, medium, high
  status: text("status").default("new"), // new, in_progress, resolved, closed
  state: text("state").notNull(),
  district: text("district").notNull(),
  location: text("location").notNull(),
  coordinates: json("coordinates"), // {lat: number, lng: number}
  imageUrl: text("image_url"),
  reportedBy: varchar("reported_by").references(() => users.id),
  assignedTo: text("assigned_to"), // department name
  aiCategory: text("ai_category"), // AI-suggested category
  aiConfidence: integer("ai_confidence"), // confidence score 0-100
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  issueId: varchar("issue_id").references(() => issues.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").default(false), // for admin/department comments
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertIssueSchema = createInsertSchema(issues).pick({
  title: true,
  description: true,
  category: true,
  priority: true,
  state: true,
  district: true,
  location: true,
  coordinates: true,
  imageUrl: true,
}).extend({
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  issueId: true,
  content: true,
  isInternal: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type Issue = typeof issues.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
