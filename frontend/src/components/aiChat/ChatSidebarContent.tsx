"use client";

import React, { useState, useEffect } from "react";
import { Logo } from "@/components/ui/logo";
import { GradientButton } from "@/components/ui/gradient-button";
import { ChatItem } from "./ChatItem";
import { aiChatApi, Chat } from "@/lib/api/aiChat";
import { Loader2, Trash2, Check } from "lucide-react";

interface ChatSidebarContentProps {
  onClose?: () => void;
  className?: string;
  activeChatId?: string | null;
  onChatSelect?: (chatId: string | null) => void;
  onNewChat?: () => void;
  refreshTrigger?: number;
}

export function ChatSidebarContent({
  onClose,
  className,
  activeChatId,
  onChatSelect,
  onNewChat,
  refreshTrigger,
}: ChatSidebarContentProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const [isStartingNewChat, setIsStartingNewChat] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const loadChats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await aiChatApi.getChats();
      setChats(response.chats);
    } catch (err: any) {
      console.error("Error loading chats:", err);
      // Show more detailed error message
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Failed to load chats";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, [refreshTrigger]);

  const handleChatSelect = (chatId: string) => {
    if (onChatSelect) {
      onChatSelect(chatId);
    }
    // Close mobile sidebar when chat is selected
    if (onClose) {
      onClose();
    }
  };

  const handleStartNewChat = async () => {
    // Show loading state
    setIsStartingNewChat(true);
    setError(null);

    try {
      // Create an empty chat in the database
      const newChat = await aiChatApi.createChat({
        title: "New Chat",
        messages: [], // Empty messages array
      });

      // Refresh the chat list to show the new chat
      await loadChats();

      // Automatically select the new chat (this will show it in the UI)
      if (onChatSelect) {
        onChatSelect(newChat.id);
      }

      // Close mobile sidebar when starting new chat
      if (onClose) {
        onClose();
      }

      // Show success feedback
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 2000);
    } catch (err: any) {
      console.error("Error creating new chat:", err);
      setError("Failed to create new chat");
      // Still allow starting a new chat locally even if creation failed
      if (onChatSelect) {
        onChatSelect(null);
      }
      if (onNewChat) {
        onNewChat();
      }
    } finally {
      setIsStartingNewChat(false);
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation(); // Prevent chat selection
    if (!confirm("Are you sure you want to delete this chat?")) {
      return;
    }

    setDeletingChatId(chatId);
    try {
      await aiChatApi.deleteChat(chatId);
      // Remove from local state
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      // If deleted chat was active, clear selection
      if (activeChatId === chatId && onChatSelect) {
        onChatSelect(null);
      }
    } catch (err: any) {
      console.error("Error deleting chat:", err);
      alert("Failed to delete chat");
    } finally {
      setDeletingChatId(null);
    }
  };

  return (
    <div
      className={`bg-white rounded-r-2xl p-6 flex flex-col h-full ${className}`}
    >
      {/* Logo */}
      <div className="mb-8">
        <Logo />
      </div>

      {/* Start New Chat Button */}
      <div className="mb-8 relative">
        <GradientButton
          onClick={handleStartNewChat}
          disabled={isStartingNewChat}
          className={`w-full py-3 text-sm font-medium transition-all duration-200 ${
            isStartingNewChat ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          {isStartingNewChat ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Starting...
            </span>
          ) : (
            "Start New Chat"
          )}
        </GradientButton>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-green-50 border border-green-200 rounded-lg p-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 text-green-700">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">New chat started!</span>
            </div>
          </div>
        )}
      </div>

      {/* Chat List */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Recent Chats
        </h3>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
          </div>
        ) : error ? (
          <div className="text-sm text-red-600 py-4">{error}</div>
        ) : chats.length === 0 ? (
          <div className="text-sm text-gray-500 py-4 text-center">
            No chats yet. Start a new conversation!
          </div>
        ) : (
          chats.map((chat) => (
            <div key={chat.id} className="relative group">
              <ChatItem
                title={chat.title || "Untitled Chat"}
                isActive={activeChatId === chat.id}
                onClick={() => handleChatSelect(chat.id)}
              />
              <button
                onClick={(e) => handleDeleteChat(e, chat.id)}
                disabled={deletingChatId === chat.id}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded-lg"
                title="Delete chat"
              >
                {deletingChatId === chat.id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                ) : (
                  <Trash2 className="w-4 h-4 text-red-500" />
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
