import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import path from "path";
import express from "express";
import { generateChatResponse } from "./openrouter.unified";
import { generateSessionId } from "./context";
import { insertChatMessageSchema } from "@shared/schema";

const chatRequestSchema = z.object({
  message: z.string(),
  apiKey: z.string(),
  model: z.string().default("gpt-4o"),
  sessionId: z.string().optional(),
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string()
    })
  ).optional()
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve PWA static files from the public directory
  const publicPath = path.resolve(process.cwd(), 'client/public');
  app.use(express.static(publicPath, {
    setHeaders: (res, filePath) => {
      // Set proper MIME types for PWA files
      if (filePath.endsWith('manifest.json')) {
        res.setHeader('Content-Type', 'application/manifest+json');
      }
      else if (filePath.endsWith('service-worker.js')) {
        res.setHeader('Content-Type', 'application/javascript');
        // No cache for service worker
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      }
    }
  }));
  
  // Messages API endpoints
  app.get('/api/messages/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      const messages = await storage.getMessages(sessionId, limit);
      res.json(messages);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: error.message || "Failed to fetch messages" });
    }
  });
  
  app.post('/api/messages', async (req, res) => {
    try {
      // Validate the message data
      const validation = insertChatMessageSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid message data", 
          errors: validation.error.errors 
        });
      }
      
      const messageData = validation.data;
      const savedMessage = await storage.createMessage(messageData);
      res.status(201).json(savedMessage);
    } catch (error: any) {
      console.error("Error saving message:", error);
      res.status(500).json({ message: error.message || "Failed to save message" });
    }
  });
  
  app.delete('/api/messages/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      await storage.deleteAllMessages(sessionId);
      res.status(200).json({ message: "All messages deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting messages:", error);
      res.status(500).json({ message: error.message || "Failed to delete messages" });
    }
  });
  // Chat endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const validation = chatRequestSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request data", errors: validation.error.errors });
      }
      
      let { message, apiKey, model, sessionId, conversationHistory } = validation.data;
      
      // OpenRouter uses environment variable - we don't need the API key from client anymore
      // Keep this for backward compatibility with the client
      if (apiKey === "use_env" || true) { // Always use the environment variable now
        // We'll use OPENROUTER_API_KEY from the environment
        if (!process.env.OPENROUTER_API_KEY) {
          return res.status(500).json({ message: "OpenRouter API key not found in environment variables" });
        }
      }
      
      // Generate a sessionId if one wasn't provided
      if (!sessionId) {
        sessionId = generateSessionId();
      }
      
      // Send request to OpenRouter with conversation history
      const response = await generateChatResponse({
        message,
        model: "openai/gpt-4o-mini-search-preview", // Override with the OpenRouter model
        sessionId,
        conversationHistory,
        systemPrompt: `You are Melodic, a helpful, creative, and musically-inclined AI assistant with real-time web search capabilities. You have a cheerful, friendly personality and occasionally incorporate musical references into your responses.

When searching for information online, cite your sources with numbered links at the end of your response.

Format your responses with proper markdown:
- Use **bold** for emphasis and section headings
- Use *italic* for book titles, definitions, or lighter emphasis
- Create proper bullet point lists with '-' or '*' at the start of lines
- Use numbered lists (1. 2. 3.) for sequential items or steps
- Format tables with proper markdown syntax using | and - characters
- Use code blocks with \`\`\` for code or structured data
- Break your text into multiple paragraphs for better readability
- Use headings with # and ## for main sections

Use emojis where appropriate, especially music-related ones like 🎵, 🎶, 🎸, but don't overuse them.`
      });
      
      // Store both the user message and assistant response in the database
      try {
        // Store user message
        await storage.createMessage({
          role: 'user',
          content: message,
          sessionId,
          // userId is optional and can be added when authentication is implemented
        });
        
        // Store assistant response
        const assistantMessage = response.choices[0].message.content;
        await storage.createMessage({
          role: 'assistant',
          content: assistantMessage,
          sessionId,
          // userId is optional and can be added when authentication is implemented
        });
      } catch (dbError) {
        console.error("Failed to store messages in database:", dbError);
        // Continue anyway - this is not critical for the response
      }
      
      // Add the sessionId to the response so the client can store it
      const responseWithSessionId = {
        ...response,
        sessionId
      };
      
      res.json(responseWithSessionId);
    } catch (error: any) {
      console.error("OpenRouter API error:", error);
      
      // Network or other errors
      res.status(500).json({
        message: error.message || "An error occurred while processing your request",
      });
    }
  });

  // We no longer need a separate search endpoint as search is integrated directly in chat

  const httpServer = createServer(app);
  return httpServer;
}
