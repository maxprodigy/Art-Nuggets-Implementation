"use client";

import React from "react";
import { GradientButton } from "@/components/ui/gradient-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SignupForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic will be added later
    console.log("Form submitted");
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-none border-none">
      <CardHeader className="space-y-2 pb-4">
        <CardTitle className="text-7xl font-light text-center text-gray-900">
          Sign Up
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="text-sm font-medium text-gray-700"
              >
                First name
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="E.g John"
                className="h-12 rounded-4xl border-gray-200 bg-gray-50 focus:border-orange-500 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="text-sm font-medium text-gray-700"
              >
                Last name
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="E.g John"
                className="h-12 rounded-4xl border-gray-200 bg-gray-50 focus:border-orange-500 focus:ring-orange-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="h-12 rounded-4xl border-gray-200 bg-gray-50 focus:border-orange-500 focus:ring-orange-500 focus:bg-white"
            />
          </div>

          {/* Phone Number Field */}
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-gray-700"
            >
              Phone number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              className="h-12 rounded-4xl border-gray-200 bg-gray-50 focus:border-orange-500 focus:ring-orange-500 focus:bg-white"
            />
          </div>

          {/* Submit Button */}
          <GradientButton
            type="submit"
            className="w-1/3 flex justify-center mx-auto"
            size="default"
          >
            Sign Up
          </GradientButton>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Login
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
