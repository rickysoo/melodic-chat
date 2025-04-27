import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { z } from "zod";

const chatRequestSchema = z.object({
  message: z.string(),
  apiKey: z.string(),
  model: z.string().default("gpt-4o")
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const validation = chatRequestSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request data", errors: validation.error.errors });
      }
      
      const { message, apiKey, model } = validation.data;
      
      // Initialize OpenAI with the user's API key
      const openai = new OpenAI({ apiKey });
      
      // Send request to OpenAI
      const response = await openai.chat.completions.create({
        model: model, // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are Melodic, a helpful, creative, and musically-inclined AI assistant. You have a cheerful, friendly personality and occasionally incorporate musical references into your responses. Keep responses concise and use emojis where appropriate, especially music-related ones."
          },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      });
      
      res.json(response);
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

  const httpServer = createServer(app);
  return httpServer;
}
