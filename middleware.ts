import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get("bfp_user")
  const { pathname } = request.nextUrl

  // Protected routes that require authentication
  const protectedRoutes = ["/professional", "/adult", "/kids", "/admin"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // If accessing a protected route without authentication, redirect to auth
  if (isProtectedRoute && !userCookie) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth"
    return NextResponse.redirect(url)
  }

  // If authenticated, check role-based permissions
  if (isProtectedRoute && userCookie) {
    try {
      // Decode and parse the cookie value
      const decodedValue = decodeURIComponent(userCookie.value)
      const user = JSON.parse(decodedValue)

      // Admin route - only admins can access
      if (pathname.startsWith("/admin") && user.role !== "admin") {
        const url = request.nextUrl.clone()
        url.pathname = "/"
        return NextResponse.redirect(url)
      }

      // Professional route - check permission
      if (pathname.startsWith("/professional") && !user.permissions?.accessProfessional) {
        const url = request.nextUrl.clone()
        url.pathname = "/"
        return NextResponse.redirect(url)
      }

      // Adult route - check permission
      if (pathname.startsWith("/adult") && !user.permissions?.accessAdult) {
        const url = request.nextUrl.clone()
        url.pathname = "/"
        return NextResponse.redirect(url)
      }

      // Kids route - check permission
      if (pathname.startsWith("/kids") && !user.permissions?.accessKids) {
        const url = request.nextUrl.clone()
        url.pathname = "/"
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error("Middleware auth error:", error)
      // If cookie is invalid, redirect to auth
      const url = request.nextUrl.clone()
      url.pathname = "/auth"
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/professional/:path*",
    "/adult/:path*",
    "/kids/:path*",
    "/admin/:path*",
    "/api/admin/:path*"
  ],
}
