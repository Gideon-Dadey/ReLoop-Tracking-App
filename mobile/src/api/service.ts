import { apiClient } from './client';

export const apiService = {
  // Authentication
  login: async (email: string, password: string) => {
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  register: async (email: string, password: string, userName: string, organizationId?: string) => {
    try {
      const body: any = { email, password, userName };
      if (organizationId) body.organizationId = organizationId;
      const { data } = await apiClient.post('/auth/register', body);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Profile
  getProfile: async () => {
    try {
      const { data } = await apiClient.get('/auth/profile');
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },
  
  updateProfile: async (update: { userName?: string, avatar?: string }) => {
    try {
      const { data } = await apiClient.patch('/auth/profile', update);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  changePassword: async (passwords: any) => {
    try {
      const { data } = await apiClient.post('/auth/change-password', passwords);
      return data;
    } catch (error: any) {
       throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  },

  // Containers
  issueContainer: async (serialNumber: string, userEmail: string) => {
    try {
      const { data } = await apiClient.post('/containers/issue', { serialNumber, userEmail });
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to issue container');
    }
  },

  returnContainer: async (serialNumber: string, userEmail: string) => {
    try {
      const { data } = await apiClient.post('/containers/return', { serialNumber, userEmail });
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to return container');
    }
  },

  // Sync
  syncBulk: async (events: any[]) => {
    try {
      const { data } = await apiClient.post('/sync/bulk', { events });
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Bulk sync failed');
    }
  },

  // Rewards
  getRewards: async () => {
    try {
      const { data } = await apiClient.get('/rewards');
      return data;
    } catch (error: any) {
      // Return empty array if endpoint doesn't exist yet
      return [];
    }
  },

  redeemReward: async (rewardId: string) => {
    try {
      const { data } = await apiClient.post(`/rewards/${rewardId}/redeem`);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to redeem reward');
    }
  },
  // AI Coach
  getCoachRecommendations: async () => {
    try {
      const { data } = await apiClient.get('/ai/recommendations');
      return data;
    } catch (error: any) {
      return [];
    }
  },

  getTransactionHistory: async () => {
    try {
      const { data } = await apiClient.get('/containers/history');
      return data;
    } catch (error: any) {
       throw new Error(error.response?.data?.message || 'Failed to fetch history');
    }
  },

  getActiveBorrows: async () => {
    try {
      const { data } = await apiClient.get('/containers/active');
      return data;
    } catch (error: any) {
       throw new Error(error.response?.data?.message || 'Failed to fetch active borrows');
    }
  },

  getVendors: async () => {
    try {
      const { data } = await apiClient.get('/vendors');
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vendors');
    }
  },

  getCommunityStats: async () => {
    try {
      const { data } = await apiClient.get('/community/stats');
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch community stats');
    }
  },

  getLeaderboard: async (limit = 10) => {
    try {
      const { data } = await apiClient.get(`/community/leaderboard?limit=${limit}`);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  },
};
