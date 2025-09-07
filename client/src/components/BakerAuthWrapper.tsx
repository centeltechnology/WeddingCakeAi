import React, { useState, useEffect, ReactNode } from "react";
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
        // Check for baker token in localStorage
        const token = localStorage.getItem("baker_token");
        
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        // Verify token by checking if it contains the expected baker ID
        try {
          const decodedToken = atob(token);
          
          if (decodedToken.includes(`baker:${bakerId}:`)) {
            // Token is valid for this baker
            setIsAuthenticated(true);
          } else {
            // Token is for a different baker or invalid
            localStorage.removeItem("baker_token");
            setIsAuthenticated(false);
          }
        } catch (decodeError) {
          // Token is malformed
          localStorage.removeItem("baker_token");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("baker_token");
        setIsAuthenticated(false);
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

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    setLocation("/baker-login");
    return null;
  }

  // Authenticated - render protected content
  return <>{children}</>;
}