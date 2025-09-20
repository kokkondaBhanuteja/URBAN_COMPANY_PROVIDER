// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/services/authService';
import { connectDb } from '@/lib/dbConnect';
import logger from '@/lib/logger';

export async function POST(req: NextRequest) {
  await connectDb();
  try {
    const { email, password } = await req.json();
    
    const loginResult = await loginUser(email, password, 'provider');

    if (!loginResult || !loginResult.token || !loginResult.user) {
        logger.error("Login failed: Could not retrieve authentication token for email: " + email);
        throw new Error("Login failed: Could not retrieve authentication token.");
    }

    const { token, user } = loginResult;

    const response = NextResponse.json({
      message: "Login successful",
      user: { id: user._id, fullName: user.userName, email: user.email }
    });

    response.cookies.set('provider_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 60 * 60,
      path: '/',
      sameSite: 'strict',
    });

    return response;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error("Login API error:", { error: errorMessage });
    return NextResponse.json({ message: errorMessage }, { status: 401 });
  }
}