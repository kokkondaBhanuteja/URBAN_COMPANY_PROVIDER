// src/middlewares/providerMiddleware.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/database/userModel";
import logger from "@/lib/logger";


export async function providerMiddleware(req: NextRequest): Promise<Headers> {
  const token = req.cookies.get("provider_token")?.value;

  if (!token) {
    logger.warn("Authorization token is missing");
    throw new Error("Authorization token is missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; userType: string };

    if (decoded.userType !== 'provider' && decoded.userType !== 'admin') {
         logger.warn(`Access denied: Not a provider. userId: ${decoded.id}`);
         throw new Error("Access denied: Not a provider");
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      logger.warn(`User not found for id: ${decoded.id}`);
      throw new Error("User not found");
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", user._id.toString());
    requestHeaders.set("x-user-type", user.userType);
    
    return requestHeaders;

  } catch (error) {
    logger.error("Invalid or expired token", { error });
    throw new Error("Invalid or expired token");
  }
}