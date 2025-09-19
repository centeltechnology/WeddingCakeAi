// Helper function to make authenticated requests (CSRF removed for better UX)
export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  // Get baker token from localStorage
  const token = localStorage.getItem('baker_token');
  
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