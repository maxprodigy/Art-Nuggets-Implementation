"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface NewCourseCardProps {
  image: string;
  title: string;
  description: string;
  courseId: string;
}

export function NewCourseCard({
  image,
  title,
  description,
  courseId,
}: NewCourseCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="flex flex-row items-start">
        {/* Image */}
        <div className="w-1/3">
          <div className="relative w-full h-64 md:h-60">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="w-2/3 p-6 flex flex-col justify-between h-48">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {title}
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              {description}
            </p>
          </div>

          {/* Start Course Button */}
          <div className="mt-4">
            <Link href={`/courses/${courseId}`}>
              <Button
                variant="default"
                className="bg-black text-white hover:bg-gray-800 px-6 py-2 rounded-lg"
              >
                Start Course
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
