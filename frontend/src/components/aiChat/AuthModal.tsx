"use client";

import React from "react";
import { GradientButton } from "@/components/ui/gradient-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/auth/login");
  };

  const handleSignup = () => {
    router.push("/auth/signup");
  };

  // Prevent closing the modal - users must authenticate
  const handleOpenChange = (open: boolean) => {
    // Do nothing - modal cannot be closed
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Authentication Required
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            You need to be logged in to review contracts and use AI chat
            features.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-3 mt-6">
          <GradientButton
            onClick={handleLogin}
            className="w-full py-3 text-sm font-medium"
          >
            Login to Continue
          </GradientButton>

          <Button
            onClick={handleSignup}
            variant="outline"
            className="w-full py-3 text-sm font-medium"
          >
            Create Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
