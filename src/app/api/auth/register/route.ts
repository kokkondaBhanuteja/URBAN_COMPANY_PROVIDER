import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/services/authService";
import { connectDb } from "@/lib/dbConnect";

export async function POST(req: NextRequest) {
  await connectDb();
  try {
    const body = await req.json();
    // body now includes both User + Provider data
    const user = await registerUser(body);

    return NextResponse.json(
      { message: "User registered successfully", userId: user._id },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Registration failed" }, { status: 400 });
  }
}
