"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { useStep } from "@/hooks/use-step";
import { useCourseForm } from "@/hooks/useCourseForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCourse, useUpdateCourse } from "@/hooks/useCourses";
import {
  mapFormValuesToPayload,
  defaultCourseFormValues,
  mapCourseToFormValues,
  type CourseFormValues,
} from "@/lib/validations/course";
import { useIndustries, useNiches } from "@/hooks/useContent";
import type { CourseDetailResponse } from "@/types/courses";
import { Plus, Trash2 } from "lucide-react";

interface CourseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  course?: CourseDetailResponse | null;
}

const steps = [
  {
    title: "",
    description: "",
    fields: ["title", "industry_id", "niche_id"],
  },
  {
    title: "Content Details",
    description: "Add the media link and course summary.",
    fields: ["video_link", "summary", "source"],
  },
  {
    title: "Key Takeaways",
    description: "Highlight the main lessons from this course.",
    fields: ["key_takeaways"],
  },
  {
    title: "Resources & Review",
    description: "Attach optional resources and review before publishing.",
    fields: ["additional_resources"],
  },
];

const TOTAL_STEPS = steps.length;

export function CourseFormModal({
  open,
  onOpenChange,
  mode,
  course,
}: CourseFormModalProps) {
  const isEditMode = mode === "edit";

  const form = useCourseForm({ course: isEditMode ? course : undefined });
  const {
    control,
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = form;

  const courseMemo = useMemo(() => course, [course?.id, course?.updated_at]);
  const courseIndustryId = courseMemo?.industry_id ?? undefined;
  const courseNicheId = courseMemo?.niche_id ?? undefined;
  const previousIndustryRef = useRef<string | undefined>(courseIndustryId);
  const industryTouchedRef = useRef(false);

  const watchedIndustryId = watch("industry_id");
  const effectiveIndustryId =
    watchedIndustryId || courseIndustryId || undefined;

  const [
    currentStep,
    { goToNextStep, goToPrevStep, canGoToPrevStep, reset: resetSteps },
  ] = useStep(TOTAL_STEPS);

  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();

  const { data: industriesData, isLoading: isLoadingIndustries } =
    useIndustries();
  const { data: nichesData, isLoading: isLoadingNiches } = useNiches(
    0,
    100,
    effectiveIndustryId
  );

  const keyTakeawaysArray = useFieldArray({
    control,
    name: "key_takeaways",
  });

  const additionalResourcesArray = useFieldArray({
    control,
    name: "additional_resources",
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open) {
      reset(defaultCourseFormValues);
      keyTakeawaysArray.replace([{ content: "" }]);
      additionalResourcesArray.replace([]);
      resetSteps();
      previousIndustryRef.current = undefined;
      industryTouchedRef.current = false;
      return;
    }

    if (isEditMode) {
      if (!courseMemo) {
        return;
      }
      const values = mapCourseToFormValues(courseMemo);
      reset(values);
      setValue("industry_id", values.industry_id, {
        shouldValidate: true,
        shouldDirty: false,
      });
      setValue("niche_id", values.niche_id, {
        shouldValidate: true,
        shouldDirty: false,
      });
      keyTakeawaysArray.replace(
        values.key_takeaways.length > 0
          ? values.key_takeaways
          : [{ content: "" }]
      );
      additionalResourcesArray.replace(values.additional_resources ?? []);
      previousIndustryRef.current = values.industry_id;
      industryTouchedRef.current = false;
    } else {
      reset(defaultCourseFormValues);
      keyTakeawaysArray.replace([{ content: "" }]);
      additionalResourcesArray.replace([]);
      previousIndustryRef.current = undefined;
      industryTouchedRef.current = false;
    }

    resetSteps();
  }, [open, isEditMode, courseMemo]);

  useEffect(() => {
    if (!open) return;

    if (watchedIndustryId && watchedIndustryId !== courseIndustryId) {
      industryTouchedRef.current = true;
    }

    if (
      previousIndustryRef.current !== undefined &&
      previousIndustryRef.current !== watchedIndustryId
    ) {
      if (industryTouchedRef.current) {
        setValue("niche_id", "");
      } else if (courseNicheId) {
        setValue("niche_id", courseNicheId, {
          shouldValidate: true,
          shouldDirty: false,
        });
      }
    }

    previousIndustryRef.current = watchedIndustryId || undefined;
  }, [watchedIndustryId, setValue, open, courseIndustryId, courseNicheId]);

  useEffect(() => {
    if (open && isEditMode && courseNicheId && !industryTouchedRef.current) {
      setValue("niche_id", courseNicheId, {
        shouldValidate: true,
        shouldDirty: false,
      });
    }
  }, [open, isEditMode, courseNicheId, setValue]);

  const isProcessing =
    isSubmitting ||
    createCourseMutation.isPending ||
    updateCourseMutation.isPending;
  const isEditDataLoading = isEditMode && !course;
  const isControlsDisabled = isProcessing || isEditDataLoading;

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleNextStep = async () => {
    if (isEditDataLoading) return;

    const step = steps[currentStep - 1];
    const isValid = await trigger(step.fields as any, { shouldFocus: true });
    if (!isValid) return;

    if (currentStep < TOTAL_STEPS) {
      goToNextStep();
    }
  };

  const onSubmit = handleSubmit(async (values: CourseFormValues) => {
    const payload = mapFormValuesToPayload(values);

    if (isEditDataLoading) {
      return;
    }

    try {
      if (isEditMode && course) {
        await updateCourseMutation.mutateAsync({
          courseId: course.id,
          payload,
        });
      } else {
        await createCourseMutation.mutateAsync(payload);
      }

      handleClose();
    } catch (error) {
      if (!isEditMode) {
        // noop, toast handled in mutation
      }
    }
  });

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                placeholder="Enter course title"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Industry</Label>
              <Controller
                control={control}
                name="industry_id"
                render={({ field }) => (
                  <Select
                    value={field.value || courseIndustryId || ""}
                    onValueChange={(value) => {
                      industryTouchedRef.current = true;
                      field.onChange(value);
                    }}
                    disabled={isLoadingIndustries}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingIndustries
                            ? "Loading industries..."
                            : "Select an industry"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(industriesData?.industries || []).map((industry) => (
                        <SelectItem key={industry.id} value={industry.id}>
                          {industry.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.industry_id && (
                <p className="text-sm text-destructive">
                  {errors.industry_id.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Niche</Label>
              <Controller
                control={control}
                name="niche_id"
                render={({ field }) => (
                  <Select
                    value={field.value || courseNicheId || ""}
                    onValueChange={(value) => field.onChange(value)}
                    disabled={!effectiveIndustryId || isLoadingNiches}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          effectiveIndustryId
                            ? isLoadingNiches
                              ? "Loading niches..."
                              : "Select a niche"
                            : "Select industry first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(nichesData?.niches || []).map((niche) => (
                        <SelectItem key={niche.id} value={niche.id}>
                          {niche.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.niche_id && (
                <p className="text-sm text-destructive">
                  {errors.niche_id.message}
                </p>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="video_link">Video Link</Label>
              <Input
                id="video_link"
                placeholder="https://..."
                {...register("video_link")}
              />
              {errors.video_link && (
                <p className="text-sm text-destructive">
                  {errors.video_link.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="summary">Course Summary</Label>
              <Textarea
                id="summary"
                placeholder="Describe what this course covers..."
                rows={5}
                {...register("summary")}
              />
              {errors.summary && (
                <p className="text-sm text-destructive">
                  {errors.summary.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="source">Source (optional)</Label>
              <Input
                id="source"
                placeholder="https://..."
                {...register("source")}
              />
              {errors.source && (
                <p className="text-sm text-destructive">
                  {errors.source.message as string}
                </p>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-medium">Key Takeaways</h3>
                <p className="text-sm text-muted-foreground">
                  Add the main lessons learners should remember.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-primary/40 text-primary hover:bg-primary/5"
                onClick={() => keyTakeawaysArray.append({ content: "" })}
              >
                <Plus className="mr-2 h-4 w-4" /> Add takeaway
              </Button>
            </div>
            <div className="space-y-3">
              {keyTakeawaysArray.fields.map((field, index) => (
                <div key={field.id} className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder={`Takeaway ${index + 1}`}
                      {...register(`key_takeaways.${index}.content` as const)}
                    />
                    {errors.key_takeaways?.[index]?.content && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.key_takeaways[index]?.content?.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={keyTakeawaysArray.fields.length === 1}
                    onClick={() => keyTakeawaysArray.remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-medium">Additional Resources</h3>
                <p className="text-sm text-muted-foreground">
                  Add optional links to support materials, downloads, or tools.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-primary/40 text-primary hover:bg-primary/5"
                onClick={() =>
                  additionalResourcesArray.append({ title: "", link: "" })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add resource
              </Button>
            </div>

            <div className="space-y-4">
              {additionalResourcesArray.fields.length === 0 && (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  No resources added yet. Add optional materials to enrich the
                  course.
                </div>
              )}

              {additionalResourcesArray.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-lg border p-4"
                >
                  <div className="grid gap-2">
                    <Label htmlFor={`resource-title-${index}`}>Title</Label>
                    <Input
                      id={`resource-title-${index}`}
                      placeholder="Resource title"
                      {...register(
                        `additional_resources.${index}.title` as const
                      )}
                    />
                    {errors.additional_resources?.[index]?.title && (
                      <p className="text-xs text-destructive">
                        {errors.additional_resources[index]?.title?.message}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`resource-link-${index}`}>Link</Label>
                    <Input
                      id={`resource-link-${index}`}
                      placeholder="https://..."
                      {...register(
                        `additional_resources.${index}.link` as const
                      )}
                    />
                    {errors.additional_resources?.[index]?.link && (
                      <p className="text-xs text-destructive">
                        {errors.additional_resources[index]?.link?.message}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => additionalResourcesArray.remove(index)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 rounded-lg border border-primary/20 p-4 bg-primary/10">
              <h4 className="text-sm font-semibold text-primary">Review</h4>
              <p className="text-sm text-muted-foreground">
                Review the course details before submitting. You can go back to
                previous steps to make changes.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge
                  variant="secondary"
                  className="bg-primary/15 text-primary"
                >
                  {form.watch("title") || "Untitled"}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-primary/40 text-primary"
                >
                  {industriesData?.industries.find(
                    (i) => i.id === watchedIndustryId
                  )?.name || "No industry selected"}
                </Badge>
                {form.watch("niche_id") && (
                  <Badge
                    variant="outline"
                    className="border-accent/40 text-accent-foreground"
                  >
                    {nichesData?.niches.find(
                      (n) => n.id === form.watch("niche_id")
                    )?.name || "No niche selected"}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const modalTitle = isEditMode ? "Edit course" : "Create new course";
  const footerButtons = () => {
    const isLastStep = currentStep === TOTAL_STEPS;

    return (
      <div className="flex w-full items-center justify-between">
        <Button
          type="button"
          variant="outline"
          className="border-primary/40 text-primary hover:bg-primary/5"
          onClick={canGoToPrevStep ? goToPrevStep : handleClose}
          disabled={isControlsDisabled}
        >
          {canGoToPrevStep ? "Back" : "Cancel"}
        </Button>
        <div className="flex items-center gap-2">
          {!isLastStep && (
            <Button
              type="button"
              className="bg-primary/90 hover:bg-primary text-primary-foreground"
              onClick={handleNextStep}
              disabled={isControlsDisabled}
            >
              Next
            </Button>
          )}
          {isLastStep && (
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isControlsDisabled}
            >
              {isProcessing
                ? isEditMode
                  ? "Saving..."
                  : "Publishing..."
                : isEditMode
                ? "Save changes"
                : "Publish course"}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-6">
            <DialogHeader className="text-center space-y-3">
              <DialogTitle className="sr-only">{modalTitle}</DialogTitle>
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  Step {currentStep} of {TOTAL_STEPS}
                </p>
                <div className="flex flex-col items-center gap-1">
                  <h2 className="text-2xl font-semibold">
                    {steps[currentStep - 1].title || modalTitle}
                  </h2>
                  {steps[currentStep - 1].description ? (
                    <DialogDescription className="max-w-2xl text-sm">
                      {steps[currentStep - 1].description}
                    </DialogDescription>
                  ) : null}
                </div>
              </div>
              <div className="relative mx-auto h-2 w-full max-w-xl overflow-hidden rounded-full bg-primary/10">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-primary/80 to-accent"
                  style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
                />
              </div>
            </DialogHeader>

            {isEditDataLoading ? (
              <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
                Loading course details...
              </div>
            ) : (
              renderStepContent()
            )}
          </div>

          <DialogFooter>{footerButtons()}</DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
