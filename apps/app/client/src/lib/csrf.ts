import { tokenManager } from './auth';

// Helper function to make authenticated requests (CSRF removed for better UX)
export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  // Get baker token from centralized token manager
  const token = tokenManager.getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}