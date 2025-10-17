import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Art Nuggets Logo */}
      <Image
        src="/art-nuggets-logo.svg"
        alt="Art Nuggets Logo"
        width={40}
        height={40}
        className="w-10 h-10"
      />

      {/* Brand Name */}
      <span className="text-xl font-medium text-gray-900">art nuggets</span>
    </div>
  );
}
