import { Request, Response } from 'express';

export interface OpenRouterSearchOptions {
  message: string;
  systemPrompt?: string;
}

export async function searchWithOpenRouter(options: OpenRouterSearchOptions) {
  const { message, systemPrompt = "You are a helpful web search assistant with real-time internet access. Provide accurate information from the web, with sources cited as numbered links at the end of your response. Keep your responses concise and informative." } = options;
  
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables");
  }
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://melodic.replit.app',
        'X-Title': 'Melodic AI Assistant'
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-search-preview",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.2,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    // Extract sources/citations if available in the response
    let content = data.choices[0].message.content;
    let citations = extractCitations(content);
    
    return {
      content,
      citations,
      model: data.model,
      usage: data.usage
    };
  } catch (error) {
    console.error('Error searching with OpenRouter:', error);
    throw error;
  }
}

// Helper function to extract citations from the response
function extractCitations(content: string): string[] {
  const citations: string[] = [];
  
  // Look for URLs in the text, common formats that might be used
  const urlRegex = /\[(\d+)\]\s*(\bhttps?:\/\/[^\s,]+)/g;
  let match;
  
  while ((match = urlRegex.exec(content)) !== null) {
    citations.push(match[2]);
  }
  
  // If no numbered citations, try to find any URLs
  if (citations.length === 0) {
    const simpleUrlRegex = /\bhttps?:\/\/[^\s,)]+/g;
    let urlMatch;
    
    while ((urlMatch = simpleUrlRegex.exec(content)) !== null) {
      citations.push(urlMatch[0]);
    }
  }
  
  return citations;
}

// Express route handler
export async function handleOpenRouterSearch(req: Request, res: Response) {
  try {
    const { message, systemPrompt } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const result = await searchWithOpenRouter({
      message,
      systemPrompt
    });
    
    return res.json(result);
  } catch (error) {
    console.error('OpenRouter search handler error:', error);
    
    if ((error as Error).message.includes('OPENROUTER_API_KEY is not set')) {
      return res.status(500).json({ 
        error: 'OpenRouter API key is not configured',
        needsApiKey: true 
      });
    }
    
    return res.status(500).json({ 
      error: `Error searching with OpenRouter: ${(error as Error).message}` 
    });
  }
}