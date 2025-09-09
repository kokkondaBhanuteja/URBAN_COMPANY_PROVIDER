// src/middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("provider_token")?.value

  // If the user has a token and tries to access the login or register page, redirect them to the dashboard.
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Define the protected routes that require authentication.
  const protectedRoutes = [
    "/dashboard",
    "/bookings",
    "/earnings",
    "/reviews",
    "/support",
    "/profile",
  ]

  // If the user is trying to access a protected route without a token, redirect them to the login page.
  if (!token && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect the root path to the login page.
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
}