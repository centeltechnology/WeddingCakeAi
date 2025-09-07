import { useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";

interface BakerAuthWrapperProps {
  children: ReactNode;
  bakerId: string;
}

export function BakerAuthWrapper({ children, bakerId }: BakerAuthWrapperProps) {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = checking

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check authentication by trying to fetch baker data
        const response = await fetch(`/api/bakers/${bakerId}`);
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else if (response.status === 401) {
          // User not authenticated - redirect to login
          window.location.href = '/api/login';
          return;
        } else {
          // Other error - baker not found, etc.
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // On network error, try to redirect to login
        window.location.href = '/api/login';
      }
    };

    checkAuth();
  }, [bakerId]);

  // Still checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or error - redirect handled above
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this baker dashboard.
          </p>
          <button 
            onClick={() => setLocation('/')}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Authenticated - render protected content
  return <>{children}</>;
}