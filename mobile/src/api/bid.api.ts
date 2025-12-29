/**
 * Bid API
 * All bid-related API calls
 */

import apiClient from './client';
import { API_CONFIG } from '../config/api.config';
import { Bid, BidStatus } from '../types/models.types';

// ============ Request Types ============

export interface SubmitBidData {
  request_id: string;
  bid_amount: number;
  proposal: string;
  estimated_completion_days?: number;
}

export interface UpdateBidData {
  bid_amount?: number;
  proposal?: string;
  estimated_completion_days?: number;
  status?: BidStatus;
}

export interface GetBidsParams {
  request_id?: string;
  contractor_id?: string;
  status?: BidStatus;
  page?: number;
  limit?: number;
}

export interface BidsResponse {
  bids: Bid[];
  total: number;
  page: number;
  limit: number;
}

export interface BidStatistics {
  total_bids: number;
  average_bid: number;
  lowest_bid: number;
  highest_bid: number;
  pending_count: number;
  accepted_count: number;
  rejected_count: number;
}

// ============ API Functions ============

/**
 * Get my bids (Contractor user)
 */
export const getMyBids = async (params?: GetBidsParams): Promise<BidsResponse> => {
  const response = await apiClient.get<BidsResponse>(
    API_CONFIG.ENDPOINTS.MY_BIDS,
    { params }
  );
  return response.data;
};

/**
 * Get bids for a request (Society user viewing bids on their request)
 */
export const getRequestBids = async (requestId: string): Promise<Bid[]> => {
  const response = await apiClient.get<Bid[]>(
    `${API_CONFIG.ENDPOINTS.REQUESTS}/${requestId}/bids`
  );
  return response.data;
};

/**
 * Get bid by ID
 */
export const getBidById = async (bidId: string): Promise<Bid> => {
  const response = await apiClient.get<Bid>(
    `${API_CONFIG.ENDPOINTS.BIDS}/${bidId}`
  );
  return response.data;
};

/**
 * Submit new bid (Contractor user)
 */
export const submitBid = async (data: SubmitBidData): Promise<Bid> => {
  const response = await apiClient.post<Bid>(
    API_CONFIG.ENDPOINTS.BIDS,
    data
  );
  return response.data;
};

/**
 * Update bid (Contractor user - only before acceptance)
 */
export const updateBid = async (
  bidId: string,
  data: UpdateBidData
): Promise<Bid> => {
  const response = await apiClient.put<Bid>(
    `${API_CONFIG.ENDPOINTS.BIDS}/${bidId}`,
    data
  );
  return response.data;
};

/**
 * Withdraw bid (Contractor user)
 */
export const withdrawBid = async (bidId: string): Promise<Bid> => {
  const response = await apiClient.post<Bid>(
    `${API_CONFIG.ENDPOINTS.BIDS}/${bidId}/withdraw`
  );
  return response.data;
};

/**
 * Accept bid (Society user)
 */
export const acceptBid = async (bidId: string): Promise<Bid> => {
  const response = await apiClient.post<Bid>(
    `${API_CONFIG.ENDPOINTS.BIDS}/${bidId}/accept`
  );
  return response.data;
};

/**
 * Reject bid (Society user)
 */
export const rejectBid = async (bidId: string, reason?: string): Promise<Bid> => {
  const response = await apiClient.post<Bid>(
    `${API_CONFIG.ENDPOINTS.BIDS}/${bidId}/reject`,
    { reason }
  );
  return response.data;
};

/**
 * Get bid statistics for a request
 */
export const getBidStatistics = async (requestId: string): Promise<BidStatistics> => {
  const response = await apiClient.get<BidStatistics>(
    `${API_CONFIG.ENDPOINTS.REQUESTS}/${requestId}/bid-statistics`
  );
  return response.data;
};

export const bidAPI = {
  getMyBids,
  getRequestBids,
  getBidById,
  submitBid,
  updateBid,
  withdrawBid,
  acceptBid,
  rejectBid,
  getBidStatistics,
};
