import { ApiResponse } from "./api";

export interface User {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  role: 'user' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword : string
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface Tokens {
  accessToken : string;
  refreshToken : string;
}

export type AuthResponse =  ApiResponse<{
  user : User;
  tokens : Tokens
}>

export type RefreshTokenResponse = ApiResponse<{
  tokens : Tokens
}>