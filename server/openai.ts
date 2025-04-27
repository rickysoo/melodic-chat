import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

export interface ChatOptions {
  apiKey: string;
  message: string;
  model?: string;
  systemPrompt?: string;
  sessionId?: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

// Maximum number of messages to include in the conversation history
const MAX_CONVERSATION_HISTORY = 50;

export async function generateChatResponse(options: ChatOptions) {
  const { apiKey, message, model = "gpt-4o-mini", systemPrompt, conversationHistory } = options;
  
  // Using GPT-4o-mini as the default model which is faster and more efficient
  const openai = new OpenAI({ apiKey });
  
  try {
    // Default system prompt if none is provided
    const defaultSystemPrompt = "You are Melodic, a helpful, creative, and musically-inclined AI assistant. You have a cheerful, friendly personality and occasionally incorporate musical references into your responses. Format your responses with multiple paragraphs for better readability. Use markdown formatting like **bold**, *italic*, and bullet points where appropriate. Use emojis where appropriate, especially music-related ones.";
    
    const finalSystemPrompt = systemPrompt || defaultSystemPrompt;

    // Create the messages array with system prompt
    const systemMessage: ChatCompletionMessageParam = {
      role: "system",
      content: finalSystemPrompt
    };
    
    // Base messages array starts with the system prompt
    const messages: ChatCompletionMessageParam[] = [systemMessage];
    
    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      // Convert the role format from 'user'|'assistant' to OpenAI's expected format
      // and only include up to MAX_CONVERSATION_HISTORY messages
      const formattedHistory = conversationHistory
        .slice(-MAX_CONVERSATION_HISTORY)
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        } as ChatCompletionMessageParam));
        
      messages.push(...formattedHistory);
    }
    
    // Add the current user message
    const userMessage: ChatCompletionMessageParam = {
      role: "user",
      content: message
    };
    
    messages.push(userMessage);
    
    // Make the API call with the conversation history
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 500
    });
    
    return response;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw error;
  }
}
