import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Visible tab bar content height (icons + labels), excluding system insets. */
export const TAB_BAR_CONTENT_HEIGHT = 50;

/**
 * Returns bottom safe-area padding and total tab bar height.
 * Keeps the tab bar above Android gesture / 3-button navigation bars.
 */
export function useTabBarInsets() {
  const { bottom } = useSafeAreaInsets();

  // Gesture nav usually reports an inset; 3-button nav may report 0 on some devices.
  const bottomInset = Platform.OS === 'android' ? Math.max(bottom, 8) : Math.max(bottom - 4, 8);

  return {
    bottomInset,
    tabBarHeight: TAB_BAR_CONTENT_HEIGHT + bottomInset,
  };
}
