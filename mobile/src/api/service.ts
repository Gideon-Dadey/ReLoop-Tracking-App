import { apiClient } from './client';
import { formatLocalDateKey } from '@/src/data/dailyPulseQuestions';

// ── API Response Types ──────────────────────────────────────────────────────

export interface UserImpact {
  plasticSaved: number;
  co2Saved: number;
  totalReturns: number;
}

export interface WeeklyGoal {
  current: number;
  target: number;
  percent: number;
}

export interface User {
  id: string;
  email: string;
  userName: string;
  role: 'user' | 'vendor' | 'admin';
  organizationId?: string;
  points: number;
  streakCount: number;
  lastReturnAt?: string;
  weeklyGoal?: WeeklyGoal;
  impact: UserImpact;
  activeBorrows?: number;
  avatar?: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Container {
  _id: string;
  serialNumber: string;
  type?: string;
  status: string;
  updatedAt?: string;
  lastVendorId?: { userName: string };
}

export interface Transaction {
  _id: string;
  type: 'ISSUE' | 'RETURN';
  containerId?: { serialNumber: string };
  pointsAwarded?: number;
  createdAt: string;
}

export interface Vendor {
  _id: string;
  name: string;
  acceptedMaterials?: string[];
  location: { lat: number; lng: number; address: string };
  settings?: { pointsPerReturn?: number };
}

export interface Reward {
  _id: string;
  id?: string;
  title: string;
  vendor: string;
  points: number;
  description?: string;
}

export interface CoachTip {
  title: string;
  message: string;
}

export interface CommunityStats {
  totalPlasticSaved: number;
  totalUsers: number;
}

export interface LeaderboardEntry {
  _id: string;
  userName: string;
  avatar?: string;
  points: number;
  impact?: UserImpact;
}

export interface SyncEvent {
  serialNumber: string;
  type: 'ISSUE' | 'RETURN';
  userEmail: string;
  timestamp: string;
}

export interface SyncResult {
  serialNumber: string;
  success: boolean;
  message?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// ── Campaign Types ────────────────────────────────────────────────────────

export type CampaignPlatform = 'instagram' | 'tiktok' | 'facebook' | 'pinterest';

export interface EvaluationScores {
  visualDesignQuality: number;
  narrativeCoherence: number;
  circularEconomyAlignment: number;
  behavioralCallToAction: number;
  communityOrientation: number;
  overallScore: number;
}

export interface Campaign {
  _id: string;
  title: string;
  platform: CampaignPlatform;
  url: string;
  imageUrl?: string;
  description: string;
  submittedBy: { _id: string; userName: string; avatar?: string };
  scores: EvaluationScores;
  isEvaluated: boolean;
  evaluatedBy?: { _id: string; userName: string };
  evaluatorNotes: string;
  evaluatedAt?: string;
  evaluationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignListResponse {
  campaigns: Campaign[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CampaignStats {
  totalCampaigns: number;
  evaluatedCampaigns: number;
  platformDistribution: { platform: CampaignPlatform; count: number }[];
  averageScores: {
    visualDesignQuality: number;
    narrativeCoherence: number;
    circularEconomyAlignment: number;
    behavioralCallToAction: number;
    communityOrientation: number;
    overall: number;
  };
  sdg12AlignmentPercent: number;
  topCampaigns: { _id: string; title: string; platform: CampaignPlatform; scores: { overallScore: number } }[];
}

export interface CreateCampaignPayload {
  title: string;
  platform: CampaignPlatform;
  url: string;
  imageUrl?: string;
  description?: string;
}

export interface EvaluateCampaignPayload {
  visualDesignQuality: number;
  narrativeCoherence: number;
  circularEconomyAlignment: number;
  behavioralCallToAction: number;
  communityOrientation: number;
  evaluatorNotes?: string;
}

export interface SurveyAnswer {
  questionId: number;
  value: number;
}

export interface SubmitSurveyPayload {
  responses: SurveyAnswer[];
  surveyVersion: string;
}

export interface SurveyStatus {
  completed: boolean;
  completedAt: string | null;
}

export interface SurveyQuestionResult {
  questionId: number;
  avgScore: number;
  totalResponses: number;
  distribution: number[];
}

export interface SurveyResults {
  totalRespondents: number;
  questions: SurveyQuestionResult[];
  sectionAverages?: {
    behavioralIntentions: number;
    communityResilience: number;
  };
  avgScore?: number;
}

export interface PulseStatus {
  completedToday: boolean;
  todayVersion: string;
  todayKey: string;
  streak: number;
  totalCompleted: number;
  completedAt: string | null;
}

export interface VerifyResult {
  success: boolean;
  message?: string;
}

export interface ReturnResult {
  user?: Partial<User>;
  impact?: { points?: number; plasticSaved?: number; co2Saved?: number; streakBonus?: number; streakCount?: number };
  message?: string;
}

// ── API Service ─────────────────────────────────────────────────────────────

export const apiService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      return data;
    } catch (error: any) {
      if (!error.response) {
        throw new Error('Unable to reach the server. Please check your internet connection.');
      }
      const msg = error.response?.data?.message;
      if (Array.isArray(msg)) throw new Error(msg.join(', '));
      throw new Error(msg || 'Login failed. Please check your credentials.');
    }
  },

