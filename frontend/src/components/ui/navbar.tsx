"use client";

import React from "react";
import { GradientButton } from "@/components/ui/gradient-button";
import { Logo } from "@/components/ui/logo";
import { useNavbarAuth } from "@/hooks/useNavbarAuth";
import { useAuthStore } from "@/lib/stores/auth";
import Link from "next/link";

interface NavbarProps {
  variant?: "default" | "courses";
  className?: string;
}

export function Navbar({ variant = "default", className = "" }: NavbarProps) {
  const authButton = useNavbarAuth();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const isAdmin = _hasHydrated && isAuthenticated && user?.role === "admin";

  return (
    <header className={`w-full ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              {" "}
              <Logo />{" "}
            </Link>
          </div>

          {/* Navigation and CTA Button */}
          <div className="flex items-center space-x-8">
            <nav className="hidden md:flex items-center space-x-8">
              {/* <Link
                href="/"
                className={`font-medium transition-colors ${
                  variant === "courses"
                    ? "text-gray-700 hover:text-gray-900"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                Home
              </Link> */}
              <Link
                href="/courses"
                className={`font-medium transition-colors ${
                  variant === "courses"
                    ? "text-gray-900 font-semibold"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                Courses
              </Link>
              <Link
                href="/aiChat"
                className={`font-medium transition-colors ${
                  variant === "courses"
                    ? "text-gray-700 hover:text-gray-900"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                AI Chat
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`font-medium transition-colors ${
                    variant === "courses"
                      ? "text-gray-700 hover:text-gray-900"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </nav>

            {/* Dynamic Auth Button */}
            <GradientButton
              size="sm"
              className="px-6 py-2"
              onClick={authButton.action}
            >
              {authButton.text}
            </GradientButton>
          </div>
        </div>
      </div>
    </header>
  );
}
