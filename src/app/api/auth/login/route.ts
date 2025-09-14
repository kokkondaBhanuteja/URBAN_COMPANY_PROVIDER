// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/services/authService';
import { connectDb } from '@/lib/dbConnect';

export async function POST(req: NextRequest) {
  await connectDb();
  try {
    const { email, password } = await req.json();
    
    const loginResult = await loginUser(email, password, 'provider');

    // This check prevents the destructuring error if loginResult is not as expected.
    if (!loginResult || !loginResult.token || !loginResult.user) {
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
      maxAge: 60 * 60, // 1 hour
      path: '/',
      sameSite: 'strict',
    });

    return response;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    // This ensures that specific errors like "pending verification" are sent to the frontend.
    return NextResponse.json({ message: errorMessage }, { status: 401 });
  }
}