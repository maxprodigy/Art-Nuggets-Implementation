"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ChatItemProps {
  title: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

export function ChatItem({
  title,
  isActive,
  onClick,
  className,
}: ChatItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer",
        "hover:shadow-sm",
        isActive
          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200",
        className
      )}
    >
      <span className="text-sm font-medium truncate block">{title}</span>
    </button>
  );
}
