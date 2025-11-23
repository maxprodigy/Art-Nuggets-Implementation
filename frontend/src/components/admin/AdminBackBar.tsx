"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Logo } from "@/components/landing/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminBackBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Minimal glassy container */}
        <div className="relative rounded-xl border border-white/20 dark:border-gray-700/30 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-sm px-4 sm:px-6">
          <div className="flex items-center justify-between h-12">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Logo textColor="text-gray-900 dark:text-gray-100" />
            </Link>

            {/* Back to App Button */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Back to App
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
