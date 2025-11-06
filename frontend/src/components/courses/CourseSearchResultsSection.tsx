"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useCourses } from "@/hooks";
import { getYouTubeThumbnail } from "@/lib/utils";
import { LearnCard } from "@/components/landing/LearnCard";

interface CourseSearchResultsSectionProps {
  searchTerm: string;
  industryId: string | null;
}

export function CourseSearchResultsSection({
  searchTerm,
  industryId,
}: CourseSearchResultsSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const sectionRef = useRef<HTMLElement>(null);

  const { data, isLoading, error } = useCourses({
    page: currentPage,
    page_size: pageSize,
    search: searchTerm || undefined,
    industry_id: industryId || undefined,
  });

  // Reset to page 1 when search or industry changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, industryId]);

  // Track previous loading state to only scroll when results finish loading
  const prevIsLoading = React.useRef(isLoading);

  // Auto-scroll to section only when search results finish loading
  useEffect(() => {
    // Only scroll when loading transitions from true to false (results just loaded)
    if (
      prevIsLoading.current &&
      !isLoading &&
      (searchTerm || industryId) &&
      sectionRef.current &&
      data
    ) {
      // Small delay to ensure section is fully rendered
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
    // Update previous loading state
    prevIsLoading.current = isLoading;
  }, [isLoading, searchTerm, industryId, data]);

  // Don't render if no search term and no industry selected
  if (!searchTerm && !industryId) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <section
        ref={sectionRef}
        className="py-16 mb-20 bg-gray-200/30 rounded-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
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
      <section
        ref={sectionRef}
        className="py-16 mb-20 bg-gray-200/30 rounded-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">
              Failed to load courses. Please try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const courses = data?.items || [];
  const totalPages = data?.total_pages || 0;

  return (
    <section
      ref={sectionRef}
      className="py-16 mb-20 bg-gray-200/30 rounded-2xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Search Results
          </h2>
          {data && (
            <p className="text-lg text-gray-600">
              Found {data.total} course{data.total !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {courses.length > 0 ? (
            courses.map((course) => {
              const thumbnailUrl = getYouTubeThumbnail(
                course.video_link,
                "hqdefault"
              );

              return (
                <Link key={course.id} href={`/courses/${course.id}`}>
                  <LearnCard
                    image={thumbnailUrl || "/placeholder-course.jpg"}
                    title={course.title}
                    description={course.summary}
                  />
                </Link>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">
                No courses found matching your criteria.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {(() => {
                  const pages: (number | "ellipsis")[] = [];
                  let lastPage = 0;

                  for (let page = 1; page <= totalPages; page++) {
                    // Always show first, last, current, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      // Add ellipsis if there's a gap
                      if (page - lastPage > 1) {
                        pages.push("ellipsis");
                      }
                      pages.push(page);
                      lastPage = page;
                    }
                  }

                  return pages.map((item, index) => {
                    if (item === "ellipsis") {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    const page = item as number;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  });
                })()}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) {
                        setCurrentPage(currentPage + 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </section>
  );
}
