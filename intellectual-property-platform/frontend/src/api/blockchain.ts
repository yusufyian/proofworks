import { apiClient } from './client';

export const blockchainApi = {
  getInfo: async () => {
    const response = await apiClient.get('/blockchain/info');
    return response.data;
  },

  verify: async (hash: string, type: string, id?: string) => {
    const response = await apiClient.post('/blockchain/verify', { hash, type, id });
    return response.data;
  },

  getTransaction: async (txHash: string) => {
    const response = await apiClient.get(`/blockchain/transaction/${txHash}`);
    return response.data;
  },
};

