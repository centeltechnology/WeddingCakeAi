import { useQuery } from "@tanstack/react-query";

interface User {
  userId: string;
  email: string;
  role: string;
}

export function useMe() {
  const { data, isLoading, error } = useQuery<{ ok: boolean } & User>({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await fetch("/api/app/me", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      return response.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    loading: isLoading,
    error: error as Error | null,
    me: data ? {
      userId: data.userId,
      email: data.email,
      role: data.role,
    } : null,
  };
}
