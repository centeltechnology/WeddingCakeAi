import React, { useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface BakerSlugWrapperProps {
  children: ReactNode;
  slug: string;
}

export function BakerSlugWrapper({ children, slug }: BakerSlugWrapperProps) {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Fetch baker data by slug to get the baker ID
  const { data: baker, isLoading } = useQuery({
    queryKey: [`/baker/${slug}/info`],
    retry: false,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("baker_token");
        
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        // For now, if there's a token, we assume they're authenticated
        // In a production app, you'd verify the token with the backend
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("baker_token");
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [slug]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isAuthenticated === false) {
      setLocation("/baker-login");
    }
  }, [isAuthenticated, setLocation]);

  // Still checking authentication or loading baker data
  if (isAuthenticated === null || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect
  }

  // Baker not found
  if (!baker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Baker Not Found</h1>
          <p className="text-gray-600 mb-4">The baker profile you're looking for doesn't exist.</p>
          <button 
            onClick={() => setLocation("/")}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Pass the baker ID to children
  return React.cloneElement(children as React.ReactElement, { 
    bakerId: (baker as any).id,
    bakerData: baker 
  });
}