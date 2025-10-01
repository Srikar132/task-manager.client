'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Layout } from '@/components/layout';
import { useTask, useUpdateTask, useDeleteTask } from '@/hooks';
import { Task } from '@/types';
import { formatDate, cn } from '@/utils';

// Shadcn UI components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// Priority badge component
const PriorityBadge = ({ priority }: { priority: Task['priority'] }) => {
  const variants = {
    low: 'default',
    medium: 'secondary',
    high: 'destructive',
  } as const;

  return (
    <Badge variant={variants[priority]}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
};

// Status badge component
const StatusBadge = ({ status }: { status: Task['status'] }) => {
  const variants = {
    pending: 'outline',
    'in-progress': 'default',
    completed: 'secondary',
  } as const;

  const labels = {
    pending: 'Pending',
    'in-progress': 'In Progress',
    completed: 'Completed',
  };

  return (
    <Badge variant={variants[status]}>
      {labels[status]}
    </Badge>
  );
};

// Inline editable text component
const EditableText = ({ 
  value, 
  onSave, 
  placeholder = '',
  type = 'text',
  className = '',
  multiline = false 
}: {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'date';
  className?: string;
  multiline?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <Input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          placeholder={placeholder}
          className="flex-1"
          autoFocus
        />
        <Button size="sm" onClick={handleSave}>
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-colors',
        !value && 'text-gray-400 italic',
        className
      )}
      onDoubleClick={() => setIsEditing(true)}
      title="Double-click to edit"
    >
      {value || placeholder}
    </div>
  );
};

// Inline editable select component
const EditableSelect = ({
  value,
  onSave,
  options,
  className = ''
}: {
  value: string;
  onSave: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (newValue: string) => {
    onSave(newValue);
    setIsEditing(false);
  };

  const currentLabel = options.find(opt => opt.value === value)?.label || value;

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <Select value={value} onValueChange={handleSave}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-colors',
        className
      )}
      onDoubleClick={() => setIsEditing(true)}
      title="Double-click to edit"
    >
      {currentLabel}
    </div>
  );
};

const TaskView = () => {
  const router = useRouter();
  const params = useParams();
  const taskId = params?.id as string;
  const [isClient, setIsClient] = useState(false);

  const { data: task, isLoading, error } = useTask(taskId);
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleUpdateField = async (field: keyof Task, value: any) => {
    if (!task?.success || !task.data) return;

    try {
      await updateTaskMutation.mutateAsync({
        id: taskId,
        data: { ...task.data, [field]: value }
      });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error || !task?.success) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-red-600 text-lg font-medium mb-4">
            Error loading task: {(error as any)?.message || 'Task not found'}
          </div>
          <Button onClick={() => router.push('/tasks')}>
            Back to Tasks
          </Button>
        </div>
      </Layout>
    );
  }

  const taskData = task.data!;

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/tasks')}
            >
              ← Back to Tasks
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Task Details</h1>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="destructive"
              disabled={deleteTaskMutation.isPending}
              onClick={async () => {
                if (confirm('Are you sure you want to delete this task?')) {
                  try {
                    await deleteTaskMutation.mutateAsync(taskId);
                    router.push('/tasks');
                  } catch (error) {
                    console.error('Failed to delete task:', error);
                  }
                }
              }}
            >
              {deleteTaskMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

        {/* Task Details Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">
                  <EditableText
                    value={taskData.title}
                    onSave={(value) => handleUpdateField('title', value)}
                    placeholder="Enter task title..."
                    className="text-xl font-semibold"
                  />
                </CardTitle>
                <div className="text-gray-600">
                  <EditableText
                    value={taskData.description || ''}
                    onSave={(value) => handleUpdateField('description', value)}
                    placeholder="Add a description..."
                    multiline
                  />
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <EditableSelect
                  value={taskData.status}
                  onSave={(value) => handleUpdateField('status', value)}
                  options={statusOptions}
                />
                <EditableSelect
                  value={taskData.priority}
                  onSave={(value) => handleUpdateField('priority', value)}
                  options={priorityOptions}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Due Date */}
              <div className="space-y-2">
                <Label>Due Date</Label>
                <EditableText
                  value={taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : ''}
                  onSave={(value) => handleUpdateField('dueDate', value ? new Date(value).toISOString() : null)}
                  placeholder="Set due date..."
                  type="date"
                  className={cn(
                    taskData.dueDate && new Date(taskData.dueDate) < new Date() && taskData.status !== 'completed'
                      ? 'text-red-600 font-medium'
                      : ''
                  )}
                />
                {taskData.dueDate && new Date(taskData.dueDate) < new Date() && taskData.status !== 'completed' && (
                  <Badge variant="destructive" className="text-xs">
                    Overdue
                  </Badge>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={taskData.status} />
                  <span className="text-sm text-gray-500">(Double-click to change)</span>
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <div className="flex items-center space-x-2">
                  <PriorityBadge priority={taskData.priority} />
                  <span className="text-sm text-gray-500">(Double-click to change)</span>
                </div>
              </div>

              {/* Created Date */}
              <div className="space-y-2">
                <Label>Created</Label>
                <div className="text-sm text-gray-600">
                  {formatDate(taskData.createdAt)}
                </div>
              </div>

              {/* Updated Date */}
              <div className="space-y-2">
                <Label>Last Updated</Label>
                <div className="text-sm text-gray-600">
                  {formatDate(taskData.updatedAt)}
                </div>
              </div>

              {/* Assignment (if available) */}
             
            </div>

            {/* Update Status */}
            {updateTaskMutation.isPending && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="text-sm text-blue-700">Saving changes...</span>
                </div>
              </div>
            )}

            {updateTaskMutation.isError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="text-sm text-red-700">
                  Failed to save changes. Please try again.
                </div>
              </div>
            )}

            {updateTaskMutation.isSuccess && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="text-sm text-green-700">
                  Changes saved successfully!
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {taskData.status !== 'completed' && (
                <Button
                  variant="outline"
                  onClick={() => handleUpdateField('status', 'completed')}
                  disabled={updateTaskMutation.isPending}
                >
                  Mark as Completed
                </Button>
              )}
              {taskData.status === 'pending' && (
                <Button
                  variant="outline"
                  onClick={() => handleUpdateField('status', 'in-progress')}
                  disabled={updateTaskMutation.isPending}
                >
                  Start Task
                </Button>
              )}
              {taskData.status === 'completed' && (
                <Button
                  variant="outline"
                  onClick={() => handleUpdateField('status', 'in-progress')}
                  disabled={updateTaskMutation.isPending}
                >
                  Reopen Task
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => handleUpdateField('priority', taskData.priority === 'high' ? 'medium' : 'high')}
                disabled={updateTaskMutation.isPending}
              >
                {taskData.priority === 'high' ? 'Lower Priority' : 'Increase Priority'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">
              <p className="font-medium mb-2">💡 Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Double-click on any field to edit it inline</li>
                <li>Changes are saved automatically when you finish editing</li>
                <li>Use the Quick Actions for common task operations</li>
                <li>Press Escape to cancel editing</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

// Hydration-safe wrapper component
const TaskViewPage = () => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state during hydration
  if (!mounted) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Loading Task...</h1>
          </div>
        </div>
      </Layout>
    );
  }

  return <TaskView />;
};

export default TaskViewPage;
