"use client";

import React from "react";
import { LearnCard } from "./LearnCard";

export function LearnSection() {
  const learnItems = [
    {
      image: "/Learn-img-1.png",
      title: "Contracts 101",
      description:
        "Master the fundamentals of contract law and negotiation strategies designed specifically for creative professionals and entrepreneurs.",
    },
    {
      image: "/Learn-img-2.png",
      title: "Music Deals",
      description:
        "Navigate the complex world of music industry contracts, from recording agreements to publishing deals and performance rights.",
    },
    {
      image: "/Learn-img-3.png",
      title: "Art Contracts For Beginners",
      description:
        "Learn essential contract principles for visual artists, including commission agreements, licensing deals, and gallery contracts.",
    },
  ];

  return (
    <section className="py-16 bg-gray-200/20 rounded-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Learn
          </h2>
          <p className="text-lg text-gray-600">
            We've got you every step of the way
          </p>
        </div>

        {/* Learn Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {learnItems.map((item, index) => (
            <LearnCard
              key={index}
              image={item.image}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
