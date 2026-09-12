import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;

  // Protect /dashboard and all its sub-routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      // Not logged in, redirect to login with a message
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'Please login or register first to access the dashboard.');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect to dashboard if logged in and trying to access /login
  if (request.nextUrl.pathname === '/login') {
    if (token) {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
