/**
 * Application configuration
 * Centralizes all environment variables and app settings
 */

export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
    timeout: 15000,
  },

  // App Information
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Task Manager',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },

  // Security
  security: {
    cookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || 'localhost',
    isProduction: process.env.NODE_ENV === 'production',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      httpOnly: false, // Need to be false for client-side access
    },
  },

  // Feature flags
  features: {
    enableDevtools: process.env.NODE_ENV === 'development',
    enableAnalytics: process.env.NODE_ENV === 'production',
  },
} as const;

// Validation function to ensure required environment variables are set
export const validateConfig = () => {
  const requiredEnvVars = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_APP_NAME',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
};

// Export individual configs for easier imports
export const { api, app, security, features } = config;

export default config;
