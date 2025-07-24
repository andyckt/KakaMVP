import axios from 'axios';

// Types
export interface V0Chat {
  id: string;
  demo: string;
  files?: any[];
  messages?: any[];
}

export interface V0Response {
  success: boolean;
  chatId: string;
  demoUrl: string;
  files?: any[];
  messages?: any[];
  assistantResponses?: string[];
  latestResponse?: string | null;
}

/**
 * Service for interacting with the v0 API
 */
export class V0ApiService {
  private client;

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: 'https://api.v0.dev/v1',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Create a new chat with a prompt
   * @param prompt - The natural language prompt describing the web app to build
   * @returns The chat response with generated files and demo URL
   */
  async createChat(prompt: string): Promise<V0Chat> {
    try {
      const response = await this.client.post('/chats', {
        message: prompt,
        modelConfiguration: {
          modelId: 'v0-1.5-md'
        }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error creating chat:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get details of a specific chat
   * @param chatId - The ID of the chat to retrieve
   * @returns The chat details including files and messages
   */
  async getChat(chatId: string): Promise<V0Chat> {
    try {
      const response = await this.client.get(`/chats/${chatId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting chat:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Add a follow-up message to an existing chat
   * @param chatId - The ID of the chat
   * @param message - The follow-up message/instruction
   * @returns The updated chat response
   */
  async addMessage(chatId: string, message: string): Promise<V0Chat> {
    try {
      const response = await this.client.post(`/chats/${chatId}/messages`, {
        message
      });
      return response.data;
    } catch (error: any) {
      console.error('Error adding message:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Extract assistant messages from the chat response
   * @param chat - The chat response from v0 API
   * @returns Array of assistant message contents
   */
  extractAssistantMessages(chat: V0Chat): string[] {
    if (!chat.messages || !Array.isArray(chat.messages)) {
      return [];
    }
    
    return chat.messages
      .filter(msg => msg.role === 'assistant')
      .map(msg => msg.content);
  }

  /**
   * Format the v0 response to match our application's expected format
   * @param chat - The chat response from v0 API
   * @returns Formatted response with assistantResponses and latestResponse
   */
  formatResponse(chat: V0Chat): V0Response {
    const assistantMessages = this.extractAssistantMessages(chat);
    
    return {
      success: true,
      chatId: chat.id,
      demoUrl: chat.demo,
      files: chat.files || [],
      messages: chat.messages || [],
      assistantResponses: assistantMessages,
      latestResponse: assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1] : null
    };
  }
}

// Create and export a singleton instance
export const v0Api = (apiKey: string) => new V0ApiService(apiKey); 