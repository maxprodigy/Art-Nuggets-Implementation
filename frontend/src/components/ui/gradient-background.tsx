"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GradientBackgroundProps {
  children: React.ReactNode;
  variant?: "hero" | "subtle" | "section" | "custom";
  opacity?: number;
  className?: string;
}

export function GradientBackground({
  children,
  variant = "hero",
  opacity = 1,
  className,
}: GradientBackgroundProps) {
  const gradientStyles = {
    hero: {
      background: `linear-gradient(135deg, 
        rgba(255, 221, 0, ${opacity}) 0%, 
        rgba(255, 145, 2, ${opacity}) 25%, 
        rgba(255, 166, 237, ${opacity}) 50%, 
        rgba(147, 51, 234, ${opacity}) 75%, 
        rgba(78, 166, 255, ${opacity}) 100%)`,
    },
    subtle: {
      background: `linear-gradient(135deg, 
        rgba(255, 221, 0, ${opacity * 0.3}) 0%, 
        rgba(255, 145, 2, ${opacity * 0.3}) 25%, 
        rgba(255, 166, 237, ${opacity * 0.3}) 50%, 
        rgba(147, 51, 234, ${opacity * 0.3}) 75%, 
        rgba(78, 166, 255, ${opacity * 0.3}) 100%)`,
    },
    section: {
      background: `linear-gradient(135deg, 
        rgba(255, 221, 0, ${opacity * 0.5}) 0%, 
        rgba(255, 145, 2, ${opacity * 0.5}) 30%, 
        rgba(255, 166, 237, ${opacity * 0.5}) 60%, 
        rgba(78, 166, 255, ${opacity * 0.5}) 100%)`,
    },
    custom: {},
  };

  return (
    <div
      className={cn("relative w-full", className)}
      style={gradientStyles[variant]}
    >
      {children}
    </div>
  );
}

