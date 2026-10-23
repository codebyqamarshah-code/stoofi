import { NextResponse } from 'next/server';

export function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;
  const token = request.cookies.get('token')?.value;
  const isValidCookieToken =
    token &&
    token !== 'none' &&
    token !== 'null' &&
    token !== 'undefined' &&
    !token.startsWith('mock_');

  // If user visits /login directly and already has a valid token cookie, redirect to /dashboard
  if (pathname === '/login') {
    const hasRedirectOrExpired = searchParams.has('redirect') || searchParams.has('expired');
    if (isValidCookieToken && !hasRedirectOrExpired) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Allow all /dashboard and sub-route requests through cleanly.
  // Full client-side authentication, session validation (localStorage, sessionStorage, cookies),
  // and role-based permissions are securely enforced by DashboardLayout and useAuth.
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/login'],
};