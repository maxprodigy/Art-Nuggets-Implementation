import { NextRequest, NextResponse } from "next/server";
import { backendClient } from "@/lib/api/client";
import type { LoginRequest } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const credentials: LoginRequest = await request.json();

    // Call backend API directly
    const response = await backendClient.post("/auth/login", credentials);
    const data = response.data;

    // Return tokens to frontend (will be stored in localStorage)
    return NextResponse.json({
      success: true,
      user: data.user,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      message: data.message || "Login successful",
      redirect: "/courses",
      notification: {
        type: "success",
        title: "Welcome Back!",
        message: `Hello ${data.user.artist_name || data.user.email}!`,
      },
    });
  } catch (error: any) {
    console.error("Login API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Login failed",
        message: error.response?.data?.message || "Invalid credentials",
        notification: {
          type: "error",
          title: "Login Failed",
          message: error.response?.data?.message || "Invalid credentials",
        },
      },
      { status: error.response?.status || 401 }
    );
  }
}
