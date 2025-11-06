"use client";

import React, { useState } from "react";
import { useCourses } from "@/hooks/useCourses";
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
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function CoursesManagementPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const pageSize = 10;

  const { data, isLoading, error } = useCourses({
    page,
    page_size: pageSize,
    search: searchTerm || undefined,
  });

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
        <Button asChild>
          <Link href="/admin/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Link>
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
                        <Badge variant="outline">Industry ID</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Niche ID</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(course.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/courses/${course.id}`}>
                              Edit
                            </Link>
                          </Button>
                        </div>
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
    </div>
  );
}
