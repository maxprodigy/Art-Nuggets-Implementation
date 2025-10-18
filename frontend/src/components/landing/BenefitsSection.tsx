"use client";

import React from "react";
import { BenefitCard } from "./BenefitCard";

interface BenefitsSectionProps {
  variant?: "first" | "second";
}

export function BenefitsSection({ variant = "first" }: BenefitsSectionProps) {
  if (variant === "second") {
    return (
      <section className="py-16 bg-white">
        <div className="bg-gray-200/20 rounded-2xl max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Section Header */}
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-medium text-gray-900">
              Benefits
            </h2>
          </div>

          {/* Benefits Cards */}
          <div className="grid grid-cols-1 gap-8 mb-12">
            <BenefitCard
              image="/benefits-img-1.png"
              title="Contracts 101"
              description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s."
            />

            <BenefitCard
              image="/benefits-img-2.png"
              title="Contracts 101"
              description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s."
            />

            <BenefitCard
              image="/benefits-img-3.png"
              title="Contracts 101"
              description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s."
            />
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button className="bg-black text-white px-8 py-3 rounded-4xl font-medium hover:bg-gray-800 transition-colors">
              Sign Up
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="h-[950px] sm:h-[900px] md:h-[500px] lg:h-[500px] bg-white relative">
      {/* Blurred edge to soften section start */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-white blur-lg pointer-events-none"></div>
      {/* 2nd Layer - Content Container with absolute positioning */}
      <div className="absolute left-1/2 top-[-150px] transform -translate-x-1/2 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="backdrop-blur-sm bg-white/30 rounded-2xl p-8 ">
          {/* Section Header */}
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-medium text-gray-900">
              Benefits
            </h2>
            <p className="text-md text-gray-900">
              We've got you every step of the way
            </p>
          </div>

          {/* Benefits Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Contracts 101",
                description:
                  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
              },
              {
                title: "Contracts 101",
                description:
                  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
              },
              {
                title: "Contracts 101",
                description:
                  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
              },
            ].map((benefit, index) => (
              <div key={index} className="bg-white rounded-lg p-8 shadow-sm">
                <div className="w-12 h-12 bg-gray-200 rounded-full mb-2 flex items-center justify-center">
                  <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
