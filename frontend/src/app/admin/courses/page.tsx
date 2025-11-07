"use client";

import React, { useMemo, useState } from "react";
import { useCourses, useCourse } from "@/hooks/useCourses";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Search, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CourseFormModal } from "@/components/admin/CourseFormModal";
import { useIndustries, useNiches } from "@/hooks/useContent";

export default function CoursesManagementPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const pageSize = 10;

  const [isCourseModalOpen, setCourseModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const { data, isLoading, error } = useCourses({
    page,
    page_size: pageSize,
    search: searchTerm || undefined,
  });

  const { data: industriesData } = useIndustries();
  const { data: nichesData } = useNiches(0, 200);

  const { data: selectedCourse } = useCourse(
    modalMode === "edit" && isCourseModalOpen ? selectedCourseId : null
  );

  const industryNameById = useMemo(() => {
    const map = new Map<string, string>();
    industriesData?.industries.forEach((industry) => {
      map.set(industry.id, industry.name);
    });
    return map;
  }, [industriesData]);

  const nicheNameById = useMemo(() => {
    const map = new Map<string, string>();
    nichesData?.niches.forEach((niche) => {
      map.set(niche.id, niche.name);
    });
    return map;
  }, [nichesData]);

  const handleModalChange = (open: boolean) => {
    setCourseModalOpen(open);
    if (!open) {
      setSelectedCourseId(null);
      setModalMode("create");
    }
  };

  const handleCreateClick = () => {
    setModalMode("create");
    setSelectedCourseId(null);
    setCourseModalOpen(true);
  };

  const handleEditClick = (courseId: string) => {
    setModalMode("edit");
    setSelectedCourseId(courseId);
    setCourseModalOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on search
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-destructive">
          Error loading courses. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Courses Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage all courses in the platform
          </p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Create Course
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {data?.total
              ? `${data.total} course${data.total !== 1 ? "s" : ""}`
              : "Courses"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!data || data.items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No courses found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Niche</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/courses/${course.id}`}
                          className="hover:underline"
                        >
                          {course.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {industryNameById.get(course.industry_id) ||
                            "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {nicheNameById.get(course.niche_id) || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(course.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={(event) => {
                                event.preventDefault();
                                handleEditClick(course.id);
                              }}
                            >
                              Edit course
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/courses/${course.id}`}
                                target="_blank"
                              >
                                View public page
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data.total_pages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page > 1) setPage(page - 1);
                          }}
                          className={
                            page === 1 ? "pointer-events-none opacity-50" : ""
                          }
                        />
                      </PaginationItem>
                      {Array.from({ length: data.total_pages }, (_, i) => i + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === data.total_pages ||
                            (p >= page - 1 && p <= page + 1)
                        )
                        .map((p, idx, arr) => (
                          <React.Fragment key={p}>
                            {idx > 0 && arr[idx - 1] !== p - 1 && (
                              <PaginationItem>
                                <PaginationLink
                                  href="#"
                                  className="pointer-events-none"
                                >
                                  ...
                                </PaginationLink>
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setPage(p);
                                }}
                                isActive={p === page}
                              >
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page < data.total_pages) setPage(page + 1);
                          }}
                          className={
                            page === data.total_pages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      <CourseFormModal
        open={isCourseModalOpen}
        onOpenChange={handleModalChange}
        mode={modalMode}
        course={modalMode === "edit" ? selectedCourse : undefined}
      />
    </div>
  );
}
