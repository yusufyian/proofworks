import apiClient from './client';

export const blockchainApi = {
  getAll: (params?: { dataType?: string; page?: number; limit?: number }) =>
    apiClient.get('/blockchain', { params }),
};

