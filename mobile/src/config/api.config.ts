/**
 * API Configuration
 * Central configuration for API endpoints and settings
 */

// Change this to your backend URL
// For local development with Expo Go on physical device: http://YOUR_COMPUTER_IP:8000
// For Android emulator: http://10.0.2.2:8000
// For iOS simulator: http://localhost:8000
// For production: https://your-backend-url.com
export const API_CONFIG = {
  // Base URL for API requests
  // Using 192.168.1.107 - your computer's IP on local network
  BASE_URL: __DEV__ 
    ? 'http://192.168.1.103:8000/api/v1'  // Your computer's local IP for Expo Go
    : 'https://your-production-api.com/api/v1',
  
  // Alternative base URLs for different platforms (not used in current setup)
  IOS_BASE_URL: 'http://192.168.1.107:8000/api/v1',
  WEB_BASE_URL: 'http://192.168.1.107:8000/api/v1',
  
  // Request timeout (in milliseconds)
  TIMEOUT: 30000,
  
  // API endpoints
  ENDPOINTS: {
    // Auth
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    
    // Users
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    DELETE_ACCOUNT: '/users/profile',
    
    // Requests
    REQUESTS: '/requests',
    MY_REQUESTS: '/requests/my-requests',
    BROWSE_REQUESTS: '/requests/browse', // Contractor view - only OPEN requests
    ASSIGNED_REQUESTS: '/requests/assigned-to-me',
    SEARCH_REQUESTS: '/requests/search',
    REQUEST_BY_ID: (id: string) => `/requests/${id}`,
    CANCEL_REQUEST: (id: string) => `/requests/${id}/cancel`,
    UPLOAD_REQUEST_IMAGES: (id: string) => `/requests/${id}/images`,
    
    // Bids
    BIDS: '/bids',
    MY_BIDS: '/bids/my-bids',
    BIDS_FOR_REQUEST: (requestId: string) => `/bids/request/${requestId}`,
    BID_BY_ID: (id: string) => `/bids/${id}`,
    ACCEPT_BID: (id: string) => `/bids/${id}/accept`,
    REJECT_BID: (id: string) => `/bids/${id}/reject`,
    WITHDRAW_BID: (id: string) => `/bids/${id}/withdraw`,
    BID_STATISTICS: (requestId: string) => `/bids/request/${requestId}/statistics`,
  },
};

// Helper to get the correct base URL based on platform
export const getBaseURL = (): string => {
  if (__DEV__) {
    // In development, you might want to customize this based on platform
    // You can use Platform.OS to detect the platform
    return API_CONFIG.BASE_URL;
  }
  return API_CONFIG.BASE_URL;
};

// Log the API configuration on app start
console.log('🔧 [API Config] Base URL:', API_CONFIG.BASE_URL);
console.log('🔧 [API Config] Timeout:', API_CONFIG.TIMEOUT, 'ms');
