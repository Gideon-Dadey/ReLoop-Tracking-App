/** Per-user React Query keys — keeps cache isolated per account. */
export const queryKeys = {
  userStats: (userId: string) => ['user-stats', userId] as const,
  transactionHistory: (userId: string) => ['transaction-history', userId] as const,
  activeBorrows: (userId: string) => ['active-borrows', userId] as const,
  coachRecommendations: (userId: string) => ['coach-recommendations', userId] as const,
};
