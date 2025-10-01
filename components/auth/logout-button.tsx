'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
  redirectTo?: string;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  className = "px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900",
  children = "Logout",
  redirectTo = '/login'
}) => {
  const { logout } = useAuthStore();
  const router = useRouter();

  const [isPending, setIsPending] = React.useState(false);

  const handleLogout = async () => {
    try {
      setIsPending(true);
      await logout()
      setIsPending(false);

      router.push(redirectTo);
    } catch (error) {
      // Error handling is done in the mutation
      console.error('Logout failed:', error);
      setIsPending(false);
      // Redirect anyway in case of error
      router.push(redirectTo);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className={className}
    >
      {isPending ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          Logging out...
        </div>
      ) : (
        children
      )}
    </button>
  );
};
