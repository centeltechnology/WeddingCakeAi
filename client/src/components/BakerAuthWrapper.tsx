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
        console.log("Checking authentication for baker:", bakerId);
        
        // Check for baker token in localStorage
        const token = localStorage.getItem("baker_token");
        console.log("Token found:", !!token);
        
        if (!token) {
          console.log("No token found, setting not authenticated");
          setIsAuthenticated(false);
          return;
        }

        // Verify token by checking if it contains the expected baker ID
        try {
          const decodedToken = atob(token);
          console.log("Decoded token:", decodedToken);
          
          if (decodedToken.includes(`baker:${bakerId}:`)) {
            // Token is valid for this baker
            console.log("Token is valid, setting authenticated");
            setIsAuthenticated(true);
          } else {
            // Token is for a different baker or invalid
            console.log("Token invalid for this baker, removing and redirecting");
            localStorage.removeItem("baker_token");
            setIsAuthenticated(false);
          }
        } catch (decodeError) {
          // Token is malformed
          console.log("Token decode error:", decodeError);
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