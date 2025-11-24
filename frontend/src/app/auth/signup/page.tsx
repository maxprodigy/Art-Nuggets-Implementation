import React from "react";
import { Logo } from "@/components/landing/logo";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8">
      {/* Logo Section */}
      <div className="">
        <Logo className="justify-center" />
      </div>

      {/* Signup Form */}
      <SignupForm />
    </div>
  );
}
