import { z } from "zod";

import type { CourseDetailResponse } from "@/types/courses";

const keyTakeawaySchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Key takeaway is required")
    .max(280, "Key takeaway must be 280 characters or less"),
});

const additionalResourceSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Resource title is required")
    .max(120, "Title must be 120 characters or less"),
  link: z.string().trim().url("Please enter a valid URL"),
});

export const courseFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Course title must be at least 3 characters")
    .max(150, "Course title must be 150 characters or less"),
  industry_id: z.string().trim().min(1, "Please select an industry"),
  niche_id: z.string().trim().min(1, "Please select a niche"),
  video_link: z.string().trim().url("Please enter a valid video link"),
  summary: z.string().trim().min(20, "Summary must be at least 20 characters"),
  source: z.string().trim(),
  key_takeaways: z
    .array(keyTakeawaySchema)
    .min(1, "Add at least one key takeaway"),
  additional_resources: z
    .array(additionalResourceSchema)
    .max(10, "You can add up to 10 resources"),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

export const defaultCourseFormValues: CourseFormValues = {
  title: "",
  industry_id: "",
  niche_id: "",
  video_link: "",
  summary: "",
  source: "",
  key_takeaways: [{ content: "" }],
  additional_resources: [],
};

export const mapCourseToFormValues = (
  course: CourseDetailResponse
): CourseFormValues => ({
  title: course.title,
  industry_id: course.industry_id,
  niche_id: course.niche_id,
  video_link: course.video_link,
  summary: course.summary,
  source: course.source ?? "",
  key_takeaways: course.key_takeaways.map((item) => ({
    content: item.content,
  })),
  additional_resources: course.additional_resources.map((item) => ({
    title: item.title,
    link: item.link,
  })),
});

export type CoursePayload = {
  title: string;
  industry_id: string;
  niche_id: string;
  video_link: string;
  summary: string;
  source?: string;
  key_takeaways: Array<{ content: string }>;
  additional_resources: Array<{ title: string; link: string }>;
};

export const mapFormValuesToPayload = (
  values: CourseFormValues
): CoursePayload => ({
  title: values.title,
  industry_id: values.industry_id,
  niche_id: values.niche_id,
  video_link: values.video_link,
  summary: values.summary,
  source: values.source ? values.source : undefined,
  key_takeaways: values.key_takeaways,
  additional_resources: values.additional_resources,
});
