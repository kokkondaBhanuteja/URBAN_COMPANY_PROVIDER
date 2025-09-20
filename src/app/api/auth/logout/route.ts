// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function POST() {
  logger.info("User logout");
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