// app/api/auth/signup/route.ts
import { ConnectDB } from "@/lib/config/db";
import UserModel from "@/lib/models/UserModel";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { rateLimit } from "@/lib/utils/rate-limit";

// Rate limiting configuration
const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 100, // Limit each IP to 100 requests per windowMs
});

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    try {
      await limiter.check(5, clientIp); // 5 requests per 15 minutes per IP
    } catch {
      return NextResponse.json(
        { message: "Too many sign-up attempts. Please try again later." },
        { status: 429 }
      );
    }

    await ConnectDB();

    // Parse request body
    const body = await req.json();
    const { fullName, email, phoneNumber, password, confirmPassword } = body;

    // Input validation
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { message: "Full name, email, and password are required" },
        { status: 400 }
      );
    }

    // Password confirmation check
    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Password and confirm password do not match" },
        { status: 400 }
      );
    }

    // Enhanced password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { 
          message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character" 
        },
        { status: 400 }
      );
    }

    // Email format validation (additional check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Full name validation
    if (fullName.trim().length < 3 || fullName.trim().length > 100) {
      return NextResponse.json(
        { message: "Full name must be between 3 and 100 characters" },
        { status: 400 }
      );
    }

    // Phone number validation (if provided)
    if (phoneNumber && phoneNumber.trim()) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phoneNumber.trim())) {
        return NextResponse.json(
          { message: "Invalid phone number format" },
          { status: 400 }
        );
      }
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ 
      email: email.toLowerCase().trim() 
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password with salt
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new UserModel({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber?.trim() || undefined,
      password: hashedPassword,
    });

    // Save user to database
    const savedUser = await newUser.save();

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign(
      { 
        userId: savedUser._id,
        email: savedUser.email 
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: "7d",
        issuer: "your-app-name",
        audience: "your-app-users"
      }
    );

    // Create response without password
    const userResponse = {
      id: savedUser._id,
      fullName: savedUser.fullName,
      email: savedUser.email,
      phoneNumber: savedUser.phoneNumber,
      createdAt: savedUser.createdAt,
    };

    // Set HTTP-only cookie for security
    const response = NextResponse.json(
      {
        message: "User created successfully",
        user: userResponse,
        token: token
      },
      { status: 201 }
    );

    // Set secure cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;

  } catch (error: unknown) {
    console.error("Sign-up error:", error);

    // Handle specific MongoDB errors
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: number }).code === 11000) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    if (typeof error === "object" && error !== null && "name" in error && (error as { name: string }).name === "ValidationError") {
      const validationErrors = Object.values((error as Record<string, { message: string }>).errors).map(
        (err: { message: string } | string) => typeof err === "string" ? err : err.message
      );
      return NextResponse.json(
        { message: "Validation error", errors: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}