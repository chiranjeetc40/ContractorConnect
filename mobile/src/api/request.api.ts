/**
 * Request API
 * All work request-related API calls
 */

import apiClient from './client';
import { API_CONFIG } from '../config/api.config';
import { Request, RequestStatus } from '../types/models.types';

// ============ Request Types ============

export interface CreateRequestData {
  title: string;
  description: string;
  category: string; // Should be lowercase: 'plumbing', 'electrical', etc.
  location?: string; // Optional detailed address
  city: string; // Required
  state: string; // Required
  pincode?: string; // Optional
  budget_min?: number;
  budget_max?: number;
  estimated_duration_days?: number;
  required_skills?: string;
  preferred_start_date?: string;
  images?: string; // Comma-separated image URLs
}

export interface UpdateRequestData {
  title?: string;
  description?: string;
  category?: string;
  location?: string;
  city?: string;
  state?: string;
  pincode?: string;
  budget_min?: number;
  budget_max?: number;
  estimated_duration_days?: number;
  required_skills?: string;
  preferred_start_date?: string;
  images?: string;
  status?: RequestStatus;
}

export interface GetRequestsParams {
  status?: RequestStatus;
  category?: string;
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface RequestsResponse {
  requests: Request[];
  total: number;
  page: number;
  limit: number;
}

// ============ API Functions ============

/**
 * Get my requests (Society user)
 */
export const getMyRequests = async (params?: GetRequestsParams): Promise<RequestsResponse> => {
  console.log('📡 [API] getMyRequests called with params:', params);
  console.log('📡 [API] Fetching from:', API_CONFIG.ENDPOINTS.MY_REQUESTS);
  
  const response = await apiClient.get<RequestsResponse>(
    API_CONFIG.ENDPOINTS.MY_REQUESTS,
    { params }
  );
  
  console.log('✅ [API] getMyRequests response:', response.data);
  return response.data;
};

/**
 * Get browse requests (Contractor user - all OPEN requests)
 * Uses the main /requests endpoint filtered by OPEN status
 */
export const getBrowseRequests = async (params?: GetRequestsParams): Promise<RequestsResponse> => {
  console.log('📡 [API] getBrowseRequests called with params:', params);
  
  // Use main /requests endpoint with status filter for OPEN
  const requestParams = {
    ...params,
    status: RequestStatus.OPEN, // Only show OPEN requests to contractors
  };
  
  console.log('📡 [API] Fetching from:', API_CONFIG.ENDPOINTS.REQUESTS, 'with params:', requestParams);
  
  const response = await apiClient.get<RequestsResponse>(
    API_CONFIG.ENDPOINTS.REQUESTS,
    { params: requestParams }
  );
  
  console.log('✅ [API] getBrowseRequests response:', response.data);
  return response.data;
};

/**
 * Get request by ID with bids
 */
export const getRequestById = async (requestId: string): Promise<Request> => {
  const response = await apiClient.get<Request>(
    `${API_CONFIG.ENDPOINTS.REQUESTS}/${requestId}`
  );
  return response.data;
};

/**
 * Create new request (Society user)
 */
export const createRequest = async (data: CreateRequestData): Promise<Request> => {
  console.log('📡 [API] createRequest called with data:', data);
  console.log('📡 [API] Posting to:', API_CONFIG.ENDPOINTS.REQUESTS);
  
  const response = await apiClient.post<Request>(
    API_CONFIG.ENDPOINTS.REQUESTS,
    data
  );
  
  console.log('✅ [API] createRequest response:', response.data);
  return response.data;
};

/**
 * Update request (Society user)
 */
export const updateRequest = async (
  requestId: string,
  data: UpdateRequestData
): Promise<Request> => {
  const response = await apiClient.put<Request>(
    `${API_CONFIG.ENDPOINTS.REQUESTS}/${requestId}`,
    data
  );
  return response.data;
};

/**
 * Cancel request (Society user)
 */
export const cancelRequest = async (requestId: string): Promise<Request> => {
  const response = await apiClient.post<Request>(
    `${API_CONFIG.ENDPOINTS.REQUESTS}/${requestId}/cancel`
  );
  return response.data;
};

/**
 * Delete request (Society user)
 */
export const deleteRequest = async (requestId: string): Promise<void> => {
  await apiClient.delete(`${API_CONFIG.ENDPOINTS.REQUESTS}/${requestId}`);
};

/**
 * Upload images for request
 */
export const uploadRequestImages = async (
  requestId: string,
  images: File[] | string[]
): Promise<string[]> => {
  const formData = new FormData();
  
  images.forEach((image, index) => {
    if (typeof image === 'string') {
      // Base64 or URL
      formData.append(`images[${index}]`, image);
    } else {
      // File object
      formData.append('images', image);
    }
  });

  const response = await apiClient.post<{ urls: string[] }>(
    `${API_CONFIG.ENDPOINTS.REQUESTS}/${requestId}/images`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  return response.data.urls;
};

export const requestAPI = {
  getMyRequests,
  getBrowseRequests,
  getRequestById,
  createRequest,
  updateRequest,
  cancelRequest,
  deleteRequest,
  uploadRequestImages,
};
