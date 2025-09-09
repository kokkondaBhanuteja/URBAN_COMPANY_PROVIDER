// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/services/authService';
import { connectDb } from '@/lib/dbConnect';

export async function POST(req: NextRequest) {
  await connectDb();
  try {
    const { email, password } = await req.json();
    // The userType 'provider' ensures only providers can log in through this route
    const { token, user } = await loginUser(email, password, 'provider');

    // Create the response object to set the cookie
    const response = NextResponse.json({
      message: "Login successful",
      user: { id: user._id, fullName: user.userName, email: user.email }
    });

    // Set the token in an HttpOnly cookie
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
    return NextResponse.json({ message: errorMessage }, { status: 401 });
  }
}