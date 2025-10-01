import { useQuery } from '@tanstack/react-query';
import { AdminService } from '@/services';

export const useSystemStatistics = () => {
  return useQuery({
    queryKey: ['admin', 'statistics'],
    queryFn: () => AdminService.getSystemStatistics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUsers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'user' | 'admin';
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => AdminService.getAllUsers(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUser = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => AdminService.getUserById(id),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

