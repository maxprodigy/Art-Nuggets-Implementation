"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string | number;
    label: string;
    positive?: boolean;
  };
  children?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  children,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="rounded-full bg-muted p-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <div
              className={cn(
                "text-xs font-medium",
                trend.positive === true
                  ? "text-green-600 dark:text-green-400"
                  : trend.positive === false
                  ? "text-red-600 dark:text-red-400"
                  : "text-muted-foreground"
              )}
            >
              {trend.value} {trend.label}
            </div>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
