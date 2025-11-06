"use client";

import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatTab {
  id: string;
  title: string;
  chatId: string | null; // null for new/unsaved chats
}

interface ChatTabsProps {
  tabs: ChatTab[];
  activeTabId: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

export function ChatTabs({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
}: ChatTabsProps) {
  return (
    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 border-b border-gray-200">
      {/* Existing Tabs */}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer transition-all min-w-[120px] max-w-[200px] group",
            activeTabId === tab.id
              ? "bg-white text-purple-600 border-t border-l border-r border-gray-200 shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
          onClick={() => onTabSelect(tab.id)}
        >
          <span className="text-sm font-medium truncate flex-1">
            {tab.title}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
            className={cn(
              "opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-gray-300",
              activeTabId === tab.id && "opacity-100"
            )}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
