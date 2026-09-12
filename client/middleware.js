import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;

  // Protect /dashboard and all its sub-routes
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    if (!token) {
      // Not logged in — redirect to login page
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'Access denied. Please login first to enter the dashboard.');
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*'],
};
