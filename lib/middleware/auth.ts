import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    fullName: string;
  };
}

interface JWTPayload {
  userId: string;
  email: string;
  fullName: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export async function verifyToken(req: NextRequest): Promise<JWTPayload> {
  try {
    // Get token from Authorization header or cookie
    let token = req.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      // Try to get token from cookie
      token = req.cookies.get("auth-token")?.value;
    }

    if (!token) {
      throw new Error("No token provided");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "your-app-name",
      audience: "your-app-users"
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    console.error("Token verification error:", error);
    throw new Error("Invalid or expired token");
  }
}

export function withAuth<T extends unknown[]>(
  handler: (req: AuthenticatedRequest, ...args: T) => Promise<Response> | Response
) {
  return async (req: NextRequest, ...args: T): Promise<Response> => {
    try {
      const decoded = await verifyToken(req);
      (req as AuthenticatedRequest).user = decoded;
      return await handler(req as AuthenticatedRequest, ...args);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Authentication failed";
      return new Response(
        JSON.stringify({ message: errorMessage }),
        { 
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
  };
}
