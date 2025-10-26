"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth";
import { ResponsiveChatSidebar } from "@/components/aiChat/ResponsiveChatSidebar";
import { ChatHeader } from "@/components/aiChat/ChatHeader";
import { AuthModal } from "@/components/aiChat/AuthModal";

export default function AIChatPage() {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  return (
    <div className="min-h-screen flex">
      {/* Responsive Sidebar */}
      <ResponsiveChatSidebar />

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

        {/* Chat Content Area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Art Nugs Chat
              </h2>
              <p className="text-gray-600 max-w-md">
                Upload a document or start a conversation to get help with
                contract review and analysis.
              </p>
            </div>

            {/* Placeholder for future chat input */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg max-w-2xl mx-auto w-full">
              <div className="flex items-center space-x-2 md:space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Upload a document or ask about documents"
                    className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled
                  />
                </div>
                <button className="p-2 md:p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </button>
                <button className="p-2 md:p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Modal - Only shows for unauthenticated users and cannot be closed */}
      {!isAuthenticated && (
        <AuthModal isOpen={showAuthModal} onClose={handleCloseAuthModal} />
      )}
    </div>
  );
}
