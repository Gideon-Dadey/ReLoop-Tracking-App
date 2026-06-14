import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 2,
      staleTime: 0,
    },
  },
});

export function clearSessionQueries() {
  queryClient.clear();
}

export { queryKeys } from './queryKeys';