  register: async (
    email: string,
    password: string,
    userName: string,
    organizationId?: string,
  ): Promise<AuthResponse> => {
    try {
      const body: Record<string, string> = { email, password, userName };
      if (organizationId) body.organizationId = organizationId;
      const { data } = await apiClient.post('/auth/register', body);
      return data;
    } catch (error: any) {
      if (!error.response) {
        throw new Error('Unable to reach the server. Please check your internet connection.');
      }
      const msg = error.response?.data?.message;
      if (Array.isArray(msg)) throw new Error(msg.join(', '));
      throw new Error(msg || 'Registration failed. Please try again.');
    }
  },

  getProfile: async (): Promise<User> => {
    try {
      const { data } = await apiClient.get('/auth/profile');
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  updateProfile: async (update: {
    userName?: string;
    avatar?: string | null;
  }): Promise<User> => {
    try {
      const { data } = await apiClient.patch('/auth/profile', update);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  changePassword: async (passwords: ChangePasswordPayload): Promise<void> => {
    try {
      await apiClient.post('/auth/change-password', passwords);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  },

  issueContainer: async (
    serialNumber: string,
    userEmail: string,
  ): Promise<ReturnResult> => {
    try {
      const { data } = await apiClient.post('/containers/issue', {
        serialNumber,
        userEmail,
      });
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to issue container');
    }
  },

  returnContainer: async (
    serialNumber: string,
    userEmail: string,
  ): Promise<ReturnResult> => {
    try {
      const { data } = await apiClient.post('/containers/return', {
        serialNumber,
        userEmail,
      });
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to return container');
    }
  },

  syncBulk: async (
    events: SyncEvent[],
  ): Promise<{ results: SyncResult[] }> => {
    try {
      const { data } = await apiClient.post('/sync/bulk', { events });
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Bulk sync failed');
    }
  },

  getRewards: async (): Promise<Reward[]> => {
    try {
      const { data } = await apiClient.get('/rewards');
      return data;
    } catch {
      return [];
    }
  },

  redeemReward: async (rewardId: string): Promise<{ voucherCode: string }> => {
    try {
      const { data } = await apiClient.post(`/rewards/${rewardId}/redeem`);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to redeem reward');
    }
  },

  getCoachRecommendations: async (): Promise<CoachTip[]> => {
    try {
      const { data } = await apiClient.get('/ai/recommendations');
      return data;
    } catch {
      return [];
    }
  },

  getTransactionHistory: async (): Promise<Transaction[]> => {
    try {
      const { data } = await apiClient.get('/containers/history');
      return data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch history',
      );
    }
  },

  getActiveBorrows: async (): Promise<Container[]> => {
    try {
      const { data } = await apiClient.get('/containers/active');
      return data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch active borrows',
      );
    }
  },

  getVendors: async (): Promise<Vendor[]> => {
    try {
      const { data } = await apiClient.get('/vendors');
      return data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch vendors',
      );
    }
  },

  getCommunityStats: async (): Promise<CommunityStats> => {
    try {
      const { data } = await apiClient.get('/community/stats');
      return data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch community stats',
      );
    }
  },

  getLeaderboard: async (limit = 10): Promise<LeaderboardEntry[]> => {
    try {
      const { data } = await apiClient.get(
        `/community/leaderboard?limit=${limit}`,
      );
      return data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch leaderboard',
      );
    }
  },

  verifyClean: async (
    serialNumber: string,
    image: string,
  ): Promise<VerifyResult> => {
    try {
      const { data } = await apiClient.post('/containers/verify', {
        serialNumber,
        image,
      });
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Verification failed');
    }
  },

  // ── Campaigns ─────────────────────────────────────────────────────────

  getCampaigns: async (page = 1, limit = 20): Promise<CampaignListResponse> => {
    try {
      const { data } = await apiClient.get(`/campaigns?page=${page}&limit=${limit}`);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch campaigns');
    }
  },

  getCampaignById: async (id: string): Promise<Campaign> => {
    try {
      const { data } = await apiClient.get(`/campaigns/${id}`);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch campaign');
    }
  },

  createCampaign: async (payload: CreateCampaignPayload): Promise<Campaign> => {
    try {
      const { data } = await apiClient.post('/campaigns', payload);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit campaign');
    }
  },

  evaluateCampaign: async (id: string, payload: EvaluateCampaignPayload): Promise<Campaign> => {
    try {
      const { data } = await apiClient.post(`/campaigns/${id}/evaluate`, payload);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to evaluate campaign');
    }
  },

  getCampaignStats: async (): Promise<CampaignStats> => {
    try {
      const { data } = await apiClient.get('/campaigns/stats');
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch campaign stats');
    }
  },

  // ── Surveys ───────────────────────────────────────────────────────────

  submitSurvey: async (payload: SubmitSurveyPayload): Promise<any> => {
    try {
      const { data } = await apiClient.post('/surveys', payload);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit survey');
    }
  },

  getSurveyStatus: async (version = '1.0'): Promise<SurveyStatus> => {
    try {
      const { data } = await apiClient.get(`/surveys/status?version=${version}`);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to check survey status');
    }
  },

  getSurveyResults: async (version = '1.0'): Promise<SurveyResults> => {
    try {
      const { data } = await apiClient.get(`/surveys/results?version=${version}`);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch survey results');
    }
  },

  getPulseStatus: async (dateKey?: string): Promise<PulseStatus> => {
    try {
      const date = dateKey ?? formatLocalDateKey();
      const { data } = await apiClient.get(`/surveys/pulse/status?date=${date}`);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch pulse status');
    }
  },
};
