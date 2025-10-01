import { apiRequest } from '@/lib/api-client';
import {
  SystemStatistics,
  AdminUser,
  UsersResponse,
  UpdateUserRoleData,
  UpdateUserStatusData,
  ApiResponse
} from '@/types';

export class AdminService {
  // Get system statistics
  static async getSystemStatistics(): Promise<ApiResponse<SystemStatistics>> {
    const result = await apiRequest<ApiResponse<SystemStatistics>>({
      method: 'GET',
      url: '/admin/statistics',
    });

    console.log(result);
    
    return result;
  }

  // Get all users
  static async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: 'user' | 'admin';
    isActive?: boolean;
  }): Promise<UsersResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/admin/users?${queryString}` : '/admin/users';

    return apiRequest<UsersResponse>({
      method: 'GET',
      url,
    });
  }

  // Get user by ID
  static async getUserById(id: string): Promise<ApiResponse<AdminUser>> {
    return apiRequest<ApiResponse<AdminUser>>({
      method: 'GET',
      url: `/admin/users/${id}`,
    });
  }

  // Update user role
  static async updateUserRole(
    id: string,
    data: UpdateUserRoleData
  ): Promise<ApiResponse<AdminUser>> {
    return apiRequest<ApiResponse<AdminUser>>({
      method: 'PATCH',
      url: `/admin/users/${id}/role`,
      data,
    });
  }

  // Toggle user status (active/inactive)
  static async toggleUserStatus(
    id: string,
    data: UpdateUserStatusData
  ): Promise<ApiResponse<AdminUser>> {
    return apiRequest<ApiResponse<AdminUser>>({
      method: 'PATCH',
      url: `/admin/users/${id}/status`,
      data,
    });
  }

  // Delete user
  static async deleteUser(id: string): Promise<ApiResponse<string>> {
    return apiRequest<ApiResponse<string>>({
      method: 'DELETE',
      url: `/admin/users/${id}`,
    });
  }

}
