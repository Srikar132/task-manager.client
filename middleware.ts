import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  exp: number;
}

// Define route configurations
const publicRoutes = ['/login', '/register', '/forgot-password', '/change-password' , '/'];
const authRoutes = ['/login', '/register']; // Redirect to dashboard if already logged in

// Admin-only routes
const adminRoutes = ['/admin'];

// Role hierarchy for access control
const roleHierarchy: Record<string, number> = {
  'admin': 3,
  'user': 1,
  'guest': 0,
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get tokens from cookies
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  
  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  // Allow public routes
  if (isPublicRoute && !isAuthRoute) {
    return NextResponse.next();
  }
  
  // If on auth page and already logged in, redirect to appropriate dashboard
  if (isAuthRoute && accessToken) {
    try {
      const decoded = jwtDecode<DecodedToken>(accessToken);
      const currentTime = Date.now() / 1000;
      
      // Token is still valid
      if (decoded.exp > currentTime) {
        const userRoleLevel = roleHierarchy[decoded.role] || 0;
        const dashboardUrl = userRoleLevel >= roleHierarchy['admin'] ? '/admin/dashboard' : '/dashboard';
        return NextResponse.redirect(new URL(dashboardUrl, request.url));
      }
    } catch (error) {
      // Invalid token, continue to login
    }
  }
  
  // Handle root route redirect
  if (pathname === '/' && accessToken) {
    try {
      const decoded = jwtDecode<DecodedToken>(accessToken);
      const currentTime = Date.now() / 1000;
      
      // Token is still valid
      if (decoded.exp > currentTime) {
        const userRoleLevel = roleHierarchy[decoded.role] || 0;
        const dashboardUrl = userRoleLevel >= roleHierarchy['admin'] ? '/admin/dashboard' : '/dashboard';
        return NextResponse.redirect(new URL(dashboardUrl, request.url));
      }
    } catch (error) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Root route without token - redirect to login
  if (pathname === '/' && !accessToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // No tokens, redirect to login (but not if already on login page)
  if (!accessToken && !refreshToken && !isAuthRoute) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/login') {
      loginUrl.searchParams.set('from', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }
  
  // Validate access token and check role-based access
  if (accessToken) {
    try {
      const decoded = jwtDecode<DecodedToken>(accessToken);
      const currentTime = Date.now() / 1000;
      
      // Token expired but has refresh token - let axios handle it
      if (decoded.exp < currentTime && refreshToken) {
        return NextResponse.next();
      }
      
      // Token expired and no refresh token
      if (decoded.exp < currentTime && !refreshToken) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('accessToken');
        response.cookies.delete('refreshToken');
        return response;
      }
      
      // Check role-based access
      const userRole = decoded.role;
      const userRoleLevel = roleHierarchy[userRole] || 0;
      
      // Check if accessing admin routes
      const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
      
      if (isAdminRoute) {
        // Admin routes require admin level or higher
        const minRequiredLevel = roleHierarchy['admin'];
        
        if (userRoleLevel < minRequiredLevel) {
          // Redirect non-admin users to their dashboard
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
      
      // Add user info to headers for server components
      const response = NextResponse.next();
      response.headers.set('x-user-id', decoded.id);
      response.headers.set('x-user-role', decoded.role);
      return response;
      
    } catch (_error) {
      // Invalid token
      if (!refreshToken) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('accessToken');
        response.cookies.delete('refreshToken');
        return response;
      }
    }
  }
  
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};