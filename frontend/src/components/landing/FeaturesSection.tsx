"use client";

import React from "react";
import { FeatureCard } from "./FeatureCard";

export function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-6xl sm:text-9xl tracking-wider font-medium text-gray-900">
            Features
          </h2>
        </div>

        {/* Features */}
        <div className="space-y-24">
          <FeatureCard
            image="/features-img-1.png"
            title="Chat Interface"
            description="Streamlined contract management with intuitive mobile interface for seamless collaboration and signing."
            imagePosition="left"
          />

          <FeatureCard
            image="/features-img-2.png"
            title="Document Upload"
            description="Easy document upload and management with support for multiple file formats and automated processing."
            imagePosition="right"
          />

          <FeatureCard
            image="/features-img-3.png"
            title="Document Clause Viewer"
            description="Advanced contract editing tools with real-time collaboration and ethical clause suggestions."
            imagePosition="left"
          />

          <FeatureCard
            image="/features-img-4.png"
            title="File Type Support"
            description="Support for multiple document formats with 3D visual indicators and seamless conversion capabilities."
            imagePosition="right"
          />
        </div>
      </div>
    </section>
  );
}
