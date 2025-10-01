import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { ApiError } from '@/types';
import { api, security } from '@/lib/config';

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: api.baseUrl,
  timeout: api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Queue to store failed requests during token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If token expired and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = Cookies.get('refreshToken');
      
      if (!refreshToken) {
        processQueue(new Error('No refresh token'), null);
        isRefreshing = false;
        
        // Clear auth and redirect
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        
        if (typeof window !== 'undefined') {
          // Dispatch custom event for app-wide logout
          window.dispatchEvent(new CustomEvent('auth:logout'));
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${api.baseUrl}/auth/refresh-token`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        
        // Update stored tokens
        Cookies.set('accessToken', accessToken, { 
          expires: 1, // 1 day
          ...security.cookieOptions
        });
        
        // Update refresh token if backend sends new one
        if (newRefreshToken) {
          Cookies.set('refreshToken', newRefreshToken, { 
            expires: 7, // 7 days
            ...security.cookieOptions
          });
        }
        
        // Dispatch custom event for token refresh
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:token-refreshed'));
        }
        
        // Process queued requests
        processQueue(null, accessToken);
        
        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        return apiClient(originalRequest);

      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        processQueue(refreshError, null);
        
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        
        if (typeof window !== 'undefined') {
          // Dispatch custom event for app-wide logout
          window.dispatchEvent(new CustomEvent('auth:logout'));
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Transform error response to our ApiError interface
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An error occurred',
      statusCode: error.response?.status || 500,
      errors: error.response?.data?.errors,
    };

    return Promise.reject(apiError);
  }
);

// Generic API request function
export const apiRequest = async <T = any>(
  config: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await apiClient(config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default apiClient;