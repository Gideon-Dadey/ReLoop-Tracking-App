# ReLoop: Advanced Features Documentation

## 1. AI Sustainability Coach (Extensible)
ReLoop includes an `AICoachModule` designed for behavioral analysis.

### Features
- **Usage Analysis**: Tracks `Transaction` logs to identify frequent users.
- **Dynamic Goals**: Suggests bonuses (e.g., "5 more returns for a 'Zero Waste Warrior' badge").
- **Tip Engine**: Generates context-aware sustainability tips (e.g., "You've saved 1kg of plastic this month!").
- **LLM Integration Path**: Ready to be connected to VertexAI/OpenAI for personalized AI chat and coaching.

### Modules Involved
- `backend/src/modules/ai`: Core logic and transaction scanning.
- `mobile/app/(tabs)/dashboard.tsx`: Frontend display of personal coaching tips.

## 2. Interactive Vendor Map Layer
The map section provides more than just coordinates—it’s designed as a dynamic discovery layer.

### Features
- **Real-Time Geolocating**: Uses high-precision GPS via `expo-location` to track user position relative to recycling points.
- **Dynamic Markup Engine**: Fetches live vendor data from the backend and renders custom-themed markers based on vendor locations.
- **Smart Bottom Sheet Interaction**: Features a sliding detail panel that displays:
    - **Incentive Tracking**: Shows points per return for each specific vendor.
    - **Operational States**: Monitors and displays vendor opening hours.
    - **Native Navigation Bridge**: Hooks into the user's native maps app for direct routing.

### Modules Involved
- `mobile/app/(tabs)/map.tsx`: Main map interface and UI logic.
- `mobile/src/api/service.ts`: Backend vendor data synchronization.

## 3. Blockchain Verification Abstraction
To ensure immutable reuse claims (important for carbon credits and partner trust), ReLoop features a verification layer.

### Design Pattern
- **`IVerificationProvider`**: A TypeScript interface defining `signTransaction` and `verifyTransaction`.
- **`LocalSignatureProvider`**: Default implementation using HMAC-SHA256 for internal verification.
- **Scaling to Web3**: Swap the provider for an `EthereumProvider` or `PolygonProvider` to store transaction hashes directly on-chain.

### Verification Flow
1. **Action**: User returns a container.
2. **Sign**: `BlockchainModule` signs the transaction details (User ID + Container ID + Timestamp).
3. **Store**: Signature is saved in the `Transaction` document.
4. **Audit**: Admins or Partners can verify the signature to ensure claims haven't been tampered with.

## 3. Scaling & Production Strategy

### API Performance
- **Redis Caching**: Use Redis for caching session data and frequently accessed organization settings.
- **Load Balancing**: The stateless design of the NestJS API allows it to scale horizontally behind NGINX or Kubernetes Ingress.

### Data at Scale
- **Shard Keys**: For `Containers` and `Transactions`, use `organizationId` as the shard key to partition data across MongoDB clusters.
- **Indexes**: Intelligent indexing on `userId`, `vendorId`, and `serialNumber` ensures <100ms query performance even with millions of records.

### DevOps
- **Docker**: Containerized environment for consistent dev/prod parity.
- **CI/CD**: `README.md` includes setup details ready for GitHub Actions integration.
