import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface SuperAdminAuthWrapperProps {
  children: React.ReactNode;
}

export function SuperAdminAuthWrapper({ children }: SuperAdminAuthWrapperProps) {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = checking

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("super_admin_token");
      
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        // Verify token by making a request to a protected endpoint
        const response = await fetch("/api/super-admin/stats", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Token is invalid
          localStorage.removeItem("super_admin_token");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("super_admin_token");
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Still checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    setLocation("/super-admin-login");
    return null;
  }

  // Authenticated - render protected content
  return <>{children}</>;
}