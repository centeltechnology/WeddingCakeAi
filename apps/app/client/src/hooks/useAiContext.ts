import { useQuery } from '@tanstack/react-query';

export function useRecentQuote() {
  return useQuery({
    queryKey: ['recent-quote'],
    queryFn: async () => {
      const r = await fetch('/api/quotes?limit=1&sort=-updatedAt');
      if (!r.ok) return null;
      const j = await r.json();
      return Array.isArray(j) && j[0] ? j[0] : null;
    },
    staleTime: 30_000
  });
}

export function useAiFlags() {
  return { 
    aiOn: import.meta.env.VITE_AI_ENABLED === 'true', 
    demo: import.meta.env.VITE_DEMO_MODE === 'true' 
  };
}
