import apiClient from './client';

export const paymentsApi = {
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    apiClient.get('/payments', { params }),
  getById: (id: string) => apiClient.get(`/payments/${id}`),
};

