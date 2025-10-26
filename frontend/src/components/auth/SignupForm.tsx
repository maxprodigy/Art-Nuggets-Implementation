"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import { GradientButton } from "@/components/ui/gradient-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SignupForm() {
  const { register: registerUser, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    registerUser(registerData);
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-none border-none">
      <CardHeader className="space-y-2 pb-4">
        <CardTitle className="text-7xl font-light text-center text-gray-900">
          Sign Up
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Fields Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="first_name"
                className="text-sm font-medium text-gray-700"
              >
                First name
              </Label>
              <Input
                id="first_name"
                type="text"
                placeholder="John"
                className="h-12 rounded-4xl border-gray-200 bg-gray-50 focus:border-orange-500 focus:ring-orange-500 focus:bg-white"
                {...register("first_name", {
                  required: "First name is required",
                })}
              />
              {errors.first_name && (
                <p className="text-sm text-red-600">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="last_name"
                className="text-sm font-medium text-gray-700"
              >
                Last name
              </Label>
              <Input
                id="last_name"
                type="text"
                placeholder="Doe"
                className="h-12 rounded-4xl border-gray-200 bg-gray-50 focus:border-orange-500 focus:ring-orange-500 focus:bg-white"
                {...register("last_name", {
                  required: "Last name is required",
                })}
              />
              {errors.last_name && (
                <p className="text-sm text-red-600">
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Stage Name and Email Fields Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="artist_name"
                className="text-sm font-medium text-gray-700"
              >
                Stage Name
              </Label>
              <Input
                id="artist_name"
                type="text"
                placeholder="Your stage name"
                className="h-12 rounded-4xl border-gray-200 bg-gray-50 focus:border-orange-500 focus:ring-orange-500 focus:bg-white"
                {...register("artist_name", {
                  required: "Stage name is required",
                })}
              />
              {errors.artist_name && (
                <p className="text-sm text-red-600">
                  {errors.artist_name.message}
                </p>
              )}
            </div>

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
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="h-12 rounded-4xl border-gray-200 bg-gray-50 focus:border-orange-500 focus:ring-orange-500 focus:bg-white"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700"
            >
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className="h-12 rounded-4xl border-gray-200 bg-gray-50 focus:border-orange-500 focus:ring-orange-500 focus:bg-white"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords don't match",
              })}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <GradientButton
            type="submit"
            className="w-1/3 flex justify-center mx-auto"
            size="default"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
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
