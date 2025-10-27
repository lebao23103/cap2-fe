import apiClient from './config';
import type { Book } from './books';

export type ChatRole = 'book advisor' | 'literary expert' | 'book enthusiast';

export interface RecommendBooksRequest {
  query: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  bookRecommendations?: Book[];
}

export interface ChatbotRequest {
  message: string;
  role: ChatRole;
}

export interface ChatbotConversationRequest {
  message: string;
  role: ChatRole;
  context: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface MultiTurnChatRequest {
  message: string;
  conversation_id: string;
  role: ChatRole;
  history: Array<{
    user: string;
    ai: string;
  }>;
}

export interface ChatbotResponse {
  response: string;
  recommendations?: Book[];
  conversation_id?: string;
}

class AIService {
  // Get book recommendations based on query
  async getRecommendations(query: string): Promise<Book[]> {
    const response = await apiClient.post('/api/recommend_books/', {
      query
    });
    return response.data.recommendations || response.data;
  }

  // Simple chatbot interaction
  async sendChatMessage(message: string, role: ChatRole = 'book advisor'): Promise<ChatbotResponse> {
    const response = await apiClient.post('/api/chatbot/', {
      message,
      role
    });
    return response.data;
  }

  // Chatbot with conversation context
  async sendChatWithContext(
    message: string,
    role: ChatRole,
    context: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<ChatbotResponse> {
    const response = await apiClient.post('/api/chatbot/conversation/', {
      message,
      role,
      context
    });
    return response.data;
  }

  // Multi-turn chat conversation
  async sendMultiTurnChat(
    message: string,
    conversationId: string,
    role: ChatRole,
    history: Array<{ user: string; ai: string }>
  ): Promise<ChatbotResponse> {
    const response = await apiClient.post('/api/chatbot/multi-turn/', {
      message,
      conversation_id: conversationId,
      role,
      history
    });
    return response.data;
  }

  // Helper to format chat history for display
  formatChatHistory(history: ChatMessage[]): Array<{ user: string; ai: string }> {
    const formatted: Array<{ user: string; ai: string }> = [];
    
    for (let i = 0; i < history.length; i += 2) {
      if (history[i]?.role === 'user' && history[i + 1]?.role === 'assistant') {
        formatted.push({
          user: history[i].content,
          ai: history[i + 1].content
        });
      }
    }
    
    return formatted;
  }

  // Generate conversation ID
  generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new AIService();