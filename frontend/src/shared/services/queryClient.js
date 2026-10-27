import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes before considering data stale
      gcTime: 1000 * 60 * 30, // 30 minutes cache retention
      retry: 1, // Retry failed network requests once
      refetchOnWindowFocus: false, // Avoid excessive refetching on window switch
    },
    mutations: {
      retry: 0,
    },
  },
});

export default queryClient;

