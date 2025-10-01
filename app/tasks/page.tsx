
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/layout';
import { useTasks } from '@/hooks';
import { Task, TasksQueryParams } from '@/types';
import { formatDate, cn } from '@/utils';

// Shadcn UI components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/ui/pagination';

// Loading skeleton component
const TableSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
      </TableRow>
    ))}
  </>
);

// Priority badge component
const PriorityBadge = ({ priority }: { priority: Task['priority'] }) => {
  const variants = {
    low: 'default',
    medium: 'secondary',
    high: 'destructive',
  } as const;

  return (
    <Badge variant={variants[priority]}>
      {priority?.charAt(0)?.toUpperCase() + priority?.slice(1)}
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

// Due date cell component to avoid hydration issues
const DueDateCell = ({ task }: { task: Task }) => {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!task.dueDate) {
    return <span className="text-gray-400">No due date</span>;
  }

  if (!isClient) {
    // Server-side render: just show the formatted date
    return <span>{formatDate(task.dueDate)}</span>;
  }

  // Client-side render: can safely use Date comparisons
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div className={cn(
      isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'
    )}>
      {formatDate(task.dueDate)}
      {isOverdue && (
        <span className="block text-xs text-red-500">Overdue</span>
      )}
    </div>
  );
};

const Tasks = () => {
  const [queryParams, setQueryParams] = useState<TasksQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [isClient, setIsClient] = React.useState(false);

  const { data, isLoading, error } = useTasks(queryParams);


  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Get the latest 3 tasks for highlighting (only on client side to prevent hydration issues)
  const getLatestTaskIds = React.useCallback((tasks: Task[]): string[] => {
    if (!isClient) return [];
    return tasks
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 3)
      .map(task => task._id);
  }, [isClient]);

  const latestTaskIds = React.useMemo(() => {
    return data?.success && isClient ? getLatestTaskIds(data.data || []) : [];
  }, [data?.success, data?.data, getLatestTaskIds, isClient]);

  const handlePageChange = (page: number) => {
    setQueryParams(prev => ({ ...prev, page }));
  };

  const handleStatusFilter = (status: Task['status'] | 'all') => {
    setQueryParams(prev => ({ 
      ...prev, 
      status: status === 'all' ? undefined : status,
      page: 1 
    }));
  };

  const handlePriorityFilter = (priority: Task['priority'] | 'all') => {
    setQueryParams(prev => ({ 
      ...prev, 
      priority: priority === 'all' ? undefined : priority,
      page: 1 
    }));
  };

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-red-600 text-lg font-medium">
            Error loading tasks: {(error as any)?.message || 'Unknown error'}
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600">
              {data?.success && data.meta && (
                `Showing ${data.data?.length || 0} of ${data.meta.total || 0} tasks`
              )}
            </p>
          </div>
          <Link href="/tasks/new">
            <Button>Create Task</Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  value={queryParams.status || 'all'}
                  onValueChange={(value) => handleStatusFilter(value as any)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority-filter">Priority</Label>
                <Select
                  value={queryParams.priority || 'all'}
                  onValueChange={(value) => handlePriorityFilter(value as any)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                      <TableSkeleton />
                  </TableRow>
                ) : data?.success && data.data && data.data.length > 0 ? (
                  data.data.map((task) => {
                    const isLatest = latestTaskIds.includes(task._id);
                    return (
                      <TableRow
                        key={task._id}
                        className={cn(
                          isLatest && 'bg-blue-50 border-l-4 border-l-blue-500'
                        )}
                      >
                        <TableCell>
                          <div className="flex items-center">
                            <div>
                              <div className={cn(
                                'text-sm font-medium',
                                isLatest ? 'text-blue-900' : 'text-gray-900'
                              )}>
                                {task.title}
                                {isLatest && (
                                  <Badge variant="secondary" className="ml-2">
                                    Latest
                                  </Badge>
                                )}
                              </div>
                              {task.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {task.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={task.status} />
                        </TableCell>
                        <TableCell>
                          <PriorityBadge priority={task.priority} />
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">
                          <DueDateCell task={task} />
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(task.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link href={`/tasks/${task._id}`}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center">
                      <div className="text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
                        <div className="mt-6">
                          <Link href="/tasks/new">
                            <Button>Create Task</Button>
                          </Link>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data?.success && data?.meta && (
            <Pagination 
              meta={{
                page: data.meta.page ?? 1,
                totalPages: data.meta.totalPages ?? 1,
                total: data.meta.total ?? 0,
                limit: data.meta.limit ?? 10,
              }}
              onPageChange={handlePageChange}
              itemName="tasks"
            />
          )}
        </Card>
      </div>
    </Layout>
  );
};

// Simple client-side auth check wrapper component
const TasksPage = () => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything on the server to prevent hydration issues
  if (!mounted) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return <Tasks />;
};

export default TasksPage;