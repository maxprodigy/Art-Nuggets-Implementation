"use client";

import React from "react";
import { NewCourseCard } from "./NewCourseCard";
import { useRecentCourses } from "@/hooks";
import { getYouTubeThumbnail } from "@/lib/utils";

export function NewInSection() {
  const { data: courses, isLoading, error } = useRecentCourses(3);

  // Show loading state
  if (isLoading) {
    return (
      <section className="relative mb-16 py-16">
        <div className="absolute top-[-80px] left-2/6 w-80 h-80 bg-blue-500/40 filter blur-3xl -z-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="mb-16">
            <h2 className="text-6xl sm:text-9xl tracking-wider font-medium text-center text-gray-900 mb-4">
              New In
            </h2>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading courses...</p>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="relative mb-16 py-16">
        <div className="absolute top-[-80px] left-2/6 w-80 h-80 bg-blue-500/40 filter blur-3xl -z-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="mb-16">
            <h2 className="text-6xl sm:text-9xl tracking-wider font-medium text-center text-gray-900 mb-4">
              New In
            </h2>
          </div>
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">
              Failed to load courses. Please try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

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
          {courses && courses.length > 0 ? (
            courses.map((course) => {
              const thumbnailUrl = getYouTubeThumbnail(
                course.video_link,
                "hqdefault"
              );

              return (
                <NewCourseCard
                  key={course.id}
                  image={thumbnailUrl || "/placeholder-course.jpg"}
                  title={course.title}
                  description={course.summary}
                  courseId={course.id}
                />
              );
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No courses available at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
