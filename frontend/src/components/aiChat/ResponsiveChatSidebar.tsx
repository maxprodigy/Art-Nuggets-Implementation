"use client";

import React, { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChatSidebarContent } from "./ChatSidebarContent";

interface ResponsiveChatSidebarProps {
  className?: string;
  activeChatId?: string | null;
  onChatSelect?: (chatId: string | null) => void;
  onNewChat?: () => void;
  refreshTrigger?: number;
}

export function ResponsiveChatSidebar({
  className,
  activeChatId,
  onChatSelect,
  onNewChat,
  refreshTrigger,
}: ResponsiveChatSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile: Sheet/Drawer */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50 bg-white shadow-lg"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <ChatSidebarContent
              onClose={() => setOpen(false)}
              activeChatId={activeChatId}
              onChatSelect={onChatSelect}
              onNewChat={onNewChat}
              refreshTrigger={refreshTrigger}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: Fixed Sidebar */}
      <div className="hidden md:block">
        <div className="w-80 h-full">
          <ChatSidebarContent
            activeChatId={activeChatId}
            onChatSelect={onChatSelect}
            onNewChat={onNewChat}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>
    </>
  );
}
