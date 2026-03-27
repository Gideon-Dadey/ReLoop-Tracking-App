# ReLoop: Circular Economy Platform

A production-ready Circular Economy platform designed to incentivize reusable packaging through behavioral technology and data-driven insights.

## Project Structure
- **/backend**: NestJS API with MongoDB (Clean Architecture)
- **/mobile**: Expo / React Native App (Offline-first / TypeScript)
- **docker-compose.yml**: Infrastructure for local development (MongoDB + Redis)

## Features
- **🔑 Identity**: Role-based JWT Auth (User, Vendor, Admin)
- **♻️ Loop Tracking**: Secure QR Scan system for issuing/returning containers
- **📏 Impact Engine**: Real-time calculation of Plastic saved and CO2 offset
- **📦 Offline Sync**: MMKV-based persistent queue for scans without internet
- **🧠 AI Coach**: Personalized sustainability hacks and pattern analysis
- **🔗 Verification**: Abstracted signature layer for immutable audit trails

## Tech Stack
- **Backend**: NestJS, MongoDB (Mongoose), TypeScript, JWT, Swagger
- **Mobile**: React Native (Expo), TanStack Query, Zustand, MMKV, Lucide Icons
- **Ops**: Docker, Github Actions (ready)

## Getting Started

### 1. Prerequisite
- Node.js (v18+)
- Docker (for database)

### 2. Infrastructure
Run the following in the root directory:
```bash
docker-compose up -d
```

### 3. Backend Setup
```bash
cd backend
npm install
npm run start:dev
```
API Documentation: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

### 4. Mobile Setup
```bash
cd mobile
npm install
npx expo start
```

## Scaling Strategy
1. **Multi-tenancy**: Organizations can manage their own vendors and container pools via `organizationId` isolation.
2. **Blockchain Integration**: Swap `LocalSignatureProvider` in `BlockchainModule` for a `Web3Provider` (Polygon/Ethereum) for true decentralization.
3. **Analytics**: Plug in a Worker service to aggregate global impact across all organizations.
4. **Offline Resilience**: Expand `useSyncEngine` to handle conflict resolution strategies (Last-write-wins or Server-authority).

---
Built with ❤️ for a Sustainable Future.
