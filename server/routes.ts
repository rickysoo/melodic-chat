import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import path from "path";
import express from "express";
import { handlePerplexitySearch } from "./perplexity";
import { generateChatResponse } from "./openai";
import { generateSessionId } from "./context";

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
  // Chat endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const validation = chatRequestSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request data", errors: validation.error.errors });
      }
      
      let { message, apiKey, model, sessionId, conversationHistory } = validation.data;
      
      // If the client is requesting to use the environment API key
      if (apiKey === "use_env") {
        apiKey = process.env.OPENAI_API_KEY || "";
        if (!apiKey) {
          return res.status(500).json({ message: "OpenAI API key not found in environment variables" });
        }
      }
      
      // Generate a sessionId if one wasn't provided
      if (!sessionId) {
        sessionId = generateSessionId();
      }
      
      // Send request to OpenAI with conversation history
      const response = await generateChatResponse({
        apiKey,
        message,
        model,
        sessionId,
        conversationHistory,
        systemPrompt: "You are Melodic, a helpful, creative, and musically-inclined AI assistant. You have a cheerful, friendly personality and occasionally incorporate musical references into your responses. Format your responses with multiple paragraphs for better readability. Use markdown formatting like **bold**, *italic*, and bullet points where appropriate. Use emojis where appropriate, especially music-related ones."
      });
      
      // Add the sessionId to the response so the client can store it
      const responseWithSessionId = {
        ...response,
        sessionId
      };
      
      res.json(responseWithSessionId);
    } catch (error: any) {
      console.error("OpenAI API error:", error);
      
      // Handle different error types
      if (error.response) {
        // OpenAI API error
        return res.status(error.response.status || 500).json({
          message: error.response.data?.error?.message || "OpenAI API error",
        });
      }
      
      // Network or other errors
      res.status(500).json({
        message: error.message || "An error occurred while processing your request",
      });
    }
  });

  // Perplexity web search endpoint
  app.post('/api/search', handlePerplexitySearch);

  const httpServer = createServer(app);
  return httpServer;
}
