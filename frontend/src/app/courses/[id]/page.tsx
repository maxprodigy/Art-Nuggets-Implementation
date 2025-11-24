"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Heart,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { YouTubeEmbed } from "@/components/courses/YouTubeEmbed";
import { LearnCard } from "@/components/landing/LearnCard";
import {
  useCourse,
  useCourseProgress,
  useToggleFavourite,
  useMarkCompleted,
  useCourses,
} from "@/hooks";
import { useAuth } from "@/hooks";
import { getYouTubeThumbnail } from "@/lib/utils";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { isAuthenticated } = useAuth();

  // Fetch course details
  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useCourse(courseId);

  // Fetch progress for authenticated users
  const { data: progress, isLoading: progressLoading } = useCourseProgress(
    isAuthenticated ? courseId : null
  );

  // Mutations
  const toggleFavouriteMutation = useToggleFavourite();
  const markCompletedMutation = useMarkCompleted();

  // Fetch related courses by niche_id and industry_id
  const { data: relatedByNiche } = useCourses(
    course
      ? {
          niche_id: course.niche_id,
          page_size: 6,
        }
      : undefined
  );

  const { data: relatedByIndustry } = useCourses(
    course
      ? {
          industry_id: course.industry_id,
          page_size: 6,
        }
      : undefined
  );

  // Combine and filter related courses
  const relatedCourses = useMemo(() => {
    if (!course) return [];

    const nicheCourses =
      relatedByNiche?.items.filter((c) => c.id !== course.id) || [];
    const industryCourses =
      relatedByIndustry?.items.filter(
        (c) => c.id !== course.id && !nicheCourses.some((nc) => nc.id === c.id)
      ) || [];

    // Combine: niche courses first, then industry courses, limit to 6
    return [...nicheCourses, ...industryCourses].slice(0, 6);
  }, [course, relatedByNiche, relatedByIndustry]);

  const handleToggleFavourite = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to add courses to favourites");
      router.push("/auth/login");
      return;
    }

    try {
      await toggleFavouriteMutation.mutateAsync(courseId);
      toast.success(
        progress?.is_favourite
          ? "Removed from favourites"
          : "Added to favourites"
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail || "Failed to update favourite status"
      );
    }
  };

  const handleToggleCompleted = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to toggle course completion");
      router.push("/auth/login");
      return;
    }

    try {
      await markCompletedMutation.mutateAsync(courseId);
      toast.success(
        progress?.is_completed
          ? "Course marked as incomplete"
          : "Course marked as completed!"
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.detail || "Failed to toggle course completion"
      );
    }
  };

  // Loading state
  if (courseLoading) {
    return (
      <div className="min-h-screen">
        <Navbar variant="courses" />
        <main className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-8">
              <div className="h-12 bg-gray-200 rounded w-3/4"></div>
              <div className="aspect-video bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (courseError || !course) {
    return (
      <div className="min-h-screen">
        <Navbar variant="courses" />
        <main className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Course Not Found
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/courses">
              <Button className="bg-gray-900 text-white hover:bg-gray-800">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Courses
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isFavourite = progress?.is_favourite || false;
  const isCompleted = progress?.is_completed || false;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar variant="courses" />

      {/* Spacing for fixed navbar */}
      <main className="pt-24 sm:pt-28 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <Link href="/courses">
            <Button
              variant="ghost"
              className="mb-6 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </Link>

          {/* Course Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {course.title}
          </h1>

          {/* Action Buttons */}
          {isAuthenticated && (
            <div className="flex flex-wrap gap-4 mb-8">
              <Button
                onClick={handleToggleFavourite}
                disabled={toggleFavouriteMutation.isPending || progressLoading}
                variant={isFavourite ? "default" : "outline"}
                className={
                  isFavourite
                    ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                    : ""
                }
              >
                <Heart
                  className={`mr-2 h-4 w-4 ${
                    isFavourite ? "fill-current" : ""
                  }`}
                />
                {toggleFavouriteMutation.isPending
                  ? "Loading..."
                  : isFavourite
                  ? "Favourited"
                  : "Add to Favourites"}
              </Button>

              <Button
                onClick={handleToggleCompleted}
                disabled={markCompletedMutation.isPending || progressLoading}
                variant={isCompleted ? "default" : "outline"}
                className={
                  isCompleted
                    ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                    : ""
                }
              >
                <CheckCircle2
                  className={`mr-2 h-4 w-4 ${
                    isCompleted ? "fill-current" : ""
                  }`}
                />
                {markCompletedMutation.isPending
                  ? "Loading..."
                  : isCompleted
                  ? "Mark as Incomplete"
                  : "Mark as Completed"}
              </Button>
            </div>
          )}

          {/* Video Section */}
          <div className="mb-12 bg-white rounded-xl shadow-sm overflow-hidden p-4 sm:p-6">
            <YouTubeEmbed videoUrl={course.video_link} />
          </div>

          {/* Course Summary */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              About This Course
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {course.summary}
            </p>
          </section>

          {/* Key Takeaways */}
          {course.key_takeaways && course.key_takeaways.length > 0 && (
            <section className="mb-12 bg-white rounded-xl shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="h-6 w-6 text-gray-900" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  What You'll Learn
                </h2>
              </div>
              <ul className="space-y-4">
                {course.key_takeaways
                  .sort((a, b) => a.order - b.order)
                  .map((takeaway) => (
                    <li
                      key={takeaway.id}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="leading-relaxed">
                        {takeaway.content}
                      </span>
                    </li>
                  ))}
              </ul>
            </section>
          )}

          {/* Additional Resources */}
          {course.additional_resources &&
            course.additional_resources.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Additional Resources
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {course.additional_resources
                    .sort((a, b) => a.order - b.order)
                    .map((resource) => (
                      <a
                        key={resource.id}
                        href={resource.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-gray-300"
                      >
                        <ExternalLink className="h-5 w-5 text-gray-600 flex-shrink-0" />
                        <span className="text-gray-900 font-medium">
                          {resource.title}
                        </span>
                      </a>
                    ))}
                </div>
              </section>
            )}

          {/* Creator Info */}
          {course.source && (
            <section className="mb-12 p-6 bg-gray-100 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Course Source
              </h3>
              {course.source.startsWith("http") ? (
                <a
                  href={course.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                  {course.source}
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <p className="text-gray-700">{course.source}</p>
              )}
            </section>
          )}

          {/* Related Courses */}
          {relatedCourses.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                More Like This
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedCourses.map((relatedCourse) => {
                  const thumbnailUrl = getYouTubeThumbnail(
                    relatedCourse.video_link,
                    "hqdefault"
                  );

                  return (
                    <Link
                      key={relatedCourse.id}
                      href={`/courses/${relatedCourse.id}`}
                    >
                      <LearnCard
                        image={thumbnailUrl || "/placeholder-course.jpg"}
                        title={relatedCourse.title}
                        description={relatedCourse.summary}
                      />
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
