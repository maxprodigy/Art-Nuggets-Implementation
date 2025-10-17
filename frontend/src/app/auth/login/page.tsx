import React from "react";
import { Logo } from "@/components/ui/logo";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
      {/* Logo Section */}
      <div className="mb-8">
        <Logo className="justify-center" />
      </div>

      {/* Login Form - To be implemented */}
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Login
        </h1>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Login form will be implemented here
          </p>

          <a
            href="/auth/signup"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Don't have an account? Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
