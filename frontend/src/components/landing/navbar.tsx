"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import { Logo } from "@/components/landing/logo";
import { UserProfileMenu } from "@/components/user/UserProfileMenu";
import { UserAvatar } from "@/components/user/UserAvatar";
import { useNavbarAuth } from "@/hooks/useNavbarAuth";
import { useAuthStore } from "@/lib/stores/auth";
import Link from "next/link";
import {
  Menu,
  BookOpen,
  MessageSquare,
  LayoutDashboard,
  X,
  LogOut,
  Shield,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavbarProps {
  variant?: "default" | "courses";
  className?: string;
}

export function Navbar({ variant = "default", className = "" }: NavbarProps) {
  const authButton = useNavbarAuth();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const isAdmin = _hasHydrated && isAuthenticated && user?.role === "admin";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={cn("w-full fixed top-0 left-0 right-0 z-50", className)}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Enhanced glassy container with increased rounded corners */}
        <div className="relative rounded-3xl border border-white/20 dark:border-gray-700/30 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-lg px-4 sm:px-6 lg:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/">
                <Logo textColor="text-gray-900 dark:text-gray-100" />
              </Link>
            </div>

            {/* Desktop Navigation - aligned to the right */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link
                href="/courses"
                className={`font-medium transition-colors text-sm ${
                  variant === "courses"
                    ? "text-gray-900 dark:text-white font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Courses
              </Link>
              <Link
                href="/aiChat"
                className={`font-medium transition-colors text-sm ${
                  variant === "courses"
                    ? "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                AI Chat
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`font-medium transition-colors text-sm ${
                    variant === "courses"
                      ? "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Dashboard
                </Link>
              )}

              {/* User Profile Menu or Auth Button */}
              {isAuthenticated && _hasHydrated ? (
                <UserProfileMenu />
              ) : (
                <GradientButton
                  variant={
                    authButton.variant === "outline" ? "outline" : "default"
                  }
                  size="sm"
                  onClick={authButton.action}
                >
                  {authButton.text}
                </GradientButton>
              )}
            </nav>

            {/* Mobile Hamburger Menu */}
            <div className="lg:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[320px] sm:w-[360px] bg-white/50 dark:bg-gray-900/50 backdrop-blur-2xl border-l border-white/30 dark:border-gray-700/40 p-0 flex flex-col [&>button]:hidden"
                >
                  {/* Visually hidden title for accessibility */}
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                  {/* Header with Logo and Close Button */}
                  <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200/50 dark:border-gray-800/50">
                    <Link
                      href="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-shrink-0"
                    >
                      <Logo textColor="text-gray-900 dark:text-gray-100" />
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileMenuOpen(false)}
                      className="h-9 w-9 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </div>

                  {/* Navigation Links */}
                  <div className="flex-1 overflow-y-auto px-4 py-6">
                    <nav className="flex flex-col gap-2">
                      <Link
                        href="/courses"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all text-base ${
                          variant === "courses"
                            ? "text-gray-900 dark:text-white font-semibold bg-gray-100 dark:bg-gray-800"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <BookOpen className="h-5 w-5 flex-shrink-0" />
                        <span>Courses</span>
                      </Link>
                      <Link
                        href="/aiChat"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all text-base ${
                          variant === "courses"
                            ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <MessageSquare className="h-5 w-5 flex-shrink-0" />
                        <span>AI Chat</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                        >
                          <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
                          <span>Dashboard</span>
                        </Link>
                      )}
                    </nav>
                  </div>

                  {/* Footer with User Profile or Auth Button */}
                  <div className="px-4 pb-6 pt-4 border-t border-gray-200/50 dark:border-gray-800/50">
                    {isAuthenticated && _hasHydrated && user ? (
                      <>
                        <div className="relative px-4 py-4 mb-3 rounded-xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
                          <div
                            className="absolute top-0 left-0 right-0 h-1"
                            style={{
                              background:
                                "linear-gradient(90deg, rgba(255, 221, 0, 1) 0%, rgba(255, 145, 2, 1) 25%, rgba(255, 166, 237, 1) 50%, rgba(147, 51, 234, 1) 75%, rgba(78, 166, 255, 1) 100%)",
                            }}
                          />
                          <div className="flex items-center gap-3 pt-1">
                            <UserAvatar
                              name={
                                user.artist_name ||
                                `${user.first_name || ""} ${
                                  user.last_name || ""
                                }`.trim() ||
                                user.email
                              }
                              email={user.email}
                              isVerified={user.is_verified}
                              size="md"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {user.artist_name ||
                                  `${user.first_name || ""} ${
                                    user.last_name || ""
                                  }`.trim() ||
                                  user.email}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </div>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-base text-gray-700 dark:text-gray-300 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 mb-2"
                          >
                            <Shield className="h-5 w-5" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            authButton.action();
                          }}
                          className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50/50 dark:hover:bg-red-900/20"
                        >
                          <LogOut className="h-5 w-5 mr-3" />
                          <span>Sign Out</span>
                        </Button>
                      </>
                    ) : (
                      <GradientButton
                        variant={
                          authButton.variant === "outline"
                            ? "outline"
                            : "default"
                        }
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          authButton.action();
                        }}
                      >
                        {authButton.text}
                      </GradientButton>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
