import apiClient from './client';

export const reportsApi = {
  getAll: (params?: { agency?: string; page?: number; limit?: number }) =>
    apiClient.get('/reports', { params }),
  getById: (id: string) => apiClient.get(`/reports/${id}`),
};

