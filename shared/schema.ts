import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: text("session_id").notNull(), // Session ID to group messages
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Table for storing user context/memory
export const userContexts = pgTable("user_contexts", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").unique().notNull(),
  context: json("context").$type<Record<string, string>>().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Chat API schemas
export const chatRequestSchema = z.object({
  message: z.string().min(1, "Message is required"),
  apiKey: z.string().min(1, "API key is required"),
  model: z.string().default("gpt-4o"),
  sessionId: z.string().optional(),
});

export const chatResponseSchema = z.object({
  id: z.string(),
  model: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: z.object({
        role: z.string(),
        content: z.string(),
      }),
    })
  ),
});

// User schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  userId: true,
  sessionId: true,
  role: true,
  content: true,
});

export const insertUserContextSchema = createInsertSchema(userContexts).pick({
  sessionId: true,
  context: true,
});

// Schema for user context API operations
export const userContextSchema = z.object({
  sessionId: z.string(),
  context: z.record(z.string()),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertUserContext = z.infer<typeof insertUserContextSchema>;
export type UserContext = typeof userContexts.$inferSelect;

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
