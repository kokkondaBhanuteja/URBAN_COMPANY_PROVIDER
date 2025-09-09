// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logout successful' });
  
  response.cookies.set('provider_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    maxAge: 0,
    path: '/',
    sameSite: 'strict',
  });

  return response;
}