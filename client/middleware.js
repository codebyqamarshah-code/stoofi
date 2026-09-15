import { NextResponse } from 'next/server';

export function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('token')?.value;

  // If user visits /login and already has a token cookie, redirect to /dashboard
  if (pathname === '/login') {
    if (token && !token.startsWith('mock_')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Allow all /dashboard and sub-route requests through cleanly
  // Authentication & session management are securely handled by DashboardLayout and useAuth
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/login'],
};
