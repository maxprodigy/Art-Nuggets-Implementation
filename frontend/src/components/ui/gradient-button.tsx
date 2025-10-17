"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  (
    { children, className, variant = "default", size = "default", ...props },
    ref
  ) => {
    const baseClasses =
      "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const sizeClasses = {
      default: "h-12 px-6 py-3 rounded-4xl",
      sm: "h-9 rounded-md px-3",
      lg: "h-14 rounded-xl px-8",
      icon: "h-12 w-12",
    };

    const variantClasses = {
      default:
        "bg-gradient-to-r from-black from-10% via-yellow-500  via-orange-500 via-pink-500 via-purple-500 to-blue-400 text-white font-semibold hover:shadow-lg hover:scale-105 transform",
      outline:
        "border-2 border-transparent bg-gradient-to-r from-yellow-600 via-orange-500 via-pink-500 via-purple-500 to-blue-400 bg-clip-border text-white font-semibold hover:shadow-lg hover:scale-105 transform",
      ghost: "text-gray-700 hover:bg-gray-100",
    };

    return (
      <button
        className={cn(
          baseClasses,
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GradientButton.displayName = "GradientButton";

export { GradientButton, type GradientButtonProps };
