"use client";

import React from "react";

interface LearnCardProps {
  image: string;
  title: string;
  description: string;
}

export function LearnCard({ image, title, description }: LearnCardProps) {
  return (
    <div className="text-center">
      <div className="mb-6">
        <img
          src={image}
          alt={title}
          className="w-full object-cover rounded-lg shadow-lg"
        />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
