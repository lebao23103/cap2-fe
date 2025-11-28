import apiClient from './config';

export type ChatRole = 'book advisor' | 'literary expert' | 'book enthusiast';

export interface RecommendBooksRequest {
  query: string;
}

export interface ChatMessage {
  id: number;
  conversation: string;
  content: string;
  is_user: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ChatSendRequest {
  message: string;
  conversation_id?: string;
  role?: string;
}

export interface ChatSendResponse {
  reply: string;
  conversation_id: string;
  message_id: number;
}

class AIService {
  // Send a chat message (creates new conversation or continues existing one)
  async sendMessage(message: string, conversationId?: string, role?: string): Promise<ChatSendResponse> {
    console.log('Sending chat request:', { message, conversation_id: conversationId, role });
    try {
      const response = await apiClient.post('/chat/send', {
        message,
        conversation_id: conversationId,
        role
      });
      console.log('Chat response:', response.data);

      // Transform backend response to match frontend interface
      return {
        reply: response.data.message.ai,
        conversation_id: response.data.conversation_id,
        message_id: Date.now()
      };
    } catch (error) {
      console.error('Chat API Error:', error);
      throw error;
    }
  }

  // Get all user's conversations
  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get('/chat/conversations');
    return response.data;
  }

  // Get messages for a specific conversation
  async getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    const response = await apiClient.get(`/chat/conversations/${conversationId}/messages`);
    return response.data;
  }

  // End/archive a conversation
  async endConversation(conversationId: string): Promise<void> {
    await apiClient.post(`/chat/conversations/${conversationId}/end`);
  }
}

export default new AIService();