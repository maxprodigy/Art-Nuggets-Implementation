"use client";

import React from "react";
import { GradientBackground } from "@/components/ui/gradient-background";
import { GradientButton } from "@/components/ui/gradient-button";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side - Logo and Links */}
          <div>
            <div className="mb-8">
              <Logo className="" textColor="text-white" />
            </div>

            {/* Navigation Links */}
            <div className="mb-6">
              <nav className="flex flex-wrap gap-6 mb-4">
                <a
                  href="#learn"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Learn
                </a>
                <a
                  href="#about"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  About
                </a>
                <a
                  href="#blog"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Blog
                </a>
              </nav>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap gap-6 text-sm text-gray-400">
              <a href="#legal" className="hover:text-white transition-colors">
                Legal
              </a>
              <a href="#privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="hover:text-white transition-colors">
                Terms and Conditions
              </a>
            </div>
          </div>

          {/* Right Side - CTA Card */}
          <div className="flex justify-center lg:justify-end">
            <GradientBackground
              variant="section"
              className="w-full max-w-md rounded-2xl p-8 text-center"
            >
              <div className="text-white">
                {/* Signature Element */}
                <div className="mb-4">
                  <img
                    src="/signature.png"
                    alt="Signature"
                    className="h-12 w-auto mx-auto"
                  />
                </div>

                {/* CTA Text */}
                <h3 className="text-2xl font-bold mb-6">
                  Sign Better Contracts
                </h3>

                {/* CTA Button */}
                <GradientButton
                  size="lg"
                  className="bg-black text-white hover:bg-gray-800 px-8 py-3"
                >
                  Sign Up
                </GradientButton>
              </div>
            </GradientBackground>
          </div>
        </div>
      </div>
    </footer>
  );
}
