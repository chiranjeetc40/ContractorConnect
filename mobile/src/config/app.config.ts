/**
 * App Configuration
 * General app settings and constants
 */

export const APP_CONFIG = {
  // App Information
  APP_NAME: 'ContractorConnect',
  APP_VERSION: '1.0.0',
  
  // Features
  ENABLE_PUSH_NOTIFICATIONS: false, // Will implement post-MVP
  ENABLE_OFFLINE_MODE: false, // Will implement post-MVP
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  
  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: '@auth_token',
    REFRESH_TOKEN: '@refresh_token',
    USER_DATA: '@user_data',
    THEME_MODE: '@theme_mode',
    LANGUAGE: '@language',
  },
  
  // Validation
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 50,
  OTP_LENGTH: 6,
  OTP_RESEND_TIME: 60, // seconds
  MIN_BID_PROPOSAL_LENGTH: 50,
  MAX_BID_PROPOSAL_LENGTH: 1000,
  MIN_REQUEST_DESCRIPTION_LENGTH: 50,
  
  // Categories
  REQUEST_CATEGORIES: [
    'Plumbing',
    'Electrical',
    'Carpentry',
    'Painting',
    'Cleaning',
    'Renovation',
    'Landscaping',
    'Other',
  ],
  
  // Status Colors (matching backend)
  STATUS_COLORS: {
    OPEN: '#4CAF50',
    IN_PROGRESS: '#2196F3',
    COMPLETED: '#9C27B0',
    CANCELLED: '#F44336',
    ON_HOLD: '#FF9800',
  },
  
  BID_STATUS_COLORS: {
    PENDING: '#FF9800',
    ACCEPTED: '#4CAF50',
    REJECTED: '#F44336',
    WITHDRAWN: '#9E9E9E',
  },
  
  // User Roles
  USER_ROLES: {
    SOCIETY: 'Society',
    CONTRACTOR: 'Contractor',
    ADMIN: 'Admin',
  },
};
