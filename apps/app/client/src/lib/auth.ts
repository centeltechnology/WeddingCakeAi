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