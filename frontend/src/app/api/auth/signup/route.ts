import { NextRequest, NextResponse } from "next/server";
import { backendClient } from "@/lib/api/client";
import type { RegisterRequest } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const userData: RegisterRequest = await request.json();

    // Call backend API directly
    const response = await backendClient.post("/auth/signup/", userData);
    const data = response.data;

    // Return tokens to frontend (will be stored in localStorage)
    return NextResponse.json({
      success: true,
      user: data.user,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      message: data.message || "Account created successfully",
      redirect: "/onboarding",
      notification: {
        type: "success",
        title: "Account Created!",
        message: `Welcome ${data.user.artist_name || data.user.email}!`,
      },
    });
  } catch (error: any) {
    console.error("Signup API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Registration failed",
        message:
          error.response?.data?.message ||
          "An error occurred during registration",
        notification: {
          type: "error",
          title: "Registration Failed",
          message:
            error.response?.data?.message ||
            "An error occurred during registration",
        },
      },
      { status: error.response?.status || 500 }
    );
  }
}
