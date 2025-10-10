import { useQuery } from '@tanstack/react-query';

export function useTenant() {
  return useQuery({
    queryKey: ['tenant-min'],
    queryFn: async () => {
      const response = await fetch('/api/me/tenant');
      if (!response.ok) {
        throw new Error('Failed to fetch tenant info');
      }
      return response.json();
    },
  });
}
