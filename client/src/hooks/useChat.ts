import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { Message, ChatState, ChatResponse } from '@/types';
import { apiRequest } from '@/lib/queryClient';

interface UseChatProps {
  apiKey: string | null;
  model: string;
  onMessageSent?: () => void;
  onMessageReceived?: () => void;
}

export function useChat({ apiKey, model, onMessageSent, onMessageReceived }: UseChatProps) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isTyping: false,
    error: null
  });

  const sendMessage = useCallback(async (content: string) => {
    if (!apiKey) {
      setState(prev => ({ ...prev, error: 'API key is required' }));
      return;
    }

    // Add user message to state
    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content,
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true,
      error: null
    }));

    if (onMessageSent) {
      onMessageSent();
    }

    try {
      // Send request to server
      const response = await apiRequest('POST', '/api/chat', {
        message: content,
        apiKey,
        model
      });

      const data: ChatResponse = await response.json();
      
      // Add assistant response to state
      const assistantMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: Date.now()
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isTyping: false
      }));

      if (onMessageReceived) {
        onMessageReceived();
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        isTyping: false,
        error: error instanceof Error ? error.message : 'Failed to send message'
      }));
    }
  }, [apiKey, model, onMessageSent, onMessageReceived]);

  return {
    ...state,
    sendMessage
  };
}
