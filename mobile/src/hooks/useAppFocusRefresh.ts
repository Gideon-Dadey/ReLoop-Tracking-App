import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import type { AppStateStatus } from 'react-native';
import { focusManager, onlineManager } from '@tanstack/react-query';

/**
 * Wires React Query's focusManager to React Native's AppState so
 * queries marked refetchOnWindowFocus automatically refetch when
 * the app comes back to the foreground.
 */
export function useAppFocusRefresh() {
  useEffect(() => {
    const handler = (status: AppStateStatus) => {
      if (Platform.OS !== 'web') {
        focusManager.setFocused(status === 'active');
      }
    };

    const sub = AppState.addEventListener('change', handler);
    return () => sub.remove();
  }, []);
}
