'use client';

import React from 'react';
import { Layout } from '@/components/layout';
import { useAuthStore } from '@/store';
import { useSystemStatistics } from '@/hooks/use-admin-queries';

function AdminPage() {
  const { user } = useAuthStore();
  
  const {
    data: systemStatistics,
    isLoading,
    error
  } = useSystemStatistics();

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Loading system statistics...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-red-600">Error loading system statistics</p>
          </div>
        </div>
      </Layout>
    );
  }

  const stats = systemStatistics?.data;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage users, view system statistics, and oversee all tasks.
          </p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Total Users
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {stats?.users?.totalUsers || 0}
            </p>
            <p className="text-sm text-gray-500">
              {stats?.users?.activeUsers || 0} active users
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Total Tasks
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {stats?.tasks?.totalTasks || 0}
            </p>
            <p className="text-sm text-gray-500">All tasks in system</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Completed Tasks
            </h3>
            <p className="text-3xl font-bold text-emerald-600">
              {stats?.tasks?.completed || 0}
            </p>
            <p className="text-sm text-gray-500">Successfully completed</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Admin Users
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {stats?.users?.admins || 0}
            </p>
            <p className="text-sm text-gray-500">System administrators</p>
          </div>
        </div>

        {/* Task Status Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Task Status Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {stats?.tasks?.pending || 0}
              </p>
              <p className="text-sm text-yellow-700">Pending Tasks</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {stats?.tasks?.inProgress || 0}
              </p>
              <p className="text-sm text-blue-700">In Progress</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {stats?.tasks?.completed || 0}
              </p>
              <p className="text-sm text-green-700">Completed</p>
            </div>
          </div>
        </div>

        {/* User Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            User Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Total Users</span>
                <span className="text-lg font-bold text-blue-600">
                  {stats?.users?.totalUsers || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Active Users</span>
                <span className="text-lg font-bold text-green-600">
                  {stats?.users?.activeUsers || 0}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Administrators</span>
                <span className="text-lg font-bold text-purple-600">
                  {stats?.users?.admins || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Regular Users</span>
                <span className="text-lg font-bold text-gray-600">
                  {(stats?.users?.totalUsers || 0) - (stats?.users?.admins || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Admin Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
              <h4 className="font-medium text-gray-900">Manage Users</h4>
              <p className="text-sm text-gray-600">View, edit, and manage user accounts</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
              <h4 className="font-medium text-gray-900">System Statistics</h4>
              <p className="text-sm text-gray-600">View detailed system analytics</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
              <h4 className="font-medium text-gray-900">User Roles</h4>
              <p className="text-sm text-gray-600">Manage user permissions and roles</p>
            </button>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            System Health
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database Connection</span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">User Sessions</span>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {stats?.users?.activeUsers || 0} Active
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Task Processing</span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Normal
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Load</span>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Moderate
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-xs text-gray-500">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Statistics Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Quick Statistics Summary
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {stats?.tasks?.totalTasks || 0}
                </p>
                <p className="text-xs text-gray-500">Total Tasks</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {stats?.users?.totalUsers || 0}
                </p>
                <p className="text-xs text-gray-500">Total Users</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-green-600">
                  {stats?.tasks?.completed ? Math.round((stats.tasks.completed / (stats.tasks.totalTasks || 1)) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-500">Completion Rate</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-blue-600">
                  {stats?.users?.activeUsers ? Math.round((stats.users.activeUsers / (stats.users.totalUsers || 1)) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-500">Active Users</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default AdminPage;