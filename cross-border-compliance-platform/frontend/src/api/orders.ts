import apiClient from './client';

export const ordersApi = {
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    apiClient.get('/orders', { params }),
  getById: (id: string) => apiClient.get(`/orders/${id}`),
};

