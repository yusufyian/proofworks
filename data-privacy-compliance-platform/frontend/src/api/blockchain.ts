import apiClient from './client';

export const blockchainApi = {
  getBlockchainRecords: async (params?: { page?: number; limit?: number; recordType?: string }) => {
    const response = await apiClient.get('/api/blockchain', { params });
    return response.data;
  },

  getBlockchainRecord: async (id: string) => {
    const response = await apiClient.get(`/api/blockchain/${id}`);
    return response.data;
  },
};

