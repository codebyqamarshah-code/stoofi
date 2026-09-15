import { NextResponse } from 'next/server';

function decodeJwtRole(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    const parsed = JSON.parse(jsonPayload);
    return parsed.role || null;
  } catch (e) {
    return null;
  }
}

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;

  // Protect /dashboard and all sub-routes
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const isInvalidToken = !token || token.startsWith('mock_');
    if (isInvalidToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const role = decodeJwtRole(token);

    // If role is missing in token, redirect to login
    if (!role) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }

    const roleNorm = (role || '').trim().toLowerCase();

    // Student specific redirect if accessing other silos
    if (roleNorm === 'student' && pathname.startsWith('/dashboard/teacher')) {
      return NextResponse.redirect(new URL('/dashboard/student', request.url));
    }

    // Teacher specific redirect if accessing other silos
    if (roleNorm === 'teacher' && pathname.startsWith('/dashboard/student')) {
      return NextResponse.redirect(new URL('/dashboard/teacher', request.url));
    }

    // Super Admin, Admin, Staff, etc. have complete access to all /dashboard routes
    return NextResponse.next();
  }

  // If already logged in (has real token), route them properly if they hit /login
  if (pathname === '/login') {
    if (token && !token.startsWith('mock_')) {
      const role = decodeJwtRole(token);
      const roleNorm = (role || '').trim().toLowerCase();
      
      if (roleNorm === 'teacher') return NextResponse.redirect(new URL('/dashboard/teacher', request.url));
      if (roleNorm === 'student') return NextResponse.redirect(new URL('/dashboard/student', request.url));
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/login'],
};
