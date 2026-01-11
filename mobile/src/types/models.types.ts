/**
 * TypeScript Type Definitions
 * Data models matching backend API
 */

// ============ User Types ============

export enum UserRole {
  SOCIETY = 'society',
  CONTRACTOR = 'contractor',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email?: string;
  phone_number: string;
  full_name: string;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// ============ Request Types ============

export enum RequestStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
}

export interface Request {
  id: string;
  society_id: string;
  assigned_contractor_id?: string;
  title: string;
  description: string;
  category: string;
  location?: string; // Optional detailed address
  city: string;
  state: string;
  pincode?: string;
  budget_min?: number;
  budget_max?: number;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  // Nested relationships
  society?: User;
  assigned_contractor?: User;
  bids_count?: number;
}

// ============ Bid Types ============

export enum BidStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

export interface Bid {
  id: string;
  request_id: string;
  contractor_id: string;
  amount: number;
  proposal: string;
  status: BidStatus;
  created_at: string;
  updated_at: string;
  // Nested relationships
  contractor?: User;
  request?: Request;
}

export interface BidStatistics {
  total_bids: number;
  pending_bids: number;
  accepted_bids: number;
  rejected_bids: number;
  average_amount?: number;
  min_amount?: number;
  max_amount?: number;
}

// ============ Pagination ============

export interface PaginationMeta {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// ============ API Response Types ============

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
  requires_verification?: boolean;
}

export interface ErrorResponse {
  detail: string | { msg: string; type: string }[];
}
