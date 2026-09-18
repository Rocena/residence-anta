import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public paths that do not require authentication
  const publicPaths = ['/login', '/favicon.ico', '/_next', '/api'];
  
  // Check if current path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // Get auth token from cookies
  const authToken = request.cookies.get('anta_session')?.value;
  
  if (!authToken && !isPublicPath) {
    // If no token and trying to access protected route, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (authToken && pathname === '/login') {
    // If logged in and trying to access login page, redirect to dashboard
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images).*)'],
};
