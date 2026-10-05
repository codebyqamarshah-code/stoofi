import { NextResponse } from 'next/server';

export function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('token')?.value;

  // If user visits /login and already has a valid token cookie, redirect to /dashboard
  if (pathname === '/login') {
    if (token && !token.startsWith('mock_')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Allow all /dashboard and sub-route requests through cleanly.
  // Full client-side authentication, session validation (localStorage, sessionStorage, cookies),
  // and role-based permissions are securely enforced by DashboardLayout and useAuth.
  // Next.js Edge Middleware cannot read browser localStorage, so redirecting here causes false kick-outs.
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/login'],
};