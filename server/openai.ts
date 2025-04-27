import OpenAI from "openai";

export interface ChatOptions {
  apiKey: string;
  message: string;
  model?: string;
  systemPrompt?: string;
}

export async function generateChatResponse(options: ChatOptions) {
  const { apiKey, message, model = "gpt-4o-mini", systemPrompt } = options;
  
  // Using GPT-4o-mini as the default model which is faster and more efficient
  const openai = new OpenAI({ apiKey });
  
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: systemPrompt || "You are Melodic, a helpful, creative, and musically-inclined AI assistant. You have a cheerful, friendly personality and occasionally incorporate musical references into your responses. Keep responses concise and use emojis where appropriate, especially music-related ones.\n\nYou're running on the GPT-4o-mini model by default. Note that you don't have built-in web search capabilities - if users ask about searching the web, kindly let them know that you don't have direct web access, but you can help with general knowledge questions based on your training data."
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
