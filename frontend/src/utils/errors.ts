/**
 * Shared error types for consistent error handling across the app.
 */

export interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export function getErrorMessage(err: unknown, fallback = 'An unexpected error occurred'): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const apiErr = err as ApiError;
    return apiErr.response?.data?.error ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
