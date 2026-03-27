import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  timestamp: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      addNotification: (notif) => {
        const newNotif: Notification = {
          ...notif,
          id: Math.random().toString(36).substring(7),
          isRead: false,
          timestamp: new Date().toISOString(),
        };
        const currentNotifs = [newNotif, ...get().notifications].slice(0, 50); // Keep last 50
        set({
          notifications: currentNotifs,
          unreadCount: currentNotifs.filter((n) => !n.isRead).length,
        });
      },
      markAsRead: (id) => {
        const newNotifs = get().notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        );
        set({
          notifications: newNotifs,
          unreadCount: newNotifs.filter((n) => !n.isRead).length,
        });
      },
      markAllAsRead: () => {
        const newNotifs = get().notifications.map((n) => ({ ...n, isRead: true }));
        set({
          notifications: newNotifs,
          unreadCount: 0,
        });
      },
      clearAll: () => set({ notifications: [], unreadCount: 0 }),
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
