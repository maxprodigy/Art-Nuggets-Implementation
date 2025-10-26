"use client";

import React, { useState } from "react";
import { Logo } from "@/components/ui/logo";
import { GradientButton } from "@/components/ui/gradient-button";
import { ChatItem } from "./ChatItem";

interface ChatSidebarContentProps {
  onClose?: () => void;
  className?: string;
}

// Static chat data for now
const staticChats = [
  "Contract.doc",
  "Mavins X Mamudu.pdf",
  "Google X Mamudu.pdf",
];

export function ChatSidebarContent({
  onClose,
  className,
}: ChatSidebarContentProps) {
  const [activeChat, setActiveChat] = useState<string | null>(null);

  const handleChatSelect = (chatTitle: string) => {
    setActiveChat(chatTitle);
    // Close mobile sidebar when chat is selected
    if (onClose) {
      onClose();
    }
  };

  const handleStartNewChat = () => {
    setActiveChat(null);
    // Close mobile sidebar when starting new chat
    if (onClose) {
      onClose();
    }
    // TODO: Implement new chat functionality
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
      <div className="mb-8">
        <GradientButton
          onClick={handleStartNewChat}
          className="w-full py-3 text-sm font-medium"
        >
          Start New Chat
        </GradientButton>
      </div>

      {/* Chat List */}
      <div className="flex-1 space-y-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Recent Chats
        </h3>
        {staticChats.map((chatTitle) => (
          <ChatItem
            key={chatTitle}
            title={chatTitle}
            isActive={activeChat === chatTitle}
            onClick={() => handleChatSelect(chatTitle)}
          />
        ))}
      </div>
    </div>
  );
}
