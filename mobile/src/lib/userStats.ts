import type { QueryClient } from '@tanstack/react-query';
import { apiService, type ReturnResult, type User } from '@/src/api/service';
import { queryKeys } from '@/src/lib/queryKeys';

type UserLike = Partial<User> | null | undefined;

/** Deep-merge profile patches (impact, weeklyGoal) without dropping nested fields. */
export function mergeUserProfile(base: UserLike, patch: UserLike): User | undefined {
  if (!patch) return base as User | undefined;
  if (!base) return patch as User;

  return {
    ...base,
    ...patch,
    impact: patch.impact
      ? { ...(base.impact ?? { plasticSaved: 0, co2Saved: 0, totalReturns: 0 }), ...patch.impact }
      : base.impact,
    weeklyGoal: patch.weeklyGoal
      ? { ...(base.weeklyGoal ?? { current: 0, target: 5, percent: 0 }), ...patch.weeklyGoal }
      : base.weeklyGoal,
  } as User;
}

/**
 * After a verified return: patch cache immediately, then refetch profile from server
 * so Home impact score is correct for every account.
 */
export async function syncAfterContainerReturn(
  queryClient: QueryClient,
  userId: string,
  result: ReturnResult,
  updateUser: (patch: Partial<User>) => void,
): Promise<User | undefined> {
  const statsKey = queryKeys.userStats(userId);

  if (result.user) {
    const merged = mergeUserProfile(
      queryClient.getQueryData<User>(statsKey),
      result.user,
    );
    if (merged) {
      updateUser(merged);
      queryClient.setQueryData(statsKey, merged);
    }
  }

  await Promise.all([
    queryClient.fetchQuery({
      queryKey: statsKey,
      queryFn: () => apiService.getProfile(),
    }),
    queryClient.refetchQueries({ queryKey: queryKeys.transactionHistory(userId) }),
    queryClient.refetchQueries({ queryKey: queryKeys.activeBorrows(userId) }),
  ]);

  const fresh = queryClient.getQueryData<User>(statsKey);
  if (fresh) {
    updateUser(fresh);
  }
  return fresh;
}
