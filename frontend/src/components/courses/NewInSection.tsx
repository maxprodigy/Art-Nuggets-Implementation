"use client";

import React from "react";
import { NewCourseCard } from "./NewCourseCard";
import { getNewCourses } from "@/lib/course-data";

interface NewInSectionProps {
  searchTerm: string;
  activeCategory: string;
}

export function NewInSection({
  searchTerm,
  activeCategory,
}: NewInSectionProps) {
  const newCourses = getNewCourses();

  // Filter courses based on search term and category
  const filteredCourses = newCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || course.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="relative mb-16 py-16">
      {/* Blurred background - positioned behind content */}
      <div className="absolute top-[-80px] left-2/6 w-80 h-80 bg-blue-500/40 filter blur-3xl -z-10"></div>

      {/* Content - positioned above background */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Section Header */}
        <div className="mb-16">
          <h2 className="text-6xl sm:text-9xl tracking-wider font-medium text-center text-gray-900 mb-4">
            New In
          </h2>
        </div>

        {/* New Course Cards */}
        <div className="space-y-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <NewCourseCard
                key={course.id}
                image={course.image}
                title={course.title}
                description={course.description}
                courseId={course.id}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No new courses found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
