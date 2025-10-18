"use client";

import React from "react";

export function WhoIsThisForSection() {
  const userTypes = [
    { name: "Business Owners", color: "bg-blue-500" },
    { name: "Designers", color: "bg-yellow-500" },
    { name: "Students", color: "bg-purple-500" },
    { name: "Lawyers", color: "bg-pink-500" },
    { name: "Artists", color: "bg-green-500" },
    { name: "Freelancers", color: "bg-orange-500" },
    { name: "Entrepreneurs", color: "bg-indigo-500" },
    { name: "ArtNuggets", color: "bg-gray-500" },
    {
      name: "For Everyone",
      color:
        "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Who is this for?
          </h2>
        </div>

        {/* Centered Tags with Rotation */}
        <div className="relative px-16 h-96 flex items-center justify-center">
          {userTypes.map((userType, index) => {
            // Create more centered positioning with clear spacing
            const positions = [
              { top: "25%", left: "25%" },
              { top: "20%", left: "50%" },
              { top: "25%", left: "75%" },
              { top: "45%", left: "15%" },
              { top: "50%", left: "50%" },
              { top: "45%", left: "85%" },
              { top: "70%", left: "30%" },
              { top: "75%", left: "50%" },
              { top: "70%", left: "70%" },
            ];

            // Random rotation between -20° and +20°
            const rotations = [-15, 8, -12, 18, -5, 14, -18, 6, -10];

            const position = positions[index] || { top: "50%", left: "50%" };
            const rotation = rotations[index] || 0;

            return (
              <div
                key={userType.name}
                className={`absolute w-32 h-10 rounded-full text-white font-medium text-sm shadow-lg flex items-center justify-center hover:scale-105 transition-transform cursor-pointer ${userType.color}`}
                style={{
                  ...position,
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                }}
              >
                {userType.name}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
