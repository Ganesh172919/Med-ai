/**
 * =============================================================================
 * ProtectedRoute Component
 * =============================================================================
 *
 * PURPOSE:
 * Guards routes that require authentication. Redirects unauthenticated users
 * to login and non-admin users away from admin pages.
 *
 * WHY THIS EXISTS:
 * Without route protection, users could access protected pages by typing
 * the URL directly. This component ensures only authenticated users (and
 * optionally admins) can access certain pages.
 *
 * USAGE:
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 *
 *   <ProtectedRoute requireAdmin>
 *     <AdminDashboard />
 *   </ProtectedRoute>
 *
 * PATTERN: Higher-Order Component (HOC) via composition
 * Instead of wrapping components, we wrap routes. This is the React Router
 * recommended pattern for route-level protection.
 *
 * SECURITY NOTES:
 * - This is CLIENT-SIDE protection only (UX convenience)
 * - Server-side auth middleware is the real security layer
 * - API endpoints verify JWT tokens independently
 * - Never rely solely on client-side route protection
 *
 * LEARNING NOTES:
 * - <Navigate> is React Router's declarative redirect
 * - "replace" prevents the protected URL from appearing in history
 * - Zustand store provides auth state without Context boilerplate
 * =============================================================================
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Props for ProtectedRoute.
 *
 * @property children - The component(s) to render if authorized
 * @property requireAdmin - If true, only admin users can access (default: false)
 */
interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * Route guard that requires authentication (and optionally admin role).
 *
 * AUTHORIZATION FLOW:
 * 1. Check if user is authenticated (has valid session)
 * 2. If not → redirect to /login
 * 3. If requireAdmin → check user.isAdmin flag
 * 4. If not admin → redirect to /dashboard
 * 5. Otherwise → render children
 *
 * WHY REDIRECT TO /dashboard (NOT /login) FOR NON-ADMINS:
 * Non-admin users ARE authenticated, they just don't have permission.
 * Redirecting to login would be confusing. Dashboard is the safe default.
 *
 * @param children - Protected content
 * @param requireAdmin - Admin-only access flag
 */
export default function ProtectedRoute({ children, requireAdmin = false }: Props) {
  // Get auth state from Zustand store
  // WHY ZUSTAND: No Provider wrapper needed, works outside React
  const { isAuthenticated, user } = useAuthStore();

  // Guard 1: Authentication check
  // If not authenticated, redirect to login page
  // "replace" removes /login from history after redirect
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Guard 2: Authorization check (admin only)
  // If route requires admin and user is not admin, redirect to dashboard
  if (requireAdmin && !user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // All checks passed, render the protected content
  // Fragment wrapper ensures single child for React Router
  return <>{children}</>;
}
