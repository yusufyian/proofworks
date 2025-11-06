import apiClient from './client';

export const contractsApi = {
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    apiClient.get('/contracts', { params }),
  getById: (id: string) => apiClient.get(`/contracts/${id}`),
};

