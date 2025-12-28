/**
 * Axios API Client
 * Centralized HTTP client with interceptors for auth and error handling
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG, getBaseURL } from '../config/api.config';
import { APP_CONFIG } from '../config/app.config';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ============ Request Interceptor ============
// Add auth token to every request
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Get token from secure storage
      const token = await SecureStore.getItemAsync(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log request in development
      if (__DEV__) {
        console.log('🚀 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
        });
      }
      
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },
  (error: AxiosError) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// ============ Response Interceptor ============
// Handle responses and errors globally
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (__DEV__) {
      console.log('✅ API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    
    return response;
  },
  async (error: AxiosError) => {
    // Log error in development
    if (__DEV__) {
      console.error('❌ API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    
    // Handle specific error cases
    if (error.response) {
      const { status } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          console.log('🔒 Unauthorized - clearing auth data');
          await SecureStore.deleteItemAsync(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
          await SecureStore.deleteItemAsync(APP_CONFIG.STORAGE_KEYS.USER_DATA);
          // TODO: Navigate to login screen
          // You can emit an event or use a navigation ref here
          break;
          
        case 403:
          // Forbidden - user doesn't have permission
          console.log('🚫 Forbidden - insufficient permissions');
          break;
          
        case 404:
          // Not found
          console.log('🔍 Resource not found');
          break;
          
        case 422:
          // Validation error
          console.log('⚠️ Validation error');
          break;
          
        case 500:
          // Server error
          console.log('💥 Server error');
          break;
          
        default:
          console.log(`Error ${status}`);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('📡 Network error - no response received');
    } else {
      // Something else happened
      console.error('⚠️ Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ============ Helper Functions ============

/**
 * Extract error message from API error response
 */
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    
    // Handle array of errors (FastAPI validation errors)
    if (Array.isArray(detail)) {
      return detail.map((err: any) => err.msg).join(', ');
    }
    
    // Handle string error
    if (typeof detail === 'string') {
      return detail;
    }
  }
  
  // Default error messages
  if (error.response?.status === 401) {
    return 'Unauthorized. Please login again.';
  }
  
  if (error.response?.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error.response?.status === 404) {
    return 'Resource not found.';
  }
  
  if (error.response?.status === 422) {
    return 'Invalid data provided. Please check your input.';
  }
  
  if (error.response?.status >= 500) {
    return 'Server error. Please try again later.';
  }
  
  if (!error.response) {
    return 'Network error. Please check your internet connection.';
  }
  
  return 'An unexpected error occurred.';
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: any): boolean => {
  return !error.response && error.request;
};

/**
 * Check if error is unauthorized (401)
 */
export const isUnauthorizedError = (error: any): boolean => {
  return error.response?.status === 401;
};

export default apiClient;
