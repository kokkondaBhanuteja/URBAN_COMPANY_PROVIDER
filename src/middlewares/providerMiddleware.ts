// src/middlewares/providerMiddleware.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/database/userModel";

export async function providerMiddleware(req: NextRequest): Promise<Headers> {
  // 1. Get token from cookies instead of headers
  const token = req.cookies.get("provider_token")?.value;

  if (!token) {
    throw new Error("Authorization token is missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; userType: string };

    if (decoded.userType !== 'provider' && decoded.userType !== 'admin') {
         throw new Error("Access denied: Not a provider");
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new Error("User not found");
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", user._id.toString());
    requestHeaders.set("x-user-type", user.userType);
    
    return requestHeaders;

  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}