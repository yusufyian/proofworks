import apiClient from './client';

export const dashboardApi = {
  getStats: async () => {
    const response = await apiClient.get('/api/dashboard/stats');
    return response.data;
  },
};

