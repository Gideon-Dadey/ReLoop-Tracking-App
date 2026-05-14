# Research Alignment Features — How It Works

This document explains the four new feature modules added to ReLoop to align the application with the research objectives on evaluating social media visual campaigns promoting zero waste and reusable packaging (SDG 12).

---

## System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Mobile App (Expo)                       │
│                                                           │
│  ┌────────────┐  ┌───────────┐  ┌────────┐  ┌────────┐ │
│  │  Campaign   │  │ Campaign  │  │  Share │  │ Survey │ │
│  │  Evaluation │  │ Dashboard │  │ Impact │  │  Flow  │ │
│  └──────┬─────┘  └─────┬─────┘  └───┬────┘  └───┬────┘ │
│         │               │            │            │       │
│         └───────┬───────┴────────────┘            │       │
│                 ▼                                  ▼       │
│          src/api/service.ts (API methods + types)          │
└──────────────────────────┬────────────────────────────────┘
                           │ HTTP (JWT Auth)
┌──────────────────────────▼────────────────────────────────┐
│                 Backend (NestJS)                            │
│                                                            │
│  ┌────────────────────────┐  ┌──────────────────────────┐ │
│  │   CampaignsModule      │  │    SurveysModule          │ │
│  │  - Schema (MongoDB)    │  │  - Schema (MongoDB)       │ │
│  │  - DTOs (validation)   │  │  - DTOs (validation)      │ │
│  │  - Service (logic)     │  │  - Service (logic)        │ │
│  │  - Controller (routes) │  │  - Controller (routes)    │ │
│  └────────────────────────┘  └──────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## Feature 1: Campaign Evaluation

**Purpose**: Allows users to submit social media campaigns (from Instagram, TikTok, Facebook, Pinterest) and evaluate them against 5 research-based criteria from the conceptual framework.

### How It Works

1. **User navigates** to Profile → Research → "Evaluate Campaigns"
2. **Campaign List** loads from `GET /campaigns` with pagination
3. **Submit a campaign**: Tap the FAB (+) button → fill in title, platform, URL, and description → `POST /campaigns`
4. **Evaluate a campaign**: Tap a campaign card → view details → tap "Evaluate" → rate 5 criteria using star ratings (1–5) → `POST /campaigns/:id/evaluate`

### Evaluation Criteria (from the research conceptual framework)

| Criterion | What It Measures |
|-----------|-----------------|
| Visual Design Quality | Quality of visual elements, color, composition |
| Narrative Coherence | Clear, consistent messaging and storytelling |
| Circular Economy Alignment | Alignment with zero waste and reuse principles |
| Behavioral Call to Action | Motivates viewers to take sustainable action |
| Community Orientation | Fosters community engagement and participation |

The **overall score** is computed as the average of the 5 criteria (stored in the database on each evaluation).

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/campaigns` | Submit a new campaign |
| GET | `/campaigns` | List campaigns (paginated) |
| GET | `/campaigns/:id` | Get campaign detail |
| POST | `/campaigns/:id/evaluate` | Evaluate with scores |
| GET | `/campaigns/stats` | Aggregated stats for dashboard |

### Data Model

```typescript
Campaign {
  title: string
  platform: 'instagram' | 'tiktok' | 'facebook' | 'pinterest'
  url: string
  imageUrl?: string
  description: string
  submittedBy: ObjectId (User)
  scores: {
    visualDesignQuality: 0–5
    narrativeCoherence: 0–5
    circularEconomyAlignment: 0–5
    behavioralCallToAction: 0–5
    communityOrientation: 0–5
    overallScore: computed average
  }
  isEvaluated: boolean
  evaluatedBy: ObjectId (User)
  evaluatorNotes: string
  evaluatedAt: Date
  evaluationCount: number
}
```

---

## Feature 2: Campaign Visualization Dashboard

**Purpose**: Visualizes aggregated campaign evaluation data using charts and metrics, providing a clear picture of how campaigns perform across criteria and platforms.

### How It Works

1. **User navigates** to Profile → Research → "Campaign Dashboard"
2. **Stats load** from `GET /campaigns/stats` which runs MongoDB aggregations
3. **Dashboard displays**:
   - **Stat Cards**: Total campaigns, evaluated campaigns, SDG 12 alignment percentage
   - **Bar Chart**: Average scores across the 5 evaluation criteria
   - **Pie Chart**: Distribution of campaigns by platform (Instagram, TikTok, etc.)
   - **Top Campaigns**: Top 5 highest-scoring campaigns ranked by overall score
   - **SDG 12 Alignment Bar**: Visual percentage showing how well campaigns align with responsible consumption goals (calculated as `avgOverallScore / 5 × 100`)

### Charts Library

Uses `react-native-gifted-charts` which works in Expo Go without native linking. Charts adapt to the app's theme (dark/light mode) automatically.

---

## Feature 3: Advocacy & Sharing Tools

**Purpose**: Enables users to generate and share beautiful "impact cards" showing their personal sustainability stats or highlighting top-rated campaigns, promoting SDG 12 awareness on social media.

### How It Works

1. **User navigates** to Profile → Research → "Share Your Impact"
2. **Choose card type**:
   - **My Impact**: Shows the user's personal stats (plastic saved, containers returned, streak)
   - **Top Campaign**: Shows the highest-rated campaign with its score
3. **Choose card style**: Pick from 3 templates (Dark, Light, Green)
4. **Preview**: The card renders live in the app
5. **Share**: Tap "Share Card" → the card is captured as a PNG image using `react-native-view-shot` → shared to any app (WhatsApp, Instagram, etc.) using `expo-sharing`

### Card Contents

**Impact Card**:
- ReLoop branding
- User's handle (@userName)
- Plastic saved (grams)
- Total returns
- Streak (days)
- SDG 12 footer text

**Campaign Highlight Card**:
- ReLoop Campaign branding
- Campaign title
- Overall score out of 5
- Circular economy & SDG 12 tagline

---

## Feature 4: Community Survey

**Purpose**: Measures sustainable behavioral intentions and community resilience outcomes using a 10-question Likert scale survey aligned with the Theory of Planned Behavior and community resilience frameworks from the research.

### How It Works

1. **User navigates** to Profile → Research → "Take Survey"
2. **Status check**: App calls `GET /surveys/status?version=1.0` to see if the user already completed it
3. **If not completed**: Step-by-step question flow (one question at a time with animated transitions)
4. **Answer**: Each question has a 5-point Likert scale with emoji buttons (Strongly Disagree → Strongly Agree)
5. **Progress**: A progress bar shows completion (X of 10)
6. **Submit**: After answering all 10, tap "Submit" → `POST /surveys`
7. **Results**: Shows a thank-you screen with aggregated community averages

### Survey Questions

**Section A — Sustainable Behavioral Intentions** (Theory of Planned Behavior):

| # | Question | Construct |
|---|----------|-----------|
| 1 | I intend to reduce my use of single-use packaging in the next month | Attitudinal |
| 2 | People important to me support my use of reusable containers | Normative |
| 3 | I feel confident I can adopt zero waste practices in my daily life | Efficacy |
| 4 | Seeing zero waste campaigns on social media motivates me to act sustainably | Campaign influence |
| 5 | I plan to recommend reusable packaging to friends and family | Advocacy intent |

**Section B — Community Resilience Outcomes** (Norris et al., 2008 / Keck & Sakdapolrak, 2013):

| # | Question | Construct |
|---|----------|-----------|
| 6 | I feel connected to a community of people who care about reducing waste | Coping |
| 7 | I have learned practical skills for zero waste living from social media | Adaptive |
| 8 | I believe our community can create meaningful change in waste reduction | Transformative |
| 9 | Social media campaigns have helped me understand the circular economy | Knowledge |
| 10 | I feel motivated to advocate for systemic changes in packaging practices | Agency |

### Versioning & One-Response-Per-User

- Each survey has a `surveyVersion` (currently `"1.0"`)
- The database enforces a unique compound index on `(userId, surveyVersion)` — each user can only submit once per version
- If the user has already completed it, the screen shows a "Thank You" state with community aggregate results

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/surveys` | Submit survey responses |
| GET | `/surveys/status?version=1.0` | Check if user has completed |
| GET | `/surveys/results?version=1.0` | Get aggregated community results |

