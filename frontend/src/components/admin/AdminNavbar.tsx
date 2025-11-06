"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/industries", label: "Industries" },
  { href: "/admin/niches", label: "Niches" },
];

export function AdminNavbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {adminNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "border-b-2 px-1 py-4 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
