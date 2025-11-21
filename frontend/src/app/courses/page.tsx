"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CourseSearchHero } from "@/components/courses/CourseSearchHero";
import { NewInSection } from "@/components/courses/NewInSection";
import { CourseSearchResultsSection } from "@/components/courses/CourseSearchResultsSection";
import { Footer } from "@/components/landing/Footer";

function CoursesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [activeIndustryId, setActiveIndustryId] = useState<string | null>(
    searchParams.get("industry") || null
  );

  // Update URL when search or industry changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) {
      params.set("search", searchTerm);
    }
    if (activeIndustryId) {
      params.set("industry", activeIndustryId);
    }

    const newUrl = params.toString()
      ? `/courses?${params.toString()}`
      : "/courses";

    // Only update if URL actually changed
    const currentUrl = searchParams.toString();
    if (params.toString() !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [searchTerm, activeIndustryId, router, searchParams]);

  return (
    <div className="min-h-screen">
      <CourseSearchHero
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeIndustryId={activeIndustryId}
        setActiveIndustryId={setActiveIndustryId}
      />
      <CourseSearchResultsSection
        searchTerm={searchTerm}
        industryId={activeIndustryId}
      />
      <NewInSection />
      <Footer />
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <CoursesContent />
    </Suspense>
  );
}
