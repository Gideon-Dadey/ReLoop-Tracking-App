import { useEffect, useRef, useCallback } from 'react';
import { useSyncStore } from '../store/useSyncStore';
import { apiClient } from '../api/client';
import { useQueryClient } from '@tanstack/react-query';

const SYNC_INTERVAL_MS = 5_000;

export const useSyncEngine = () => {
  const { queue, removeFromQueue } = useSyncStore();
  const queryClient = useQueryClient();

  const queueRef = useRef(queue);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  const processSync = useCallback(async () => {
    const currentQueue = queueRef.current;
    if (currentQueue.length === 0 || isSyncingRef.current) return;

    isSyncingRef.current = true;
    try {
      const sanitizedEvents = currentQueue.map(({ id, ...rest }) => rest);
      const { data } = await apiClient.post('/sync/bulk', { events: sanitizedEvents });

      data.results.forEach((res: { success: boolean; serialNumber: string }) => {
        if (res.success) {
          const item = currentQueue.find((q) => q.serialNumber === res.serialNumber);
          if (item) removeFromQueue(item.id);
        }
      });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-history'] });
      queryClient.invalidateQueries({ queryKey: ['active-borrows'] });
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      isSyncingRef.current = false;
    }
  }, [removeFromQueue, queryClient]);

  useEffect(() => {
    const timer = setInterval(processSync, SYNC_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [processSync]);

  return {
    isSyncing: isSyncingRef.current,
    queueCount: queue.length,
    processSync,
  };
};
