import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminService } from '@/services';
import { UpdateUserRoleData, UpdateUserStatusData } from '@/types';

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRoleData }) =>
      AdminService.updateUserRole(id, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        // Invalidate and refetch related queries
        queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'user', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'statistics'] });
      }
    },
    onError: (error) => {
      console.error('Update user role error:', error);
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserStatusData }) =>
      AdminService.toggleUserStatus(id, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        // Invalidate and refetch related queries
        queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'user', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'statistics'] });
      }
    },
    onError: (error) => {
      console.error('Toggle user status error:', error);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => AdminService.deleteUser(id),
    onSuccess: (response, id) => {
      if (response.success) {
        // Invalidate and refetch related queries
        queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'statistics'] });

        // Remove specific user query from cache
        queryClient.removeQueries({ queryKey: ['admin', 'user', id] });
      }
    },
    onError: (error) => {
      console.error('Delete user error:', error);
    },
  });
};

