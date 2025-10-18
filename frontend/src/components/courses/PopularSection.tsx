"use client";

import React from "react";
import { LearnCard } from "@/components/landing/LearnCard";
import { getPopularCourses } from "@/lib/course-data";

interface PopularSectionProps {
  searchTerm: string;
  activeCategory: string;
}

export function PopularSection({
  searchTerm,
  activeCategory,
}: PopularSectionProps) {
  const popularCourses = getPopularCourses();

  // Filter courses based on search term and category
  const filteredCourses = popularCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || course.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="py-16 mb-20 bg-gray-200/30 rounded-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Popular
          </h2>
          <p className="text-lg text-gray-900">
            We've got you every step of the way
          </p>
        </div>

        {/* Popular Course Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <LearnCard
                key={course.id}
                image={course.image}
                title={course.title}
                description={course.description}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">
                No popular courses found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
