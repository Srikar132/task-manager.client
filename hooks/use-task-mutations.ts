import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskService } from '@/services';
import { CreateTaskData, UpdateTaskData } from '@/types';

// Create task mutation
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskData) => TaskService.createTask(data),
    onSuccess: (response) => {
      if (response.success) {
        // Invalidate and refetch tasks
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['tasks', 'statistics'] });
      }
    },
    onError: (error) => {
      console.error('Create task error:', error);
    },
  });
};

// Update task mutation
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskData }) =>
      TaskService.updateTask(id, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        // Invalidate and refetch related queries
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['tasks', 'statistics'] });
      }
    },
    onError: (error) => {
      console.error('Update task error:', error);
    },
  });
};

// Delete task mutation
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TaskService.deleteTask(id),
    onSuccess: (response, id) => {
      if (response.success) {
        // Invalidate and refetch tasks
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['tasks', 'statistics'] });
        
        // Remove the specific task query
        queryClient.removeQueries({ queryKey: ['task', id] });
      }
    },
    onError: (error) => {
      console.error('Delete task error:', error);
    },
  });
};

// Bulk update tasks mutation
export const useBulkUpdateTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskIds,
      updates,
    }: {
      taskIds: string[];
      updates: Partial<UpdateTaskData>;
    }) => TaskService.bulkUpdateTasks(taskIds, updates),
    onSuccess: () => {
      // Invalidate all task-related queries
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks', 'statistics'] });
    },
    onError: (error) => {
      console.error('Bulk update tasks error:', error);
    },
  });
};