### Aggregated Results

The results endpoint returns:
- **Per-question**: Average score, response count, distribution (how many chose 1, 2, 3, 4, 5)
- **Section averages**: Mean of Section A (behavioral intentions) and Section B (community resilience)
- **Total respondents**: Count of unique survey completions

---

## Navigation Flow

All research features are accessible from the **Profile tab** under a dedicated "RESEARCH" section:

```
Profile Screen
├── [Hero Card - user info, stats]
├── [Rewards Section]
├── ACCOUNT
│   ├── Security & Privacy
│   ├── Change Password
│   └── Notifications
├── SUPPORT & SOCIAL
│   ├── Tell a Friend
│   ├── Help Center
│   └── About ReLoop
├── RESEARCH               ← New Section
│   ├── Evaluate Campaigns → /campaigns
│   ├── Campaign Dashboard → /campaigns/dashboard
│   ├── Share Your Impact  → /campaigns/share
│   └── Take Survey        → /surveys
└── [Sign Out]
```

The research screens are **stack screens** (not tabs) to keep the main tab bar focused on the core container-tracking experience.

---

## File Structure

```
backend/src/modules/
├── campaigns/
│   ├── schemas/campaign.schema.ts    # MongoDB schema + indexes
│   ├── dto/campaign.dto.ts           # Request validation (class-validator)
│   ├── campaigns.service.ts          # Business logic + aggregations
│   ├── campaigns.controller.ts       # REST endpoints (JWT protected)
│   └── campaigns.module.ts           # NestJS module wiring
└── surveys/
    ├── schemas/survey-response.schema.ts
    ├── dto/survey.dto.ts
    ├── surveys.service.ts
    ├── surveys.controller.ts
    └── surveys.module.ts

mobile/app/
├── campaigns/
│   ├── _layout.tsx                   # Stack navigator for campaigns
│   ├── index.tsx                     # Campaign list + submit form
│   ├── [id].tsx                      # Campaign detail + evaluation
│   ├── dashboard.tsx                 # Charts and visualizations
│   └── share.tsx                     # Impact card generator + sharing
└── surveys/
    ├── _layout.tsx                   # Stack navigator for surveys
    └── index.tsx                     # Likert scale questionnaire flow
```

---

## Security

- All endpoints require JWT authentication (`JwtAuthGuard`)
- Request payloads are validated using `class-validator` decorators
- Survey responses are tied to authenticated `userId` (no anonymous submissions)
- Unique constraint prevents duplicate survey submissions per user per version

---

## Dependencies Added

| Package | Purpose |
|---------|---------|
| `react-native-gifted-charts` | Bar charts and pie charts on the dashboard |
| `react-native-view-shot` | Capture UI views as PNG images for sharing |
| `expo-sharing` | Share images/files to other apps on the device |
