import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;

  // Protect /dashboard and all sub-routes
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    // Block if: no token, or token is a fake/mock token (starts with 'mock_')
    const isInvalidToken = !token || token.startsWith('mock_');

    if (isInvalidToken) {
      // Redirect to dedicated unauthorized page
      const unauthorizedUrl = new URL('/unauthorized', request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  // If already logged in (has real token), don't let them access /login
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
