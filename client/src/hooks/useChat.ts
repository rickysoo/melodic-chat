import { useState, useCallback, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { Message, ChatState, ChatResponse } from '@/types';
import { apiRequest } from '@/lib/queryClient';

interface UseChatProps {
  apiKey: string | "env"; // 'env' means use the environment variable on the server
  model: string;
  onMessageSent?: () => void;
  onMessageReceived?: () => void;
}

// Maximum number of messages to store
const MAX_STORED_MESSAGES = 50;

// Helper function to load messages from localStorage
const loadMessagesFromStorage = (): Message[] => {
  try {
    const storedMessages = localStorage.getItem('melodic_chat_messages');
    if (storedMessages) {
      return JSON.parse(storedMessages);
    }
  } catch (error) {
    console.error('Failed to load messages from localStorage:', error);
  }
  return [];
};

// Helper function to save messages to localStorage
const saveMessagesToStorage = (messages: Message[]) => {
  try {
    // Keep only the last MAX_STORED_MESSAGES messages
    const messagesToStore = messages.slice(-MAX_STORED_MESSAGES);
    localStorage.setItem('melodic_chat_messages', JSON.stringify(messagesToStore));
  } catch (error) {
    console.error('Failed to save messages to localStorage:', error);
  }
};

export function useChat({ apiKey, model, onMessageSent, onMessageReceived }: UseChatProps) {
  // Initialize with messages from localStorage
  const [state, setState] = useState<ChatState>({
    messages: loadMessagesFromStorage(),
    isTyping: false,
    error: null
  });

  const sendMessage = useCallback(async (content: string) => {
    // Add user message to state
    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content,
      timestamp: Date.now()
    };

    setState(prev => {
      const updatedMessages = [...prev.messages, userMessage];
      // Save to localStorage
      saveMessagesToStorage(updatedMessages);
      return {
        ...prev,
        messages: updatedMessages,
        isTyping: true,
        error: null
      };
    });

    if (onMessageSent) {
      onMessageSent();
    }

    try {
      // Send request to server
      const response = await apiRequest('POST', '/api/chat', {
        message: content,
        apiKey: apiKey === "env" ? "use_env" : apiKey, // Signal server to use env variable
        model
      });

      const data: ChatResponse = await response.json();
      
      // Format the assistant response to include a musical note at the end
      let assistantContent = data.choices[0].message.content;
      if (!assistantContent.endsWith('🎵')) {
        assistantContent += ' 🎵';
      }
      
      // Add assistant response to state
      const assistantMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: assistantContent,
        timestamp: Date.now()
      };

      setState(prev => {
        const updatedMessages = [...prev.messages, assistantMessage];
        // Save to localStorage
        saveMessagesToStorage(updatedMessages);
        return {
          ...prev,
          messages: updatedMessages,
          isTyping: false
        };
      });

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

  // Function to clear chat history
  const clearChatHistory = useCallback(() => {
    localStorage.removeItem('melodic_chat_messages');
    setState({
      messages: [],
      isTyping: false,
      error: null
    });
  }, []);

  return {
    ...state,
    sendMessage,
    clearChatHistory
  };
}
