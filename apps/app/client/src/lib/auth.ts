// Centralized token management for baker authentication
const BAKER_TOKEN_KEY = 'baker_token';

export const tokenManager = {
  // Get the current baker token
  getToken(): string | null {
    return localStorage.getItem(BAKER_TOKEN_KEY);
  },

  // Set the baker token
  setToken(token: string): void {
    localStorage.setItem(BAKER_TOKEN_KEY, token);
  },

  // Clear the baker token
  clearToken(): void {
    localStorage.removeItem(BAKER_TOKEN_KEY);
    // Also clear legacy token keys for compatibility
    localStorage.removeItem('bakerToken');
    localStorage.removeItem('authToken');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
};

// Logout path configuration
export const LOGOUT_PATH = '/api/auth/logout';

// Unified logout function (works for both cookie and token auth)
export async function logout() {
  // Try server logout (for cookie sessions)
  try {
    await fetch(LOGOUT_PATH, { method: 'POST', credentials: 'include' });
  } catch (e) {
    console.error('Logout request failed:', e);
  }
  
  // Client-side cleanup (for JWT/localStorage)
  try {
    tokenManager.clearToken();
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  } catch (e) {
    console.error('Local storage cleanup failed:', e);
  }
  
  // Redirect to login
  window.location.href = '/login';
}