'use client';

import React from 'react';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth';
import { useAuthStore } from '@/store';
import { NavigationUtils } from '@/utils';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const defaultDashboard = NavigationUtils.getDefaultDashboard(user);
      router.push(defaultDashboard);
    }
  }, [isAuthenticated, user, router]);

  if (isAuthenticated && user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to existing account
            </Link>
          </p>
        </div>
        
        <RegisterForm 
          
        />
        
        <div className="text-center text-sm text-gray-600">
          <Link
            href="/"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
