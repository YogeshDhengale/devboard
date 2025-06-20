// app/api/auth/signin/route.ts
import { ConnectDB } from "@/lib/config/db";
import UserModel from "@/lib/models/UserModel";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { rateLimit } from "@/lib/utils/rate-limit";

// Rate limiting configuration for sign-in (more restrictive)
const limiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 100,
});

// Track failed login attempts
const failedAttempts = new Map();

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    try {
      await limiter.check(5, clientIp); // 5 sign-in attempts per 15 minutes per IP
    } catch {
      return NextResponse.json(
        { message: "Too many sign-in attempts. Please try again later." },
        { status: 429 }
      );
    }

    await ConnectDB();
    // Parse request body
    const body = await req.json();
    const { email, password, rememberMe } = body;

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check failed attempts for this email
    const attemptKey = `${email}-${clientIp}`;
    const attempts = failedAttempts.get(attemptKey) || { count: 0, lastAttempt: 0 };
    
    // Block if too many failed attempts (5 attempts in 30 minutes)
    if (attempts.count >= 5 && Date.now() - attempts.lastAttempt < 30 * 60 * 1000) {
      return NextResponse.json(
        { message: "Account temporarily locked due to multiple failed attempts. Please try again later." },
        { status: 423 }
      );
    }

    // Find user by email
    const user = await UserModel.findOne({ 
      email: email.toLowerCase().trim() 
    }).select('+password'); // Explicitly include password field

    if (!user) {
      // Record failed attempt
      failedAttempts.set(attemptKey, {
        count: attempts.count + 1,
        lastAttempt: Date.now()
      });

      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Record failed attempt
      failedAttempts.set(attemptKey, {
        count: attempts.count + 1,
        lastAttempt: Date.now()
      });

      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Clear failed attempts on successful login
    failedAttempts.delete(attemptKey);

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    // Set token expiration based on rememberMe option
    const expiresIn = rememberMe ? "30d" : "7d";
    const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // seconds

    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        fullName: user.fullName
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: expiresIn,
        issuer: "your-app-name",
        audience: "your-app-users"
      }
    );

    // Create response without password
    const userResponse = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
    };

    // Update user's last login (optional)
    await UserModel.findByIdAndUpdate(user._id, {
      lastLogin: new Date()
    });

    // Create response
    const response = NextResponse.json(
      {
        message: "Sign-in successful",
        user: userResponse,
        token: token
      },
      { status: 200 }
    );

    // Set secure cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: cookieMaxAge,
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Sign-in error:", error);

    return NextResponse.json(
      { message: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}

// Cleanup failed attempts periodically (optional)
setInterval(() => {
  const now = Date.now();
  for (const [key, attempt] of failedAttempts.entries()) {
    // Remove attempts older than 1 hour
    if (now - attempt.lastAttempt > 60 * 60 * 1000) {
      failedAttempts.delete(key);
    }
  }
}, 10 * 60 * 1000); // Clean up every 10 minutes