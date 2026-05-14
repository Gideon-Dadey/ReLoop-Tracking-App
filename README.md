# ReLoop: Circular Economy & Campaign Evaluation Platform

A production-ready mobile application designed to incentivize reusable packaging through behavioral technology, and evaluate social media visual campaigns promoting zero waste and sustainable development (SDG 12).

## Project Structure

```
RELOOP/
├── backend/          NestJS API with MongoDB
├── mobile/           Expo / React Native App
├── docs/             Technical documentation
└── docker-compose.yml
```

## Core Features

- **Identity & Auth**: Role-based JWT authentication (User, Vendor, Admin) with refresh tokens
- **Loop Tracking**: QR scan system for issuing/returning reusable containers
- **Impact Engine**: Real-time calculation of plastic saved and CO2 offset
- **Gamification**: Points, streaks, leaderboard, and redeemable rewards
- **Offline Sync**: Persistent queue for scans without internet
- **AI Coach**: Personalized sustainability recommendations
- **Community**: Leaderboard and community stats

## Research Features (SDG 12 Alignment)

These features directly support the research objectives on evaluating social media visual campaigns promoting zero waste:

- **Campaign Evaluation**: Submit and score social media campaigns across 5 research-based criteria (Visual Design, Narrative Coherence, Circular Economy Alignment, Behavioral Call to Action, Community Orientation)
- **Campaign Dashboard**: Visualize evaluation data with bar charts, pie charts, top campaigns, and SDG 12 alignment metrics
- **Advocacy & Sharing**: Generate shareable impact cards with personal stats or top campaign highlights
- **Community Survey**: 10-question Likert scale measuring sustainable behavioral intentions and community resilience outcomes

> See `docs/RESEARCH_FEATURES.md` for detailed documentation of how the research features work.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Backend | NestJS, MongoDB (Mongoose), TypeScript, JWT, Swagger, class-validator |
| Mobile | React Native (Expo), TanStack Query, Zustand, Lucide Icons, react-native-gifted-charts |
| Infrastructure | Docker, MongoDB Atlas |

## Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn
- Expo Go app on your phone (for testing)
- MongoDB Atlas account (or local MongoDB via Docker)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (see `.env.example` for reference):

```bash
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secrets, etc.
```

Start the backend:

```bash
npm run start:dev
```

API Documentation: http://localhost:3000/api/docs

### 2. Mobile Setup

```bash
cd mobile
npm install
```

Update the API URL in `src/api/client.ts` to point to your backend's IP address, or create a `.env` file:

```bash
cp .env.example .env
# Set EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:3000
```

Start the mobile app:

```bash
npx expo start --clear
```

Scan the QR code with Expo Go on your phone.

### 3. Finding Your IP Address

The mobile app needs to connect to the backend over your local network:

- **Windows**: Run `ipconfig` and look for your Wi-Fi IPv4 address
- **Mac/Linux**: Run `ifconfig` or `ip addr`

Use this IP in the `EXPO_PUBLIC_API_URL` or directly in `mobile/src/api/client.ts`.

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login |
| POST | /auth/refresh | Refresh access token |
| GET | /auth/profile | Get user profile |
| PATCH | /auth/profile | Update profile |
| POST | /auth/change-password | Change password |

### Containers
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /containers/issue | Issue container to user |
| POST | /containers/return | Return a container |
| GET | /containers/active | Get user's active borrows |
| GET | /containers/history | Transaction history |

### Campaigns (Research)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /campaigns | Submit a campaign |
| GET | /campaigns | List campaigns (paginated) |
| GET | /campaigns/:id | Campaign detail |
| POST | /campaigns/:id/evaluate | Evaluate with scores |
| GET | /campaigns/stats | Dashboard statistics |

### Surveys (Research)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /surveys | Submit survey responses |
| GET | /surveys/status | Check completion status |
| GET | /surveys/results | Aggregated results |

## App Navigation

```
Tab Bar:
├── Home          — Dashboard with impact stats, weekly goal, streak
├── Activity      — Container transaction history
├── Scanner       — QR code scanner for issue/return
├── Research      — Campaign evaluation, dashboard, sharing, survey
└── Profile       — Account settings, map access, rewards
```

## Environment Variables

### Backend (.env)

| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 3000) |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | Secret for access tokens |
| JWT_REFRESH_SECRET | Secret for refresh tokens |
| JWT_EXPIRATION | Access token lifetime (e.g., 1h) |
| JWT_REFRESH_EXPIRATION | Refresh token lifetime (e.g., 7d) |
| POINTS_PER_RETURN | Points awarded per container return |
| PLASTIC_SAVED_PER_UNIT | Plastic saved per return (kg) |
| CO2_SAVED_PER_UNIT | CO2 saved per return (kg) |

### Mobile (.env)

| Variable | Description |
|----------|-------------|
| EXPO_PUBLIC_API_URL | Backend URL (e.g., http://192.168.0.32:3000) |

## Building for Production

### Android APK

```bash
cd mobile
npx expo install eas-cli
npx eas build --platform android --profile preview
```

This generates a downloadable APK file for testing on Android devices.

## Project Deliverables

1. **Source Code** — Full project (this repository)
2. **Working Application** — APK build or Expo Go demo
3. **Technical Documentation** — `docs/RESEARCH_FEATURES.md`
4. **API Documentation** — Auto-generated Swagger at `/api/docs`
5. **Setup Guide** — This README

---

Built for sustainable development research — promoting zero waste and circular economy through technology.
