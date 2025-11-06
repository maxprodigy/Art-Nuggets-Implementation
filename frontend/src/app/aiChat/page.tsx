"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth";
import { ResponsiveChatSidebar } from "@/components/aiChat/ResponsiveChatSidebar";
import { ChatHeader } from "@/components/aiChat/ChatHeader";
import { AuthModal } from "@/components/aiChat/AuthModal";
import { ChatInterface } from "@/components/aiChat/ChatInterface";
import { ChatTabs } from "@/components/aiChat/ChatTabs";
import { Chat } from "@/lib/api/aiChat";

interface ChatTab {
  id: string;
  title: string;
  chatId: string | null;
}

export default function AIChatPage() {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [tabs, setTabs] = useState<ChatTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check authentication status after hydration
  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [_hasHydrated, isAuthenticated]);

  // Dummy function since modal cannot be closed
  const handleCloseAuthModal = () => {
    // This function does nothing - modal cannot be closed
  };

  const handleChatSelect = async (chatId: string | null) => {
    // Check if chat is already open in a tab
    const existingTab = tabs.find((tab) => tab.chatId === chatId);

    if (existingTab) {
      // Switch to existing tab
      setActiveTabId(existingTab.id);
    } else {
      // Create new tab for this chat
      let tabTitle = chatId ? "Chat" : "New Chat";

      // If it's a saved chat, try to get the actual title
      if (chatId) {
        try {
          const { aiChatApi } = await import("@/lib/api/aiChat");
          const chat = await aiChatApi.getChat(chatId);
          tabTitle = chat.title || "Chat";
        } catch (err) {
          console.error("Error loading chat title:", err);
          // Use default title if fetch fails
        }
      }

      const newTab: ChatTab = {
        id: `tab-${Date.now()}`,
        title: tabTitle,
        chatId: chatId,
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newTab.id);
    }
  };

  const handleNewChat = () => {
    // Create a new tab
    const newTab: ChatTab = {
      id: `tab-${Date.now()}`,
      title: "New Chat",
      chatId: null,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleTabSelect = (tabId: string) => {
    setActiveTabId(tabId);
  };

  const handleTabClose = (tabId: string) => {
    const tabIndex = tabs.findIndex((tab) => tab.id === tabId);
    const newTabs = tabs.filter((tab) => tab.id !== tabId);

    // If closing active tab, switch to another
    if (activeTabId === tabId) {
      if (newTabs.length > 0) {
        if (tabIndex > 0) {
          setActiveTabId(newTabs[tabIndex - 1].id);
        } else {
          setActiveTabId(newTabs[0].id);
        }
      } else {
        setActiveTabId(null);
      }
    }

    setTabs(newTabs);
  };

  const handleChatSaved = async (chatId: string) => {
    // Update the active tab with the chat ID and fetch the actual title
    let chatTitle = "Chat";
    try {
      const { aiChatApi } = await import("@/lib/api/aiChat");
      const chat = await aiChatApi.getChat(chatId);
      chatTitle = chat.title || "Chat";
    } catch (err) {
      console.error("Error loading chat title:", err);
    }

    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTabId
          ? { ...tab, chatId: chatId, title: chatTitle }
          : tab
      )
    );
    // Trigger sidebar refresh
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleNewTab = () => {
    handleNewChat();
  };

  const currentTab = tabs.find((tab) => tab.id === activeTabId);
  const currentChatId = currentTab?.chatId || null;

  return (
    <div className="min-h-screen flex">
      {/* Responsive Sidebar */}
      <ResponsiveChatSidebar
        activeChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        refreshTrigger={refreshTrigger}
      />

      {/* Main Content Area */}
      <div
        className="flex-1 flex flex-col p-4 md:p-6"
        style={{
          background:
            "linear-gradient(180deg, rgba(255, 240, 245, 1) 0%, rgba(255, 235, 220, 1) 100%)",
        }}
      >
        {/* Header */}
        <ChatHeader />

        {/* Chat Tabs */}
        {tabs.length > 0 && (
          <div className="max-w-4xl w-full mx-auto">
            <ChatTabs
              tabs={tabs}
              activeTabId={activeTabId!}
              onTabSelect={handleTabSelect}
              onTabClose={handleTabClose}
            />
          </div>
        )}

        {/* Chat Interface */}
        <div className="flex-1 max-w-4xl w-full mx-auto">
          <ChatInterface
            currentChatId={currentChatId}
            onChatSaved={handleChatSaved}
          />
        </div>
      </div>

      {/* Authentication Modal - Only shows for unauthenticated users and cannot be closed */}
      {!isAuthenticated && (
        <AuthModal isOpen={showAuthModal} onClose={handleCloseAuthModal} />
      )}
    </div>
  );
}
