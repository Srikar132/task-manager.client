'use client';

import { useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Create a client outside component to avoid recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-right" />
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Auth Provider - Handles authentication initialization
function AuthProvider({ children }: ProvidersProps) {
  const router = useRouter();
  const { checkAuth , clearAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handleLogout = () => {
      clearAuth();
      router.push('/login');
    };

    const handleTokenRefresh = () => {
      checkAuth();
    };

    window.addEventListener('auth:logout', handleLogout);
    window.addEventListener('auth:token-refreshed', handleTokenRefresh);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
      window.removeEventListener('auth:token-refreshed', handleTokenRefresh);
    };
  }, [clearAuth, router, checkAuth]);


  return <>{children}</>;
}