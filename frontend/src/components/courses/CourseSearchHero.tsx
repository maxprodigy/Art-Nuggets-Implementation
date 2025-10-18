"use client";

import React, { useState } from "react";
import { GradientBackground } from "@/components/ui/gradient-background";
import { Navbar } from "@/components/ui/navbar";
import { Search } from "lucide-react";
import { categories } from "@/lib/course-data";

interface CourseSearchHeroProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export function CourseSearchHero({
  searchTerm,
  setSearchTerm,
  activeCategory,
  setActiveCategory,
}: CourseSearchHeroProps) {
  return (
    <GradientBackground variant="hero" className="h-screen flex flex-col">
      {/* Navbar */}
      <Navbar variant="courses" />

      {/* Hero Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-gray-900 mb-8 leading-tight">
            The Contract <br /> Classroom
          </h1>

          {/* Search Bar */}
          <div className="relative mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 z-10 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Courses"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2 text-lg rounded-4xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent relative z-0"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-4">
            {["All", ...categories].map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === category
                    ? "bg-gray-900 text-white shadow-lg"
                    : "bg-white/80 text-gray-700 hover:bg-white hover:shadow-md backdrop-blur-sm"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </GradientBackground>
  );
}
