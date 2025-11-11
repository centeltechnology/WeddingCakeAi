import React, { useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { tokenManager } from "@/lib/auth";
import { makeAuthenticatedRequest } from "@/lib/csrf";

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
        // Check for baker token using centralized token manager
        const token = tokenManager.getToken();
        
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        // Verify token by calling /api/bakers/me with proper Authorization header
        const response = await makeAuthenticatedRequest("/api/bakers/me");

        if (response.ok) {
          const baker = await response.json();
          
          // Check if the authenticated baker matches the expected bakerId
          if (baker.id === bakerId) {
            setIsAuthenticated(true);
          } else {
            // Token is valid but for a different baker
            tokenManager.clearToken();
            setIsAuthenticated(false);
          }
        } else {
          // Token is invalid or expired
          tokenManager.clearToken();
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        tokenManager.clearToken();
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