import OpenAI from "openai";
import { contextManager } from "./context";

export interface ChatOptions {
  apiKey: string;
  message: string;
  model?: string;
  systemPrompt?: string;
  sessionId?: string;
}

export async function generateChatResponse(options: ChatOptions) {
  const { apiKey, message, model = "gpt-4o-mini", systemPrompt, sessionId } = options;
  
  // Using GPT-4o-mini as the default model which is faster and more efficient
  const openai = new OpenAI({ apiKey });
  
  try {
    // Get user context if a session ID is provided
    let userContext: Record<string, string> = {};
    let enhancedSystemPrompt = systemPrompt;
    
    if (sessionId) {
      // Get existing context
      userContext = await contextManager.getContext(sessionId);
      
      // Extract any new context from the current message
      const updatedContext = contextManager.extractUserInfo(message, userContext);
      
      // If context has changed, update it
      if (JSON.stringify(updatedContext) !== JSON.stringify(userContext)) {
        userContext = updatedContext;
        await contextManager.updateContext(sessionId, userContext);
      }
      
      // Enhance the system prompt with user context
      if (Object.keys(userContext).length > 0) {
        const contextDetails = Object.entries(userContext)
          .map(([key, value]) => `The user's ${key} is ${value}.`)
          .join(' ');
          
        enhancedSystemPrompt = (systemPrompt || 
          "You are Melodic, a helpful, creative, and musically-inclined AI assistant. You have a cheerful, friendly personality and occasionally incorporate musical references into your responses. Keep responses concise and use emojis where appropriate, especially music-related ones.\n\n") +
          `\n\nContextual information about the user: ${contextDetails} Be sure to remember and use this information appropriately in your responses.`;
      }
    }
    
    // Default system prompt if none is provided and no context is available
    if (!enhancedSystemPrompt) {
      enhancedSystemPrompt = "You are Melodic, a helpful, creative, and musically-inclined AI assistant. You have a cheerful, friendly personality and occasionally incorporate musical references into your responses. Keep responses concise and use emojis where appropriate, especially music-related ones.\n\nYou're running on the GPT-4o-mini model by default. Note that you don't have built-in web search capabilities - if users ask about searching the web, kindly let them know that you don't have direct web access, but you can help with general knowledge questions based on your training data.";
    }
    
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: enhancedSystemPrompt
        },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    return response;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}
