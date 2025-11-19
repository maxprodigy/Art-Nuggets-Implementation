"use client";

import React from "react";
import { BenefitCard } from "./BenefitCard";
import { useAuthButton } from "@/hooks/useAuthButton";
import { useRouter } from "next/navigation";

interface BenefitsSectionProps {
  variant?: "first" | "second";
}

export function BenefitsSection({ variant = "first" }: BenefitsSectionProps) {
  const router = useRouter();
  const authButton = useAuthButton({
    authenticatedText: "Go to Courses",
    authenticatedAction: () => router.push("/courses"),
  });

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
              title="Instant Contract Clarity"
              description="Art Nuggets breaks down complex legal language into the simplest form so you can finally understand what you're signing. No more hidden risks or confusing clauses."
            />

            <BenefitCard
              image="/benefits-img-2.png"
              title="Personalized Learning for Creatives"
              description="We offer resources and courses tailored  to your creative goals and experience level. You'll only see contract that matters to you to help you grow faster and make smarter career moves."
            />

            <BenefitCard
              image="/benefits-img-3.png"
              title="Built for the Real World"
              description="We serve African creatives. Whether you're just starting out or closing big deals, you get reliable support wherever your journey takes you."
            />
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              className="bg-black text-white px-8 py-3 rounded-4xl font-medium hover:bg-gray-800 transition-colors"
              onClick={authButton.action}
            >
              {authButton.text}
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
                title:"Instant Contract Clarity",
                description: "Art Nuggets breaks down complex legal language into the simplest form so you can finally understand what you're signing. No more hidden risks or confusing clauses."
              },
              {
                title: "Personalized Learning for Creatives",
                description:
                  "We offer resources and courses tailored  to your creative goals and experience level. You'll only see contract that matters to you to help you grow faster and make smarter career moves."
              },
              {
                title: "Built for the Real World",
                description:
                  "We serve African creatives. Whether you're just starting out or closing big deals, you get reliable support wherever your journey takes you."
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
