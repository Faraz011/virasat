import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Routes that require authentication
const protectedRoutes = ["/account", "/checkout", "/orders"]

// Routes that should redirect to homepage if user is already logged in
const authRoutes = ["/login", "/register"]

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")
  const pathname = request.nextUrl.pathname

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // If it's a protected route and no session exists, redirect to login
  if (isProtectedRoute && !session) {
    const url = new URL(`/login`, request.url)
    url.searchParams.set("callbackUrl", encodeURI(pathname))
    return NextResponse.redirect(url)
  }

  // If it's an auth route and session exists, redirect to homepage
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/orders/:path*", "/login", "/register"],
}
