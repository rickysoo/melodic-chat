export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  error: string | null;
}

export interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string, model: string) => void;
}

export interface HeaderProps {
  onToggleMusic: () => void;
  isMusicEnabled: boolean;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
}

export interface MessageThreadProps {
  messages: Message[];
  isTyping: boolean;
}

export interface MessageProps {
  message: Message;
}

export interface MusicVisualizerProps {
  isEnabled: boolean;
  isActive: boolean;
}

export interface ChatResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    }
  }[];
}
