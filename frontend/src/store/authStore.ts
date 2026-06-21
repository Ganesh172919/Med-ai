/**
 * =============================================================================
 * Auth Store (Zustand)
 * =============================================================================
 *
 * PURPOSE:
 * Manages authentication state across the entire application.
 * Stores user data, access token, and authentication status.
 *
 * WHY ZUSTAND OVER CONTEXT:
 * - No Provider wrapper needed (simpler App.tsx)
 * - Works outside React (Socket.IO handlers, Axios interceptors)
 * - Smaller bundle size
 * - Built-in persistence middleware
 * - Simpler API (no reducers, actions, dispatch)
 *
 * PERSISTENCE:
 * Uses Zustand's persist middleware to save state to localStorage.
 * This means users stay logged in across page refreshes.
 *
 * SECURITY NOTE:
 * Access token is stored in localStorage (not httpOnly cookie) because
 * the frontend needs to read it for Authorization headers. The refresh
 * token is in an httpOnly cookie (more secure).
 *
 * STATE SHAPE:
 * {
 *   user: { id, username, email, avatar, isAdmin, ... },
 *   accessToken: "eyJhbGci...",
 *   isAuthenticated: true
 * }
 *
 * USAGE:
 *   const { user, isAuthenticated, login, logout } = useAuthStore();
 * =============================================================================
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../api/auth';

export type User = AuthUser;

/**
 * Auth state interface.
 *
 * WHY EXPLICIT INTERFACE:
 * TypeScript interfaces make the state shape self-documenting.
 * IDE autocomplete works for all state properties and actions.
 */
interface AuthState {
  /** Current user object (null if not logged in) */
  user: User | null;
  /** JWT access token for API requests */
  accessToken: string | null;
  /** Convenience flag: true when user is logged in */
  isAuthenticated: boolean;
  /** Set user and token after successful login */
  login: (user: User, accessToken: string) => void;
  /** Clear all auth state (used for logout) */
  logout: () => void;
  /** Update user data (e.g., after profile edit) */
  setUser: (user: User) => void;
  /** Update access token (used after token refresh) */
  updateTokens: (accessToken: string) => void;
}

/**
 * Auth store with persistence.
 *
 * PATTERN: Zustand create + persist
 * - create(): Creates the store with initial state and actions
 * - persist(): Middleware that saves/loads from localStorage
 *
 * WHY partialize:
 * We only persist specific fields, not the entire state.
 * This prevents storing unnecessary data and keeps the
 * localStorage entry clean.
 *
 * PERSISTENCE KEY: 'auth-storage'
 * This is the localStorage key where state is saved.
 * Change this to invalidate all stored sessions.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state: not authenticated
      user: null,
      accessToken: null,
      isAuthenticated: false,

      /**
       * Login action: Store user data and token.
       *
       * WHEN CALLED:
       * - After successful POST /api/auth/login
       * - After successful Google OAuth callback
       * - After successful registration
       */
      login: (user, accessToken) => {
        set({ user, accessToken, isAuthenticated: true });
      },

      /**
       * Logout action: Clear all auth state.
       *
       * WHEN CALLED:
       * - User clicks logout button
       * - Token refresh fails
       * - Session expires
       *
       * SIDE EFFECTS:
       * - Clears localStorage entry
       * - Components using isAuthenticated will re-render
       * - ProtectedRoute will redirect to /login
       */
      logout: () => {
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      /**
       * Update user data without affecting token.
       *
       * WHEN CALLED:
       * - After profile update (name, avatar, bio)
       * - After settings change
       */
      setUser: (user) => set({ user }),

      /**
       * Update access token (for token refresh).
       *
       * WHEN CALLED:
       * - After successful token refresh
       * - Token rotation: new access token from refresh endpoint
       */
      updateTokens: (accessToken) => {
        set({ accessToken });
      },
    }),
    {
      // localStorage key
      name: 'auth-storage',

      /**
       * Only persist these fields (not actions).
       *
       * WHY PARTIALIZE:
       * Actions are functions, not serializable data.
       * We only need to persist the data, not the methods.
       */
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
