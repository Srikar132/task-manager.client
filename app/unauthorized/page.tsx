'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store';

export default function UnauthorizedPage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-9xl font-bold text-gray-300">403</h1>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this resource.
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <p className="text-sm text-gray-500">
            {user?.role === 'user' 
              ? "This page is restricted to administrators only."
              : "Please contact your administrator for access."
            }
          </p>
          
          <div className="flex flex-col space-y-2">
            <Link
              href={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Dashboard
            </Link>
            
            <Link
              href="/tasks"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View Tasks
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
