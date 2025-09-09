// CSRF token utility for client-side requests
let csrfToken: string | null = null;
let tokenExpiry: number = 0;

export async function getCSRFToken(): Promise<string> {
  // Return cached token if still valid (expires in 20 minutes, refresh after 15 minutes)
  if (csrfToken && Date.now() < tokenExpiry) {
    return csrfToken;
  }

  try {
    const response = await fetch('/api/csrf-token');
    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }
    
    const data = await response.json();
    csrfToken = data.csrfToken;
    tokenExpiry = Date.now() + (15 * 60 * 1000); // Refresh after 15 minutes
    
    return csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
}

// Helper function to make authenticated requests with CSRF token
export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  const token = await getCSRFToken();
  
  const headers = {
    'Content-Type': 'application/json',
    'X-CSRF-Token': token,
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}