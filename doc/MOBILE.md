# ReLoop Mobile Documentation

## Technology Stack
- **Framework**: `Expo` / `React Native`.
- **Primary Language**: `TypeScript`.
- **State Management**: `Zustand` for local UI and persistent logic.
- **Data Persistence**: `MMKV` (high performance) paired with `AsyncStorage` (if needed).
- **Network Stack**: `Axios` (with auth interceptors) and `TanStack Query` (React Query) for server state.
- **Navigation**: `Expo Router` (file-based).
- **Icons**: `Lucide React Native` for premium visual impact.

## Architecture
Mobile app uses a **Feature-based structure** for clean separation of concerns.

### Project Structure
- **/app**: Expo Router screens and layouts.
- **/src/api**: Axios client and centralized `apiService`.
- **/src/hooks**: Custom React Query hooks (e.g., `useSyncEngine`).
- **/src/store**: Persistent Zustand stores (`useAuthStore`, `useSyncStore`).
- **/src/components**: Shared UI components and layout helpers.

### Offline-First Sync Engine
1. **Local Scans**: When a scan occurs (issue/return), it check for connectivity.
2. **Sync Queue**: If offline, it's added to a **MMKV-persistent queue**.
3. **Background Processing**: The `useSyncEngine` hook runs an interval-based task that attempts to POST the queue to `/sync/bulk` once online.
4. **Reconciliation**: Server-side sequential processing handles scan conflicts (e.g., container already returned).

### Features
- **Dashboard**: Impact overview (Plastic saved, CO2 reduced), AI sustainability tips.
- **Scanner**: Camera-integrated barcode scanning for QR codes.
- **Rewards**: Marketplace for points redemption at partner vendors.
- **Map Section**: Interactive vendor discovery with real-time user location and a dynamic vendor information sheet (points info, opening hours, navigation).
- **Sync Status**: Real-time indicator showing the number of scans pending offline.

### Performance
- **MMKV**: Used for state persistence due to its near-native performance for key-value storage.
- **NativeWind / Lucide**: Premium feel with lightweight styling.
- **React Query**: Intelligent caching and background refetching to reduce battery/data usage.
