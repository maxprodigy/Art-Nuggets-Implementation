"use client";

import React from "react";
import { GradientBackground } from "@/components/ui/gradient-background";
import { GradientButton } from "@/components/ui/gradient-button";
import { Logo } from "@/components/ui/logo";
import { Button } from "../ui/button";

export function HeroSection() {
  return (
    <GradientBackground variant="hero" className="h-[120vh] flex flex-col">
      {/* Header/Navigation */}
      <header className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Logo />
            </div>

            {/* Navigation and CTA Button */}
            <div className="flex items-center space-x-8">
              <nav className="hidden md:flex items-center space-x-8">
                <a
                  href="#home"
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Home
                </a>
                <a
                  href="#about"
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  About
                </a>
                <a
                  href="#blog"
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Blog
                </a>
              </nav>
              <GradientButton size="sm" className="px-6 py-2">
                Sign Up
              </GradientButton>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium text-gray-900 mb-6 leading-tight">
            Broker The Best Deals
            <br />
            Sign Better Contracts
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Lorem ipsum is simply dummy text of the printing and typesetting
            industry. Lorem ipsum has been the industry's standard dummy text
            ever since the 1500s.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center">
            {/* <GradientButton size="lg" className="px-8 py-4 text-lg rounded-4xl">
              Sign Up
            </GradientButton> */}
            <Button size="lg" className="px-6 py-4 text-lg rounded-4xl">
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </GradientBackground>
  );
}
