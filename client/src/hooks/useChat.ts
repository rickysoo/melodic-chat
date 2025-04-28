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

// Type for the enhanced ChatResponse that includes sessionId
interface EnhancedChatResponse extends ChatResponse {
  sessionId: string;
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

// Helper function to load session ID from localStorage
const loadSessionId = (): string | null => {
  try {
    return localStorage.getItem('melodic_session_id');
  } catch (error) {
    console.error('Failed to load session ID from localStorage:', error);
    return null;
  }
};

// Helper function to save session ID to localStorage
const saveSessionId = (sessionId: string) => {
  try {
    localStorage.setItem('melodic_session_id', sessionId);
  } catch (error) {
    console.error('Failed to save session ID to localStorage:', error);
  }
};

export function useChat({ apiKey, model, onMessageSent, onMessageReceived }: UseChatProps) {
  // Initialize with empty messages, we'll load them from storage or db
  const [state, setState] = useState<ChatState>({
    messages: [],
    isTyping: false,
    error: null
  });
  
  // Load or initialize the session ID
  const [sessionId, setSessionId] = useState<string | null>(loadSessionId());
  
  // Load messages from database if sessionId exists
  useEffect(() => {
    if (!sessionId) {
      // If no sessionId, fall back to localStorage
      setState(prev => ({
        ...prev,
        messages: loadMessagesFromStorage()
      }));
      return;
    }
    
    // Function to load messages from the database
    const loadMessagesFromDB = async () => {
      try {
        const response = await fetch(`/api/messages/${sessionId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.status}`);
        }
        
        const dbMessages = await response.json();
        
        // If we have messages from the database, use those
        if (dbMessages && dbMessages.length > 0) {
          // Transform to our Message format with nanoid ids
          const formattedMessages: Message[] = dbMessages.map((msg: any) => ({
            id: nanoid(),
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.createdAt).getTime()
          }));
          
          setState(prev => ({
            ...prev,
            messages: formattedMessages
          }));
          
          // Save to localStorage as backup
          saveMessagesToStorage(formattedMessages);
        } else {
          // If no messages in DB, fall back to localStorage
          setState(prev => ({
            ...prev,
            messages: loadMessagesFromStorage()
          }));
        }
      } catch (error) {
        console.error('Failed to load messages from database:', error);
        // Fall back to localStorage if DB fetch fails
        setState(prev => ({
          ...prev,
          messages: loadMessagesFromStorage()
        }));
      }
    };
    
    loadMessagesFromDB();
  }, [sessionId]);

  const sendMessage = useCallback(async (content: string) => {
    // Add user message to state
    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content,
      timestamp: Date.now()
    };

    // We need to update and get the latest messages synchronously
    // to ensure we have the most current messages when sending the API request
    let currentMessages: Message[] = [];
    
    setState(prev => {
      const updatedMessages = [...prev.messages, userMessage];
      // Save to localStorage
      saveMessagesToStorage(updatedMessages);
      // Update our local reference to the current messages
      currentMessages = updatedMessages;
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
      // Format conversation history for API (last 50 messages)
      const formattedHistory = currentMessages.slice(-MAX_STORED_MESSAGES).map((msg: Message) => ({
        role: msg.role,
        content: msg.content
      }));

      // Send request to server with conversation history
      const response = await apiRequest('POST', '/api/chat', {
        message: content,
        apiKey: apiKey === "env" ? "use_env" : apiKey, // Signal server to use env variable 
        model, // Now using OpenRouter model specified in Home.tsx
        sessionId: sessionId || undefined,
        conversationHistory: formattedHistory
      });

      const data: EnhancedChatResponse = await response.json();
      
      // Save the session ID if we got one back
      if (data.sessionId && (!sessionId || sessionId !== data.sessionId)) {
        setSessionId(data.sessionId);
        saveSessionId(data.sessionId);
      }
      
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
  }, [apiKey, model, onMessageSent, onMessageReceived, sessionId]);

  // Function to clear chat history
  const clearChatHistory = useCallback(async () => {
    if (!sessionId) {
      // If no sessionId, just clear local storage
      localStorage.removeItem('melodic_chat_messages');
      setState({
        messages: [],
        isTyping: false,
        error: null
      });
      return;
    }
    
    try {
      // Delete messages from the database
      await fetch(`/api/messages/${sessionId}`, {
        method: 'DELETE',
      });
      
      // Clear local storage and state
      localStorage.removeItem('melodic_chat_messages');
      setState({
        messages: [],
        isTyping: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to clear chat history from database:', error);
      // Still clear local even if DB fails
      localStorage.removeItem('melodic_chat_messages');
      setState({
        messages: [],
        isTyping: false,
        error: null
      });
    }
  }, [sessionId]);

  return {
    ...state,
    sendMessage,
    clearChatHistory
  };
}
