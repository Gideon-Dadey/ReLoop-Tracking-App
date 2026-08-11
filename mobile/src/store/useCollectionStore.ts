import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Vendor } from '@/src/api/service';

const storage = {
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

type CollectionState = {
  selectedBase: Vendor | null;
  pendingSerial: string | null;
  setSelectedBase: (base: Vendor | null) => void;
  setPendingSerial: (serial: string | null) => void;
  clearPendingSerial: () => void;
};

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set) => ({
      selectedBase: null,
      pendingSerial: null,
      setSelectedBase: (selectedBase) => set({ selectedBase }),
      setPendingSerial: (pendingSerial) => set({ pendingSerial }),
      clearPendingSerial: () => set({ pendingSerial: null }),
    }),
    {
      name: 'collection-store',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({ selectedBase: state.selectedBase }),
    },
  ),
);
