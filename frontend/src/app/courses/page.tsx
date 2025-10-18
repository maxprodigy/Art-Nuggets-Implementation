"use client";

import React, { useState } from "react";
import { CourseSearchHero } from "@/components/courses/CourseSearchHero";
import { NewInSection } from "@/components/courses/NewInSection";
import { PopularSection } from "@/components/courses/PopularSection";
import { Footer } from "@/components/landing/Footer";

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="min-h-screen">
      <CourseSearchHero
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
      <NewInSection searchTerm={searchTerm} activeCategory={activeCategory} />
      <PopularSection searchTerm={searchTerm} activeCategory={activeCategory} />
      <Footer />
    </div>
  );
}
