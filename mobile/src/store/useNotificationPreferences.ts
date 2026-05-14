import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationPreferencesState {
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const useNotificationPreferencesStore = create<NotificationPreferencesState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
    }),
    {
      name: 'notification-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

