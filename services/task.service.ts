import { apiRequest } from '@/lib/api-client';
import {
  Task,
  CreateTaskData,
  UpdateTaskData,
  TasksResponse,
  TasksQueryParams,
  TaskStatistics,
  ApiResponse
} from '@/types';

export class TaskService {
  // Get all tasks with pagination and filtering
  static async getTasks(params?: TasksQueryParams): Promise<TasksResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/tasks?${queryString}` : '/tasks';

    return apiRequest<TasksResponse>({
      method: 'GET',
      url,
    });
  }

  // Get task by ID
  static async getTaskById(id: string): Promise<ApiResponse<Task>> {
    return apiRequest<ApiResponse<Task>>({
      method: 'GET',
      url: `/tasks/${id}`,
    });
  }

  // Create new task
  static async createTask(data: CreateTaskData): Promise<ApiResponse<Task>> {
    return apiRequest<ApiResponse<Task>>({
      method: 'POST',
      url: '/tasks',
      data,
    });
  }

  // Update task
  static async updateTask(id: string, data: UpdateTaskData): Promise<ApiResponse<Task>> {
    return apiRequest<ApiResponse<Task>>({
      method: 'PATCH',
      url: `/tasks/${id}`,
      data,
    });
  }

  // Delete task
  static async deleteTask(id: string): Promise<ApiResponse<string>> {
    return apiRequest<ApiResponse<string>>({
      method: 'DELETE',
      url: `/tasks/${id}`,
    });
  }

  // Get task statistics
  static async getTaskStatistics(): Promise<ApiResponse<TaskStatistics>> {
    return apiRequest<ApiResponse<TaskStatistics>>({
      method: 'GET',
      url: '/tasks/statistics',
    });
  }

  // Bulk update tasks (if supported by backend)
  static async bulkUpdateTasks(
    taskIds: string[],
    updates: Partial<UpdateTaskData>
  ): Promise<ApiResponse<Task[]>> {
    return apiRequest<ApiResponse<Task[]>>({
      method: 'PATCH',
      url: '/tasks/bulk-update',
      data: { taskIds, updates },
    });
  }

  // Search tasks
  static async searchTasks(query: string): Promise<TasksResponse> {
    return this.getTasks({ search: query });
  }

  // Get overdue tasks
  static async getOverdueTasks(): Promise<TasksResponse> {
    return apiRequest<TasksResponse>({
      method: 'GET',
      url: '/tasks/overdue',
    });
  }
}
