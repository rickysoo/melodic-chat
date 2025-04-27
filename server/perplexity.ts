import { Request, Response } from 'express';

export interface PerplexityOptions {
  message: string;
  systemPrompt?: string;
}

export async function searchWithPerplexity(options: PerplexityOptions) {
  const { message, systemPrompt = "Be precise and concise." } = options;
  
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY is not set in environment variables");
  }
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
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
        top_p: 0.9,
        max_tokens: 500,
        search_domain_filter: [],
        return_images: false,
        return_related_questions: false,
        search_recency_filter: "month",
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      citations: data.citations || [],
      model: data.model,
      usage: data.usage
    };
  } catch (error) {
    console.error('Error searching with Perplexity:', error);
    throw error;
  }
}

// Express route handler
export async function handlePerplexitySearch(req: Request, res: Response) {
  try {
    const { message, systemPrompt } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const result = await searchWithPerplexity({
      message,
      systemPrompt
    });
    
    return res.json(result);
  } catch (error) {
    console.error('Perplexity search handler error:', error);
    
    if ((error as Error).message.includes('PERPLEXITY_API_KEY is not set')) {
      return res.status(500).json({ 
        error: 'Perplexity API key is not configured',
        needsApiKey: true 
      });
    }
    
    return res.status(500).json({ 
      error: `Error searching with Perplexity: ${(error as Error).message}` 
    });
  }
}