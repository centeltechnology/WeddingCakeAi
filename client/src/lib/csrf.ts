// Helper function to make authenticated requests (CSRF removed for better UX)
export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}