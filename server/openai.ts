import OpenAI from "openai";

export interface ChatOptions {
  apiKey: string;
  message: string;
  model?: string;
  systemPrompt?: string;
}

export async function generateChatResponse(options: ChatOptions) {
  const { apiKey, message, model = "gpt-4o", systemPrompt } = options;
  
  // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  const openai = new OpenAI({ apiKey });
  
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: systemPrompt || "You are Melodic, a helpful, creative, and musically-inclined AI assistant. You have a cheerful, friendly personality and occasionally incorporate musical references into your responses. Keep responses concise and use emojis where appropriate, especially music-related ones."
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
