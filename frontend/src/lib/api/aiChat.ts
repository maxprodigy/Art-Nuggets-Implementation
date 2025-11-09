import { backendClient } from "./client";
import axios from "axios";

export interface ContractAnalysisRequest {
  file?: File;
  user_text?: string;
  chat_id?: string;
  save_to_chat?: boolean;
}

export interface ContractAnalysisResponse {
  analysis: string;
  extracted_text?: string;
  timestamp: string;
  chat_id?: string | null;
}

export interface ErrorResponse {
  error: string;
  detail?: string;
}

// Create a special axios instance for file uploads
const createFileUploadClient = () => {
  const baseURL =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

  const client = axios.create({
    baseURL,
    timeout: 60000, // 60 seconds timeout for file uploads
    headers: {
      //   "Content-Type": "multipart/form-data",
    },
  });

  // Add Authorization header
  client.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      try {
        const { useAuthStore } = require("@/lib/stores/auth");
        const { accessToken } = useAuthStore.getState();
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } catch (error) {
        console.error("Error getting token from auth store:", error);
      }
    }
    return config;
  });

  return client;
};

const fileUploadClient = createFileUploadClient();

// Chat types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoning?: string | null;
  created_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  title: string | null;
  contract_text?: string | null;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

export interface ChatListResponse {
  chats: Chat[];
  total: number;
}

export interface ChatCreate {
  title?: string | null;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    reasoning?: string | null;
  }>;
}

export interface ChatMessageCreate {
  role: "user" | "assistant";
  content: string;
  reasoning?: string | null;
}

export const aiChatApi = {
  /**
   * Analyze a contract
   * @param data - Contract analysis request with optional PDF file and user text
   * @returns Contract analysis response
   */
  analyzeContract: async (
    data: ContractAnalysisRequest
  ): Promise<ContractAnalysisResponse> => {
    const formData = new FormData();

    if (data.file) {
      formData.append("file", data.file);
    }

    if (data.user_text) {
      formData.append("user_text", data.user_text);
    }

    if (data.chat_id) {
      formData.append("chat_id", data.chat_id);
    }

    if (data.save_to_chat !== undefined) {
      formData.append("save_to_chat", data.save_to_chat.toString());
    }

    const response = await fileUploadClient.post<ContractAnalysisResponse>(
      "/ai-chat/analyze-contract",
      formData
    );

    return response.data;
  },

  /**
   * Get all chats for the current user
   */
  getChats: async (skip = 0, limit = 50): Promise<ChatListResponse> => {
    const response = await backendClient.get<ChatListResponse>(
      "/ai-chat/chats",
      {
        params: { skip, limit },
      }
    );
    return response.data;
  },

  /**
   * Get a specific chat by ID
   */
  getChat: async (chatId: string): Promise<Chat> => {
    const response = await backendClient.get<Chat>(`/ai-chat/chats/${chatId}`);
    return response.data;
  },

  /**
   * Create a new chat
   */
  createChat: async (data: ChatCreate): Promise<Chat> => {
    const response = await backendClient.post<Chat>("/ai-chat/chats", data);
    return response.data;
  },

  /**
   * Add a message to an existing chat
   */
  addMessage: async (
    chatId: string,
    message: ChatMessageCreate
  ): Promise<ChatMessage> => {
    const response = await backendClient.post<ChatMessage>(
      `/ai-chat/chats/${chatId}/messages`,
      message
    );
    return response.data;
  },

  /**
   * Delete a chat
   */
  deleteChat: async (chatId: string): Promise<void> => {
    await backendClient.delete(`/ai-chat/chats/${chatId}`);
  },
};
