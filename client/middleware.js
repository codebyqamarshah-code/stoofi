import { NextResponse } from 'next/server';

function decodeJwtRole(token) {
  if (!token) return null;
  // If it's a mock token, we cannot decode the role from it.
  if (token.startsWith('mock_')) return null;
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
  let role = request.cookies.get('userRole')?.value;
  
  // Fallback to JWT decode if userRole cookie is somehow missing but a real token exists
  if (!role && token) {
    role = decodeJwtRole(token);
  }

  const pathname = request.nextUrl.pathname;

  // Protect /dashboard and all sub-routes
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    // If no token exists at all, user is completely unauthenticated. Show 404 Not Found.
    if (!token) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }

    // If role is missing, force re-login for strict security.
    if (!role) {
      const response = NextResponse.rewrite(new URL('/404', request.url));
      response.cookies.delete('token');
      response.cookies.delete('userRole');
      return response;
    }

    // Role-based Access Rules
    const isAdminRoute = pathname === '/dashboard/admin' || pathname.startsWith('/dashboard/admin/');
    const isTeacherRoute = pathname === '/dashboard/teacher' || pathname.startsWith('/dashboard/teacher/');
    const isStudentRoute = pathname === '/dashboard/student' || pathname.startsWith('/dashboard/student/');
    const isParentRoute = pathname === '/dashboard/parent' || pathname.startsWith('/dashboard/parent/');
    const isAccountantRoute = pathname === '/dashboard/accountant' || pathname.startsWith('/dashboard/accountant/');

    // Super Admin routes are everything else that isn't explicitly claimed by another role
    const isSuperAdminRoute = !isAdminRoute && !isTeacherRoute && !isStudentRoute && !isParentRoute && !isAccountantRoute;

    // Enforce Silos (Rewrite to /404 if unauthorized to show Not Found as requested)
    if (role === 'Super Admin' && !isSuperAdminRoute) {
      return NextResponse.rewrite(new URL('/404', request.url));
    } else if (role === 'Admin' && !isAdminRoute) {
      return NextResponse.rewrite(new URL('/404', request.url));
    } else if (role === 'Teacher' && !isTeacherRoute) {
      return NextResponse.rewrite(new URL('/404', request.url));
    } else if (role === 'Student' && !isStudentRoute) {
      return NextResponse.rewrite(new URL('/404', request.url));
    } else if (role === 'Parent' && !isParentRoute) {
      return NextResponse.rewrite(new URL('/404', request.url));
    } else if (role === 'Accountant' && !isAccountantRoute) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  }

  // If already logged in, route them properly if they hit /login
  if (pathname === '/login') {
    if (token) {
      if (role === 'Admin') return NextResponse.redirect(new URL('/dashboard/admin', request.url));
      if (role === 'Teacher') return NextResponse.redirect(new URL('/dashboard/teacher', request.url));
      if (role === 'Student') return NextResponse.redirect(new URL('/dashboard/student', request.url));
      if (role === 'Parent') return NextResponse.redirect(new URL('/dashboard/parent', request.url));
      if (role === 'Accountant') return NextResponse.redirect(new URL('/dashboard/accountant', request.url));
      if (role === 'Super Admin') return NextResponse.redirect(new URL('/dashboard', request.url));
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/login'],
};
