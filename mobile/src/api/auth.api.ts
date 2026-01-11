/**
 * Authentication API
 * All authentication-related API calls
 */

import apiClient from './client';
import { API_CONFIG } from '../config/api.config';
import { User, AuthResponse, UserRole } from '../types/models.types';

// ============ Request Types ============

export interface RegisterRequest {
  phone_number: string;
  name: string;
  email?: string;
  role: UserRole;
  password?: string;  // Optional password for future login
  // Optional fields
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  description?: string;
}

export interface LoginRequest {
  phone_number: string;
  password: string;
}

export interface VerifyOTPRequest {
  phone_number: string;
  otp_code: string;  // Backend expects 'otp_code', not 'otp'
}

export interface ResendOTPRequest {
  phone_number: string;
}

// ============ API Functions ============

/**
 * Register a new user
 */
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    API_CONFIG.ENDPOINTS.REGISTER,
    data
  );
  return response.data;
};

/**
 * Request OTP for login (OTP-based login)
 */
export const requestLoginOTP = async (phone_number: string): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    API_CONFIG.ENDPOINTS.LOGIN,
    { phone_number }
  );
  return response.data;
};

/**
 * Login with phone and password (password-based login)
 */
export const loginWithPassword = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    '/auth/login-password',
    data
  );
  return response.data;
};

/**
 * Verify OTP
 */
export const verifyOTP = async (data: VerifyOTPRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    API_CONFIG.ENDPOINTS.VERIFY_OTP,
    data
  );
  return response.data;
};

/**
 * Resend OTP
 */
export const resendOTP = async (data: ResendOTPRequest): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(
    API_CONFIG.ENDPOINTS.RESEND_OTP,
    data
  );
  return response.data;
};

/**
 * Logout (optional - mainly client-side token clearing)
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post(API_CONFIG.ENDPOINTS.LOGOUT);
  } catch (error) {
    // Ignore errors on logout
    console.log('Logout error (non-critical):', error);
  }
};

export const authAPI = {
  register,
  requestLoginOTP,
  loginWithPassword,
  verifyOTP,
  resendOTP,
  logout,
};
