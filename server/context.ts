import { db } from './db';
import { userContexts, UserContext, InsertUserContext } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Interface for Context Manager
export interface IContextManager {
  getContext(sessionId: string): Promise<Record<string, string>>;
  updateContext(sessionId: string, contextData: Record<string, string>): Promise<void>;
  extractUserInfo(message: string, context: Record<string, string>): Record<string, string>;
}

export class DatabaseContextManager implements IContextManager {
  async getContext(sessionId: string): Promise<Record<string, string>> {
    try {
      const [contextRecord] = await db
        .select()
        .from(userContexts)
        .where(eq(userContexts.sessionId, sessionId));
      
      if (contextRecord) {
        return contextRecord.context;
      }
      
      // If no context found, create an empty one
      const newContext: Record<string, string> = {};
      await this.updateContext(sessionId, newContext);
      return newContext;
    } catch (error) {
      console.error("Error getting context:", error);
      return {};
    }
  }

  async updateContext(sessionId: string, contextData: Record<string, string>): Promise<void> {
    try {
      // Check if context exists
      const [existingContext] = await db
        .select()
        .from(userContexts)
        .where(eq(userContexts.sessionId, sessionId));
      
      if (existingContext) {
        // Update existing context
        await db
          .update(userContexts)
          .set({ 
            context: contextData,
            lastUpdated: new Date()
          })
          .where(eq(userContexts.sessionId, sessionId));
      } else {
        // Create new context
        await db
          .insert(userContexts)
          .values({
            sessionId,
            context: contextData,
          });
      }
    } catch (error) {
      console.error("Error updating context:", error);
    }
  }

  // Extract user information from messages
  extractUserInfo(message: string, currentContext: Record<string, string>): Record<string, string> {
    const updatedContext = { ...currentContext };
    
    // Look for name patterns
    const namePatterns = [
      /my name is ([A-Z][a-z]+)/i,
      /I am ([A-Z][a-z]+)/i,
      /I'm ([A-Z][a-z]+)/i,
      /call me ([A-Z][a-z]+)/i,
    ];
    
    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        if (name.length > 1) {
          updatedContext["name"] = name;
          break;
        }
      }
    }
    
    return updatedContext;
  }
}

// Singleton instance
export const contextManager = new DatabaseContextManager();

// Utility function to generate a session ID
export function generateSessionId(): string {
  return nanoid();
}