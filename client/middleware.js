import { NextResponse } from 'next/server';

export function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get('token')?.value;

  // Protect /dashboard and all subroutes: If no valid token cookie exists, immediately redirect to /login
  if (pathname.startsWith('/dashboard')) {
    if (!token || token.startsWith('mock_')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If user visits /login and already has a valid token cookie, redirect to /dashboard
  if (pathname === '/login') {
    if (token && !token.startsWith('mock_')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/login'],
};