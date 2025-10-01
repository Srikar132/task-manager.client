
'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/layout';
import { useUsers } from '@/hooks/use-admin-queries';
import { useAuthStore } from '@/store';
import { User } from '@/types';
import { formatDate, cn } from '@/utils';

// Shadcn UI components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { useDeleteUser, useToggleUserStatus, useUpdateUserRole } from '@/hooks/use-admin-mutations';

interface UsersQueryParams {
  page: number;
  limit: number;
  role?: 'user' | 'admin';
  isActive?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'username' | 'email';
  sortOrder?: 'asc' | 'desc';
}

// Loading skeleton component
const TableSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
      </TableRow>
    ))}
  </>
);



// Status badge component
const StatusBadge = ({ isActive }: { isActive: boolean }) => {
  return (
    <Badge variant={isActive ? 'default' : 'outline'}>
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );
};

// Date cell component to avoid hydration issues
const DateCell = ({ date, label }: { date?: Date | string; label?: string }) => {
  const [_isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!date) {
    return <span className="text-gray-400">{label || 'No date'}</span>;
  }

  if (!_isClient) {
    return <span>{formatDate(date)}</span>;
  }

  return (
    <div className="text-gray-900">
      {formatDate(date)}
    </div>
  );
};

const UsersManagement = () => {
  const [queryParams, setQueryParams] = useState<UsersQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [_isClient, setIsClient] = React.useState(false);
  
  const { user: currentUser } = useAuthStore();
  const { data, isLoading, error } = useUsers();
  const toggleUserStatusMutation = useToggleUserStatus();
  const deleteUserMutation = useDeleteUser();
  const updateUserRoleMutation = useUpdateUserRole();

  // Handle successful mutations
  React.useEffect(() => {
    if (toggleUserStatusMutation.isSuccess) {
      // You can add a toast notification here
      console.log('User status updated successfully');
    }
  }, [toggleUserStatusMutation.isSuccess]);

  React.useEffect(() => {
    if (deleteUserMutation.isSuccess) {
      // You can add a toast notification here
      console.log('User deleted successfully');
    }
  }, [deleteUserMutation.isSuccess]);

  React.useEffect(() => {
    if (updateUserRoleMutation.isSuccess) {
      // You can add a toast notification here
      console.log('User role updated successfully');
    }
  }, [updateUserRoleMutation.isSuccess]);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Mock pagination meta based on actual data structure
  const mockMeta = {
    page: 1,
    totalPages: 1,
    total: data?.success ? (data.data?.length || 0) : 0,
    limit: 10,
  };

  const handlePageChange = (page: number) => {
    setQueryParams(prev => ({ ...prev, page }));
  };

  const handleRoleFilter = (role: User['role'] | 'all') => {
    setQueryParams(prev => ({ 
      ...prev, 
      role: role === 'all' ? undefined : role,
      page: 1 
    }));
  };

  const handleStatusFilter = (status: 'active' | 'inactive' | 'all') => {
    setQueryParams(prev => ({ 
      ...prev, 
      isActive: status === 'all' ? undefined : status === 'active',
      page: 1 
    }));
  };

  const handleSearchChange = (search: string) => {
    setQueryParams(prev => ({ 
      ...prev, 
      search: search || undefined,
      page: 1 
    }));
  };

  // Filter users based on query params (client-side filtering)
  const filteredUsers = React.useMemo(() => {
    if (!data?.success || !data.data) return [];
    
    let filtered = [...data.data];

    // Apply role filter
    if (queryParams.role) {
      filtered = filtered.filter(user => user.role === queryParams.role);
    }

    // Apply status filter
    if (queryParams.isActive !== undefined) {
      filtered = filtered.filter(user => user.isActive === queryParams.isActive);
    }

    // Apply search filter
    if (queryParams.search) {
      const searchLower = queryParams.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[queryParams.sortBy || 'createdAt'];
      const bValue = b[queryParams.sortBy || 'createdAt'];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }
      
      return queryParams.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [data, queryParams]);

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-red-600 text-lg font-medium">
            Error loading users: {(error as any)?.message || 'Unknown error'}
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
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">
              {data?.success && (
                `Showing ${filteredUsers.length} of ${data.data?.length || 0} users`
              )}
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Users</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by username or email..."
                  className="w-[250px]"
                  value={queryParams.search || ''}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-filter">Role</Label>
                <Select
                  value={queryParams.role || 'all'}
                  onValueChange={(value) => handleRoleFilter(value as any)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  value={queryParams.isActive === undefined ? 'all' : queryParams.isActive ? 'active' : 'inactive'}
                  onValueChange={(value) => handleStatusFilter(value as any)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort-filter">Sort By</Label>
                <Select
                  value={queryParams.sortBy || 'createdAt'}
                  onValueChange={(value) => setQueryParams(prev => ({ ...prev, sortBy: value as any }))}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date Created</SelectItem>
                    <SelectItem value="username">Username</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton />
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const isCurrentUser = currentUser?.id === user.id;
                    const isToggling = toggleUserStatusMutation.isPending && toggleUserStatusMutation.variables?.id === user.id;
                    const isDeleting = deleteUserMutation.isPending && deleteUserMutation.variables === user.id;
                    const isUpdatingRole = updateUserRoleMutation.isPending && updateUserRoleMutation.variables?.id === user.id;
                    const isUserBeingModified = isToggling || isDeleting || isUpdatingRole;
                    
                    return (
                      <TableRow 
                        key={user.email}
                        className={cn(
                          isUserBeingModified && 'opacity-50 pointer-events-none',
                          'transition-opacity duration-200'
                        )}
                      >
                        <TableCell>
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.username}
                                {isCurrentUser && (
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    You
                                  </Badge>
                                )}
                                {isUserBeingModified && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    {isToggling ? 'Updating Status...' : isDeleting ? 'Deleting...' : 'Updating Role...'}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          disabled={isUserBeingModified || updateUserRoleMutation.isPending || isCurrentUser}
                          onValueChange={async (newRole: 'user' | 'admin') => {
                            if (newRole !== user.role && !isCurrentUser) {
                              if (isCurrentUser) {
                                alert('You cannot change your own role.');
                                return;
                              }
                              try {
                                await updateUserRoleMutation.mutateAsync({
                                  // @ts-ignore
                                  id: user._id,
                                  data: { role: newRole }
                                });
                              } catch (error) {
                                console.error('Failed to update user role:', error);
                                alert('Failed to update user role. Please try again.');
                              }
                            }
                          }}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <StatusBadge isActive={user.isActive} />
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        <DateCell date={user.createdAt} />
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={isUserBeingModified || isCurrentUser}
                            onClick={async () => {
                              if (isCurrentUser) {
                                alert('You cannot deactivate your own account.');
                                return;
                              }
                              try {
                                await toggleUserStatusMutation.mutateAsync({
                                  // @ts-ignore
                                  id: user?._id,
                                  data: { isActive: !user.isActive }
                                });
                              } catch (error) {
                                console.error('Failed to toggle user status:', error);
                                alert('Failed to update user status. Please try again.');
                              }
                            }}
                          >
                            {isToggling ? 'Loading...' : user.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={isUserBeingModified || isCurrentUser}
                            onClick={async () => {
                              if (isCurrentUser) {
                                alert('You cannot delete your own account.');
                                return;
                              }
                              if (window.confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
                                try {
                                  // @ts-ignore
                                  await deleteUserMutation.mutateAsync(user._id);
                                } catch (error) {
                                  console.error('Failed to delete user:', error);
                                  alert('Failed to delete user. Please try again.');
                                }
                              }
                            }}
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </Button>
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
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {queryParams.search || queryParams.role || queryParams.isActive !== undefined
                            ? 'Try adjusting your search criteria.'
                            : 'No users have been created yet.'
                          }
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <Pagination 
            meta={mockMeta}
            onPageChange={handlePageChange}
            itemName="users"
          />
        </Card>
      </div>
    </Layout>
  );
};

// Simple client-side auth check wrapper component
const AdminUsersPage = () => {
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
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return <UsersManagement />;
};

export default AdminUsersPage;
