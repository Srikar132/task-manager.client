import { useQuery } from '@tanstack/react-query';
import { TaskService } from '@/services';
import { TasksQueryParams } from '@/types';

// Get tasks query
export const useTasks = (params?: TasksQueryParams) => {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => TaskService.getTasks(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get task by ID query
export const useTask = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => TaskService.getTaskById(id),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get task statistics query
export const useTaskStatistics = () => {
  return useQuery({
    queryKey: ['tasks', 'statistics'],
    queryFn: () => TaskService.getTaskStatistics(),
    staleTime: 1000, // 5 minutes
  });
};
