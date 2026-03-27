# Map Section Features

This document outlines the latest features and architectural improvements added to the **ReLoop Map Section**.

## 1. Core Map Optimization
*   **Google Maps Integration**: Leverages `react-native-maps` for a smooth, native experience.
*   **Dynamic Theming**: Fully integrated with the `useThemeStore`, providing consistent styling for both light and dark modes across markers, overlays, and sheets.
*   **Platform-Specific Providers**: Defaults to `PROVIDER_GOOGLE` on Android for superior performance and feature support.

## 2. Smart Location Intelligence
*   **Real-time Permissions**: Automated foreground location permission handling via `expo-location`.
*   **Active Tracking**: Real-time rendering of the user's current position on the map.
*   **One-Touch Centering**: A dedicated `LocateFixed` button that uses `animateToRegion` to smoothly snap the map view to the user's coordinates.

## 3. Dynamic Vendor Ecosystem
*   **Real-time Fetching**: Integrated with React Query for efficient, cached vendor data retrieval from the `/vendors` API endpoint.
*   **Custom Geometric Markers**: Custom-designed `MapPin` markers that use the application's accent colors for high visibility.
*   **Intelligent Loading States**: A polished `ActivityIndicator` overlay ensures the user is aware of data synchronization.

## 4. Enhanced Vendor Interaction (Bottom Sheet)
Tapping any vendor pin now triggers a **premium sliding detail sheet** containing:
*   **Geospacial Data**: Display of the vendor's name and full street address.
*   **Incentive Statistics**: Displays the specific **Points Per Return** (`pts/return`) for each location, incentivizing user visits.
*   **Operational Status**: Real-time status indicator (e.g., "Open until 8:00 PM").
*   **Navigation Bridge**: Ready-to-use navigation button designed to bridge with external GPS apps.

## 5. UI/UX Refinements
*   **Floating Search Bar**: A modernized search entry with integrated filtering and search icons.
*   **Gesture Control**: Map `onPress` logic to dismiss the detail sheet, ensuring a clean workspace when searching.
*   **Premium Visuals**: Implementation of shadow layering, rounded borders (`borderTopLeftRadius: 32`), and letter-spacing optimizations for a high-end mobile feel.

---

> [!TIP]
> **Next Steps**: The search bar is currently a UI placeholder. Future updates will include a fuzzy search algorithm to filter vendors by name or material type (e.g., Plastic, Glass).

> [!IMPORTANT]
> Ensure the **API Base URL** is correctly configured in your `.env` to allow the map to successfully fetch live vendor data.
