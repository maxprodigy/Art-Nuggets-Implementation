"use client";

import React from "react";
import { GradientBackground } from "@/components/ui/gradient-background";
import { Button } from "../ui/button";
import { Navbar } from "@/components/landing/navbar";
import { useAuthButton } from "@/hooks/useAuthButton";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const router = useRouter();
  const authButton = useAuthButton({
    authenticatedText: "Go to Courses",
    authenticatedAction: () => router.push("/courses"),
  });

  return (
    <GradientBackground variant="hero" className="h-[120vh] flex flex-col">
      {/* Header/Navigation */}
      <Navbar />

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
            Learn the rules. Spot the risks. Own your creative future.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              className="px-6 py-4 text-lg rounded-4xl"
              onClick={authButton.action}
            >
              {authButton.text}
            </Button>
          </div>
        </div>
      </div>
    </GradientBackground>
  );
}
