"use client";

import React from "react";
import Image from "next/image";

interface BenefitCardProps {
  image: string;
  title: string;
  description: string;
}

export function BenefitCard({ image, title, description }: BenefitCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex flex-row md:flex-row items-start">
        {/* Image */}
        <div className="w-1/3 md:w-1/4">
          <div className="relative w-full h-64 md:h-60">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="w-2/3 md:w-3/4 p-6 flex flex-col justify-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
          <p className="text-gray-900 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
