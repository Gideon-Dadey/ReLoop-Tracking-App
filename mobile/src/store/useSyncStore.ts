import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const syncStorage = {
  setItem: async (name: string, value: string) => {
    await AsyncStorage.setItem(name, value);
  },
  getItem: async (name: string) => {
    return (await AsyncStorage.getItem(name)) ?? null;
  },
  removeItem: async (name: string) => {
    await AsyncStorage.removeItem(name);
  },
};

export interface SyncEvent {
  id: string;
  serialNumber: string;
  userEmail: string;
  type: 'ISSUE' | 'RETURN';
  timestamp: string;
}

interface SyncState {
  queue: SyncEvent[];
  addToQueue: (event: SyncEvent) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      queue: [],
      addToQueue: (event) => set((state) => ({ queue: [...state.queue, event] })),
      removeFromQueue: (id) => set((state) => ({ queue: state.queue.filter(e => e.id !== id) })),
      clearQueue: () => set({ queue: [] }),
    }),
    {
      name: 'sync-queue-storage',
      storage: createJSONStorage(() => syncStorage),
    }
  )
);
