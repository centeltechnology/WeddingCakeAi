import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

interface SlugResolutionResult {
  slug: string | null;
  isLoading: boolean;
  isError: boolean;
  source: 'prop' | 'query' | 'baker' | 'session' | null;
}

export function useCalculatorSlug(options: {
  tenantSlugProp?: string;
  bakerId?: string;
}): SlugResolutionResult {
  const { tenantSlugProp, bakerId } = options;
  
  const [queryParamSlug, setQueryParamSlug] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tenant = params.get('tenant');
      setQueryParamSlug(tenant);
    }
  }, []);
  
  const propOrQuerySlug = tenantSlugProp || queryParamSlug;
  
  const { data: baker, isLoading: bakerLoading, isError: bakerError } = useQuery({
    queryKey: ['/api/bakers', bakerId],
    queryFn: async () => {
      const res = await fetch(`/api/bakers/${bakerId}`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !propOrQuerySlug && !!bakerId,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
  
  const { data: sessionBaker, isLoading: sessionLoading } = useQuery({
    queryKey: ['/api/bakers/me'],
    queryFn: async () => {
      const res = await fetch('/api/bakers/me', { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !propOrQuerySlug && !bakerId,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  
  return useMemo<SlugResolutionResult>(() => {
    if (tenantSlugProp) {
      return {
        slug: tenantSlugProp,
        isLoading: false,
        isError: false,
        source: 'prop'
      };
    }
    
    if (queryParamSlug) {
      return {
        slug: queryParamSlug,
        isLoading: false,
        isError: false,
        source: 'query'
      };
    }
    
    if (bakerId) {
      if (bakerLoading) {
        return { slug: null, isLoading: true, isError: false, source: null };
      }
      if (baker && (baker as any)?.slug) {
        return {
          slug: (baker as any).slug,
          isLoading: false,
          isError: false,
          source: 'baker'
        };
      }
      if (bakerError) {
        return { slug: null, isLoading: false, isError: true, source: null };
      }
    }
    
    if (!bakerId) {
      if (sessionLoading) {
        return { slug: null, isLoading: true, isError: false, source: null };
      }
      if (sessionBaker && (sessionBaker as any)?.slug) {
        return {
          slug: (sessionBaker as any).slug,
          isLoading: false,
          isError: false,
          source: 'session'
        };
      }
    }
    
    return {
      slug: null,
      isLoading: false,
      isError: false,
      source: null
    };
  }, [tenantSlugProp, queryParamSlug, bakerId, bakerLoading, baker, bakerError, sessionLoading, sessionBaker]);
}
