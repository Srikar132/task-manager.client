import { User } from '@/types';

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Permission checker functions
export class RolePermissions {
  // Check if user has a specific role
  static hasRole(user: User | null, role: UserRole): boolean {
    if (!user) return false;
    return user.role === role;
  }

  // Check if user is admin
  static isAdmin(user: User | null): boolean {
    return this.hasRole(user, USER_ROLES.ADMIN);
  }

  // Check if user is regular user
  static isUser(user: User | null): boolean {
    return this.hasRole(user, USER_ROLES.USER);
  }

  // Check if user can access admin panel
  static canAccessAdmin(user: User | null): boolean {
    return this.isAdmin(user);
  }

  // Check if user can manage other users
  static canManageUsers(user: User | null): boolean {
    return this.isAdmin(user);
  }

  // Check if user can view system statistics
  static canViewSystemStats(user: User | null): boolean {
    return this.isAdmin(user);
  }

  // Check if user can manage tasks (their own)
  static canManageTasks(user: User | null): boolean {
    return user !== null && user.isActive;
  }

  // Check if user can create tasks
  static canCreateTasks(user: User | null): boolean {
    return user !== null && user.isActive;
  }

  // Check if user can edit specific task (ownership check)
  static canEditTask(user: User | null, taskUserId: string): boolean {
    if (!user || !user.isActive) return false;
    // Admin can edit any task, user can edit only their own
    return this.isAdmin(user) || user.id === taskUserId;
  }

  // Check if user can delete specific task (ownership check)
  static canDeleteTask(user: User | null, taskUserId: string): boolean {
    if (!user || !user.isActive) return false;
    // Admin can delete any task, user can delete only their own
    return this.isAdmin(user) || user.id === taskUserId;
  }

  // Check if user can view all tasks (admin only)
  static canViewAllTasks(user: User | null): boolean {
    return this.isAdmin(user);
  }

  // Check if user account is active
  static isAccountActive(user: User | null): boolean {
    return user !== null && user.isActive;
  }

  // Get user permissions object
  static getUserPermissions(user: User | null) {
    return {
      isAdmin: this.isAdmin(user),
      isUser: this.isUser(user),
      isActive: this.isAccountActive(user),
      canAccessAdmin: this.canAccessAdmin(user),
      canManageUsers: this.canManageUsers(user),
      canViewSystemStats: this.canViewSystemStats(user),
      canManageTasks: this.canManageTasks(user),
      canCreateTasks: this.canCreateTasks(user),
      canViewAllTasks: this.canViewAllTasks(user),
    };
  }
}

// Route protection utilities
export class RouteGuard {
  // Check if route requires authentication
  static requiresAuth(path: string): boolean {
    const publicPaths = ['/login', '/register', '/'];
    return !publicPaths.includes(path);
  }

  // Check if route requires admin role
  static requiresAdmin(path: string): boolean {
    const adminPaths = ['/admin', '/dashboard/admin'];
    return adminPaths.some(adminPath => path.startsWith(adminPath));
  }

  // Get redirect path based on user role and requested path
  static getRedirectPath(user: User | null, requestedPath: string): string | null {
    // If not authenticated and trying to access protected route
    if (!user && this.requiresAuth(requestedPath)) {
      return '/login';
    }

    // If account is inactive
    if (user && !user.isActive) {
      return '/account-suspended';
    }

    // If not admin but trying to access admin routes
    if (user && this.requiresAdmin(requestedPath) && !RolePermissions.isAdmin(user)) {
      return '/dashboard'; // Redirect to user dashboard
    }

    // If authenticated but trying to access login/register
    if (user && (requestedPath === '/login' || requestedPath === '/register')) {
      return RolePermissions.isAdmin(user) ? '/admin/dashboard' : '/dashboard';
    }

    return null; // No redirect needed
  }
}

// Navigation utilities
export class NavigationUtils {
  // Get default dashboard path for user
  static getDefaultDashboard(user: User | null): string {
    if (!user) return '/';
    return RolePermissions.isAdmin(user) ? '/admin/dashboard' : '/dashboard';
  }

  // Get navigation items based on user role
  static getNavigationItems(user: User | null) {
    if (!user) {
      return [
        { label: 'Home', href: '/', roles: [] },
        { label: 'Login', href: '/login', roles: [] },
        { label: 'Register', href: '/register', roles: [] },
      ];
    }

    const baseItems = [
      { label: 'Dashboard', href: this.getDefaultDashboard(user), roles: ['user', 'admin'] },
      { label: 'Tasks', href: '/tasks', roles: ['user', 'admin'] },
    ];

    const adminItems = [
      { label: 'Users', href: '/admin/users', roles: ['admin'] },
    ];

    const filteredItems = baseItems.filter(item => 
      item.roles.length === 0 || item.roles.includes(user.role)
    );

    if (RolePermissions.isAdmin(user)) {
      filteredItems.push(...adminItems);
    }

    return filteredItems;
  }
}
