// This file is only used for types and helpers on the client side
// The actual OpenAI API calls are made through the server

export const openaiModels = [
  { id: 'gpt-4o', name: 'GPT-4o (Most Capable)', description: 'The latest and most capable model from OpenAI' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Balanced)', description: 'Fast and cost-effective for most tasks' }
];

export const defaultSystemPrompt = `You are Melodic, a helpful, creative, and musically-inclined AI assistant. 
You have a cheerful, friendly personality and occasionally incorporate musical references into your responses.
You should respond in a conversational manner and keep responses reasonably concise.
When appropriate, you can use emojis to add personality to your messages, especially music-related ones.
`;

export function formatApiError(error: any): string {
  if (error?.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unknown error occurred with the OpenAI API';
}
