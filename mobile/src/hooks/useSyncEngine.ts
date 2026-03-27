import { useEffect, useState } from 'react';
import { useSyncStore } from '../store/useSyncStore';
import { apiClient } from '../api/client';
import { useQueryClient } from '@tanstack/react-query';

export const useSyncEngine = () => {
  const { queue, removeFromQueue, clearQueue } = useSyncStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  const processSync = async () => {
    if (queue.length === 0 || isSyncing) return;

    setIsSyncing(true);
    try {
      const sanitizedEvents = queue.map(({ id, ...rest }) => rest);
      const { data } = await apiClient.post('/sync/bulk', { events: sanitizedEvents });
      
      data.results.forEach((res: any) => {
        if (res.success) {
          // Find and remove from queue
          const item = queue.find(q => q.serialNumber === res.serialNumber);
          if (item) removeFromQueue(item.id);
        }
      });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Simple interval-based sync for demo, in real app use NetInfo
  useEffect(() => {
    const timer = setInterval(() => {
      processSync();
    }, 10000); // Try every 10 seconds

    return () => clearInterval(timer);
  }, [queue, isSyncing]);

  return { isSyncing, queueCount: queue.length, processSync };
};
