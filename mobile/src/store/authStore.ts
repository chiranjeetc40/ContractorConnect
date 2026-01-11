/**
 * Authentication Store
 * Manages authentication state using Zustand
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types/models.types';
import { APP_CONFIG } from '../config/app.config';

// ============ Store State Interface ============

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => Promise<void>;
  setAuth: (user: User, token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  initialize: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

// ============ Store Implementation ============

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  
  // Set user only
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },
  
  // Set token only
  setToken: async (token) => {
    if (token) {
      await SecureStore.setItemAsync(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      await SecureStore.deleteItemAsync(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    }
    set({ token, isAuthenticated: !!(token && get().user) });
  },
  
  // Set both user and token (after login/register)
  setAuth: async (user, token) => {
    try {
      console.log('💾 [AuthStore] Setting auth:', {
        userId: user.id,
        userName: user.full_name,
        userRole: user.role,
        roleType: typeof user.role,
        userObject: user,
        token: token.substring(0, 20) + '...',
      });
      
      // Save to secure storage
      await SecureStore.setItemAsync(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
      await SecureStore.setItemAsync(
        APP_CONFIG.STORAGE_KEYS.USER_DATA,
        JSON.stringify(user)
      );
      
      console.log('✅ [AuthStore] Auth saved successfully');
      console.log('✅ [AuthStore] User role stored as:', user.role);
      
      // Update state
      set({
        user,
        token,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('❌ [AuthStore] Error saving auth data:', error);
      throw error;
    }
  },
  
  // Clear all auth data (logout)
  clearAuth: async () => {
    try {
      // Clear secure storage
      await SecureStore.deleteItemAsync(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      await SecureStore.deleteItemAsync(APP_CONFIG.STORAGE_KEYS.USER_DATA);
      
      // Clear state
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  },
  
  // Initialize auth state from storage (on app start)
  initialize: async () => {
    try {
      console.log('🔄 [AuthStore] Initializing auth...');
      set({ isInitializing: true });
      
      // Load from secure storage
      const token = await SecureStore.getItemAsync(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      const userJson = await SecureStore.getItemAsync(APP_CONFIG.STORAGE_KEYS.USER_DATA);
      
      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        console.log('✅ [AuthStore] Restored user:', {
          userId: user.id,
          userName: user.full_name,
          userRole: user.role,
          roleType: typeof user.role,
        });
        set({
          user,
          token,
          isAuthenticated: true,
        });
      } else {
        console.log('⚠️ [AuthStore] No stored auth found');
      }
    } catch (error) {
      console.error('❌ [AuthStore] Error initializing auth:', error);
      // Clear potentially corrupted data
      await get().clearAuth();
    } finally {
      set({ isInitializing: false });
      console.log('✅ [AuthStore] Initialization complete');
    }
  },
  
  // Update user data
  updateUser: async (user) => {
    try {
      await SecureStore.setItemAsync(
        APP_CONFIG.STORAGE_KEYS.USER_DATA,
        JSON.stringify(user)
      );
      set({ user });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },
}));

// ============ Selectors (for better performance) ============

export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectUserRole = (state: AuthState) => state.user?.role;
