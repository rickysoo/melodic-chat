import { users, chatMessages, type User, type InsertUser, type ChatMessage, type InsertChatMessage } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Storage interface with user and chat message methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Chat message methods
  getMessages(sessionId: string, limit?: number): Promise<ChatMessage[]>;
  createMessage(message: InsertChatMessage): Promise<ChatMessage>;
  deleteAllMessages(sessionId: string): Promise<void>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Chat message methods
  async getMessages(sessionId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      // Get the most recent messages for the session, up to the limit
      const messages = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(limit);
      
      // Return in chronological order (oldest first)
      return messages.reverse();
    } catch (error) {
      console.error("Error getting messages:", error);
      return [];
    }
  }
  
  async createMessage(message: InsertChatMessage): Promise<ChatMessage> {
    try {
      const [savedMessage] = await db
        .insert(chatMessages)
        .values(message)
        .returning();
      
      return savedMessage;
    } catch (error) {
      console.error("Error creating message:", error);
      throw error;
    }
  }
  
  async deleteAllMessages(sessionId: string): Promise<void> {
    try {
      await db
        .delete(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId));
    } catch (error) {
      console.error("Error deleting messages:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
