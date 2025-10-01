import { ApiResponse } from './api';
import { User } from './auth';

export interface SystemStatistics {
  users: {
    totalUsers: number,
    activeUsers: number,
    admins: number
  },
  tasks: {
    totalTasks: number,
    completed: number,
    pending: number,
    inProgress: number
  }
}

export interface AdminUser extends User {
  tasksCount?: number;
  lastLogin?: Date;
}

export interface UpdateUserRoleData {
  role: 'user' | 'admin';
}

export interface UpdateUserStatusData {
  isActive: boolean;
}

export type UsersResponse = ApiResponse<User[]>