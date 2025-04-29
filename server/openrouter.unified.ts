import { ChatCompletionMessageParam } from "openai/resources";

export interface ChatOptions {
  message: string;
  model?: string;
  systemPrompt?: string;
  sessionId?: string;
  isAuthenticated?: boolean;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

// Maximum number of messages to include in the conversation history
const MAX_CONVERSATION_HISTORY = 50;

// Models for authenticated and non-authenticated users
const AUTH_MODEL = "openai/gpt-4o-mini-search-preview"; // With web search capabilities
const NON_AUTH_MODEL = "openai/gpt-4o-mini"; // Standard model without web search

// Use OpenRouter to handle chat requests with different models based on authentication
export async function generateChatResponse(options: ChatOptions) {
  const { 
    message, 
    model, 
    systemPrompt, 
    conversationHistory,
    isAuthenticated = false
  } = options;
  
  // Determine which model to use based on authentication status
  const selectedModel = model || (isAuthenticated ? AUTH_MODEL : NON_AUTH_MODEL);
  
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables");
  }
  
  try {
    // Default system prompt if none is provided
    const defaultSystemPrompt = `You are Melodic, a helpful, creative, and musically-inclined AI assistant with real-time web search capabilities. You have a cheerful, friendly personality and occasionally incorporate musical references into your responses.

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

Use emojis where appropriate, especially music-related ones like 🎵, 🎶, 🎸, but don't overuse them.`;
    
    const finalSystemPrompt = systemPrompt || defaultSystemPrompt;

    // Create messages array starting with system prompt
    const messages = [
      {
        role: "system",
        content: finalSystemPrompt
      }
    ];
    
    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      // Only include up to MAX_CONVERSATION_HISTORY messages
      const limitedHistory = conversationHistory
        .slice(-MAX_CONVERSATION_HISTORY)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
      messages.push(...limitedHistory);
    }
    
    // Add the current user message
    messages.push({
      role: "user",
      content: message
    });
    
    // Make the API call to OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://melodic.replit.app',
        'X-Title': 'Melodic AI Assistant'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    // Format the response to match OpenAI's response structure
    return {
      id: data.id,
      model: data.model,
      choices: data.choices,
      usage: data.usage
    };
  } catch (error) {
    console.error("OpenRouter API error:", error);
    throw error;
  }
}