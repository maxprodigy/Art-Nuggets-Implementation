"use client";

import React from "react";
import {
  Users,
  BookOpen,
  Activity,
  CheckCircle2,
  Trophy,
  Heart,
  TrendingUp,
  BarChart3,
  Building2,
  Tag,
} from "lucide-react";
import { useDashboardOverview } from "@/hooks/useAdmin";
import { MetricCard } from "@/components/admin/MetricCard";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useDashboardOverview();

  // Log error details for debugging
  if (error) {
    console.error("Dashboard error:", error);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : (error as any)?.response?.data?.detail ||
          (error as any)?.response?.data?.message ||
          (error as any)?.message ||
          "Unknown error";
    const statusCode = (error as any)?.response?.status;
    const isTimeout =
      errorMessage.includes("timeout") || errorMessage.includes("exceeded");

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-destructive text-center">
          <h2 className="text-xl font-semibold mb-2">
            Error loading dashboard
          </h2>
          {isTimeout && (
            <p className="text-sm mb-2 text-orange-600">
              The request is taking longer than expected. This may indicate the
              backend is slow or not responding.
            </p>
          )}
          <p className="text-sm mb-2">
            {statusCode && `Status: ${statusCode}`}
          </p>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground mt-2">
          Key metrics and insights at a glance
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={data.total_users.toLocaleString()}
          subtitle="All registered users"
          icon={Users}
          trend={{
            value: `+${data.new_users_this_week}`,
            label: "this week",
            positive: true,
          }}
        />
        <MetricCard
          title="Total Courses"
          value={data.total_courses.toLocaleString()}
          subtitle="Available courses"
          icon={BookOpen}
        />
        <MetricCard
          title="Active Users"
          value={data.active_users_30d.toLocaleString()}
          subtitle="Users active in last 30 days"
          icon={Activity}
        />
        <MetricCard
          title="Completion Rate"
          value={`${data.completion_rate}%`}
          subtitle="Users who completed at least one course"
          icon={CheckCircle2}
        >
          <div className="mt-4">
            <Progress value={data.completion_rate} className="h-2" />
          </div>
        </MetricCard>
      </div>

      {/* Engagement Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Completions"
          value={data.total_completions.toLocaleString()}
          subtitle="All-time completions"
          icon={Trophy}
        />
        <MetricCard
          title="Total Favourites"
          value={data.total_favourites.toLocaleString()}
          subtitle="Courses favourited"
          icon={Heart}
        />
        <MetricCard
          title="Avg Courses Per User"
          value={data.average_courses_per_user.toFixed(2)}
          subtitle="Engagement average"
          icon={BarChart3}
        />
        <MetricCard
          title="New Users This Month"
          value={data.new_users_this_month.toLocaleString()}
          subtitle="Month-over-month growth"
          icon={TrendingUp}
          trend={{
            value: `+${data.new_users_this_month}`,
            label: "new users",
            positive: true,
          }}
        />
      </div>

      {/* Content Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Industries</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.total_industries.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active industries
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Niches</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.total_niches.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Active niches</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
