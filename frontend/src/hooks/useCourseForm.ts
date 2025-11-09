"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  courseFormSchema,
  defaultCourseFormValues,
  mapCourseToFormValues,
  type CourseFormValues,
} from "@/lib/validations/course";
import type { CourseDetailResponse } from "@/types/courses";

interface UseCourseFormOptions {
  course?: CourseDetailResponse | null;
}

export const useCourseForm = ({
  course,
}: UseCourseFormOptions = {}) => {
  const defaultValues = useMemo<CourseFormValues>(
    () =>
      course
        ? mapCourseToFormValues(course)
        : {
            ...defaultCourseFormValues,
          },
    [course]
  );

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  return form;
};

export type UseCourseFormReturn = ReturnType<typeof useCourseForm>;
