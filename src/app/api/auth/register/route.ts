import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/services/authService";
import { connectDb } from "@/lib/dbConnect";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
  await connectDb();
  try {
    const body = await req.json();
    logger.info("Registration attempt for email: " + body.email);
    const user = await registerUser(body);

    return NextResponse.json(
      { message: "User registered successfully", userId: user._id },
      { status: 201 }
    );
  } catch (error: any) {
    logger.error("Registration API error:", { error: error.message, stack: error.stack });
    return NextResponse.json({ message: error.message || "Registration failed" }, { status: 400 });
  }
}