"use client";

import React from "react";
import Image from "next/image";

interface FeatureCardProps {
  image: string;
  title: string;
  description: string;
  imagePosition: "left" | "right";
}

export function FeatureCard({
  image,
  title,
  description,
  imagePosition,
}: FeatureCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      {/* Image */}
      <div
        className={`${imagePosition === "right" ? "lg:order-2" : "lg:order-1"}`}
      >
        <div className="relative w-full max-w-md mx-auto lg:max-w-none lg:mx-0 h-96 rounded-2xl overflow-hidden">
          <Image src={image} alt={title} fill className="object-cover" />
        </div>
      </div>

      {/* Content */}
      <div
        className={`${imagePosition === "right" ? "lg:order-1" : "lg:order-2"}`}
      >
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
