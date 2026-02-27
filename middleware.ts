import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple middleware for protected routes
export function middleware(request: NextRequest) {
  // For now, let client-side handle auth redirects
  // This can be enhanced later for server-side protection
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}