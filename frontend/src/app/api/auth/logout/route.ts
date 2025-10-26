import { NextRequest, NextResponse } from "next/server";
import { backendClient } from "@/lib/api/client";

export async function GET(request: NextRequest) {
  try {
    // Call backend logout
    await backendClient.get("/auth/logout");

    // Return success response (tokens will be cleared from localStorage by frontend)
    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
      redirect: "/auth/login",
      notification: {
        type: "info",
        title: "Logged Out",
        message: "You have been successfully logged out",
      },
    });
  } catch (error: any) {
    console.error("Logout API error:", error);

    // Even if logout fails, return success (frontend will clear tokens)
    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
      redirect: "/auth/login",
      notification: {
        type: "info",
        title: "Logged Out",
        message: "You have been successfully logged out",
      },
    });
  }
}
