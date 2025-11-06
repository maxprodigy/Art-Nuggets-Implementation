"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCourseAnalytics } from "@/hooks/useAdmin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function CourseAnalyticsPage() {
  const [limit, setLimit] = useState(10);
  const { data, isLoading, error } = useCourseAnalytics(limit);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-destructive">
          Error loading analytics. Please try again.
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Course Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            Detailed insights into course performance
          </p>
        </div>
        <Select
          value={limit.toString()}
          onValueChange={(v) => setLimit(Number(v))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select limit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">Top 10</SelectItem>
            <SelectItem value="20">Top 20</SelectItem>
            <SelectItem value="50">Top 50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Top Courses by Completions */}
      <Card>
        <CardHeader>
          <CardTitle>Top Courses by Completions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Title</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Niche</TableHead>
                <TableHead className="text-right">Completions</TableHead>
                <TableHead className="text-right">Favourites</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.top_courses_by_completions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                data.top_courses_by_completions.map((course) => (
                  <TableRow key={course.course_id}>
                    <TableCell className="font-medium">
                      {course.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{course.industry_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{course.niche_name}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {course.completions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {course.favourites.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Courses by Favourites */}
      <Card>
        <CardHeader>
          <CardTitle>Top Courses by Favourites</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Title</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Niche</TableHead>
                <TableHead className="text-right">Favourites</TableHead>
                <TableHead className="text-right">Completions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.top_courses_by_favourites.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                data.top_courses_by_favourites.map((course) => (
                  <TableRow key={course.course_id}>
                    <TableCell className="font-medium">
                      {course.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{course.industry_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{course.niche_name}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {course.favourites.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {course.completions.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Courses by Industry */}
      <Card>
        <CardHeader>
          <CardTitle>Courses by Industry</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Industry</TableHead>
                <TableHead className="text-right">Courses</TableHead>
                <TableHead className="text-right">Completions</TableHead>
                <TableHead className="text-right">Favourites</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.courses_by_industry.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                data.courses_by_industry.map((industry) => (
                  <TableRow key={industry.industry_id}>
                    <TableCell className="font-medium">
                      {industry.industry_name}
                    </TableCell>
                    <TableCell className="text-right">
                      {industry.course_count.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {industry.total_completions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {industry.total_favourites.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Courses by Niche */}
      <Card>
        <CardHeader>
          <CardTitle>Courses by Niche</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Niche</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead className="text-right">Courses</TableHead>
                <TableHead className="text-right">Completions</TableHead>
                <TableHead className="text-right">Favourites</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.courses_by_niche.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                data.courses_by_niche.map((niche) => (
                  <TableRow key={niche.niche_id}>
                    <TableCell className="font-medium">
                      {niche.niche_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{niche.industry_name}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {niche.course_count.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {niche.total_completions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {niche.total_favourites.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Course Activity (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Title</TableHead>
                <TableHead className="text-right">Recent Completions</TableHead>
                <TableHead className="text-right">Recent Favourites</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recent_course_activity.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground"
                  >
                    No recent activity
                  </TableCell>
                </TableRow>
              ) : (
                data.recent_course_activity.map((activity) => (
                  <TableRow key={activity.course_id}>
                    <TableCell className="font-medium">
                      {activity.title}
                    </TableCell>
                    <TableCell className="text-right">
                      {activity.recent_completions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {activity.recent_favourites.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
