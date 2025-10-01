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

### Protected Routes
```typescript
// Protect any component with authentication
export default withAuth(MyComponent)

// Protect with specific role
export default withAdminRole(AdminComponent)
```

### Using Authentication State
```typescript
const { user, isAuthenticated, login, logout } = useAuthStore()

// Login user
await login({ email, password })

// Logout user
await logout()
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

### Why HOCs for Route Protection?
- Reusable across components
- Clear separation of concerns
- Easy to test and maintain
- Type-safe with TypeScript

## Security Features

- **Token Storage**: Secure HTTP-only cookies
- **Auto Refresh**: Seamless token renewal
- **RBAC**: Role-based access control
- **Route Guards**: Client-side protection
- **CSRF Protection**: Ready for implementation

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
