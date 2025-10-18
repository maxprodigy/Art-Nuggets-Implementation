"use client";

import React from "react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/landing/Footer";
import { courses } from "@/lib/course-data";

interface CourseDetailPageProps {
  params: {
    id: string;
  };
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const course = courses.find((c) => c.id === params.id);

  return (
    <div className="min-h-screen">
      <Navbar variant="courses" />

      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {course ? (
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                {course.title}
              </h1>
              <div className="mb-8">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                />
              </div>
              <p className="text-lg text-gray-600 mb-8">{course.description}</p>
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-yellow-800 mb-2">
                  Coming Soon
                </h2>
                <p className="text-yellow-700">
                  This course is currently under development. Check back soon
                  for the full learning experience!
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                Course Not Found
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                The course you're looking for doesn't exist or has been removed.
              </p>
              <a
                href="/courses"
                className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Back to Courses
              </a>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
