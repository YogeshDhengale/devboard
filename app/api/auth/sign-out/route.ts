// app/api/auth/signout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json(
      { message: "Signed out successfully" },
      { status: 200 }
    );

    // Clear the auth cookie
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // Immediately expire the cookie
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Sign-out error:", error);
    return NextResponse.json(
      { message: "Error during sign-out" },
      { status: 500 }
    );
  }
}

// GET method for sign-out via URL (optional)
export async function GET() {
  return POST();
}
