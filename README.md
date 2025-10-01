# Task Manager Frontend - Authentication System

A comprehensive frontend authentication system built with Next.js 15, TypeScript, Zustand, and TanStack Query, featuring role-based access control (RBAC).

## Features

### 🔐 Authentication
- JWT-based authentication with refresh tokens
- Secure token storage using HTTP-only cookies
- Automatic token refresh on expiry
- Multi-tab logout synchronization
- Protected routes with role-based access

### 👥 Role-Based Access Control
- **User Role**: Access to personal dashboard and task management
- **Admin Role**: Full system access including user management and system statistics
- Route protection with HOCs (Higher-Order Components)
- Dynamic navigation based on user permissions

### 🗃️ State Management
- **Zustand** for global state management
- Persistent auth state across browser sessions
- Optimistic updates with error handling
- Store persistence for user data

### 🔄 Data Fetching & Caching
- **TanStack Query** for server state management
- Intelligent caching with stale-while-revalidate
- Background refetching and synchronization
- Error handling and retry logic
- Optimistic updates for mutations

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on port 5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Configure environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

4. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
client/
├── components/
│   ├── auth/                 # Authentication components
│   ├── hoc/                  # Higher-Order Components
│   └── layout/               # Layout components
├── contexts/                 # React contexts
├── hooks/                    # Custom hooks with TanStack Query
├── lib/                      # Configurations and utilities
├── services/                 # API service layers
├── store/                    # Zustand stores
├── types/                    # TypeScript type definitions
└── utils/                    # Utility functions
```

## Key Features Implemented

### Authentication Flow
- **Login/Register**: Complete forms with validation
- **Token Management**: Automatic refresh and secure storage
- **Route Protection**: HOCs for auth and role-based access
- **Multi-tab Sync**: Logout across all browser tabs

### State Management
- **Auth Store**: User state, loading states, error handling
- **Task Store**: Task management with pagination and filters
- **Admin Store**: User management and system statistics

### API Integration
- **Service Layer**: Clean separation of API calls
- **Interceptors**: Automatic token attachment and refresh
- **Error Handling**: Consistent error handling across the app
- **Caching**: Intelligent caching with TanStack Query

### Role-Based Access Control
- **Permission Utilities**: Check user roles and permissions
- **Route Guards**: Protect routes based on authentication and roles
- **Dynamic UI**: Show/hide features based on user permissions

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Type checking
npm run type-check   # Run TypeScript compiler
```

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## Usage Examples

### Middleware setup for route access control
```typescript
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


```


### API Calls with Caching
```typescript
// Fetch data with caching
const { data, isLoading, error } = useTasks()

// Mutate data with optimistic updates
const createTask = useCreateTask()
await createTask.mutateAsync(taskData)
```

## Architecture Decisions

### Why Zustand?
- Lightweight and simple
- No boilerplate code
- Perfect TypeScript support
- Excellent DevTools integration

### Why TanStack Query?
- Intelligent caching and synchronization
- Background refetching
- Optimistic updates
- Built-in loading and error states


## Security Features

- **Token Storage**: Secure HTTP-only cookies
- **Auto Refresh**: Seamless token renewal
- **RBAC**: Role-based access control

## Development Tips

1. **Type Safety**: All components are fully typed
2. **Error Boundaries**: Implement for production
3. **Loading States**: Built into all hooks
4. **Optimistic Updates**: Implemented for better UX
5. **Responsive Design**: Mobile-first approach

## Backend Integration

This frontend is designed to work with the provided backend API. Make sure your backend is running on `http://localhost:5000` or update the `NEXT_PUBLIC_API_URL` environment variable.

## Contributing

1. Follow the existing code structure
2. Add types for all new features
3. Include error handling
4. Add loading states for async operations
5. Test role-based access thoroughly

## License

This project is part of the Task Manager API system.
