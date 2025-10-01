import { apiRequest } from '@/lib/api-client';
import {
  LoginCredentials,
  RegisterCredentials,
  ChangePasswordData,
  User,
  AuthResponse,
  ApiResponse,
  RefreshTokenResponse
} from '@/types';
import Cookies from 'js-cookie';

export class AuthService {
  // Login user
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiRequest<AuthResponse>({
      method: 'POST',
      url: '/auth/login',
      data: credentials,
    });

    // Store tokens in cookies
    if (response.success && response.data) {
      Cookies.set('accessToken', response.data.tokens.accessToken, { expires: 1 }); // 1 day
      Cookies.set('refreshToken', response.data.tokens.refreshToken, { expires: 7 }); // 7 days
    }

    return response;
  }

  // Register user
  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {

    const response = await apiRequest<AuthResponse>({
      method: 'POST',
      url: '/auth/register',
      data: credentials,
    });

    // Store tokens in cookies
    if (response.success && response.data) {
      Cookies.set('accessToken', response.data.tokens.accessToken, { expires: 1 });
      Cookies.set('refreshToken', response.data.tokens.refreshToken, { expires: 7 });
    }

    return response;
  }

  // Get current user profile
  static async getProfile(): Promise<ApiResponse<{user : User}>> {
    return apiRequest<ApiResponse<{
      user : User
    }>>({
      method: 'GET',
      url: '/auth/profile',
    });
  }

  // Change password
  static async changePassword(data: ChangePasswordData): Promise<ApiResponse<null>> {
    return apiRequest<ApiResponse<null>>({
      method: 'PATCH',
      url: '/auth/change-password',
      data,
    });
  }

  // Refresh access token
  static async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = Cookies.get('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiRequest<RefreshTokenResponse>({
      method: 'POST',
      url: '/auth/refresh-token',
      data: { refreshToken },
    });

    // Update access token
    if (response.success && response.data) {
      Cookies.set('accessToken', response.data.tokens.accessToken, { expires: 1 });
      // set upcoming new refresh token
      Cookies.set('refreshToken', response.data.tokens.refreshToken, { expires: 7 });
    }

    return response;
  }

  // Logout user
  static async logout(): Promise<ApiResponse<null>> {
    try {
      const response = await apiRequest<ApiResponse<null>>({
        method: 'POST',
        url: '/auth/logout',
      });

      // Clear tokens regardless of response
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');

      return response;
    } catch (error) {
      // Clear tokens even if logout request fails
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      throw error;
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!Cookies.get('accessToken');
  }

  // Get stored access token
  static getAccessToken(): string | undefined {
    return Cookies.get('accessToken');
  }

  // Get stored refresh token
  static getRefreshToken(): string | undefined {
    return Cookies.get('refreshToken');
  }

  // Clear all auth data
  static clearAuth(): void {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
  }
}
