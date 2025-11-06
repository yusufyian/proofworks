import apiClient from './client';

export const assessmentsApi = {
  getAll: (params?: { status?: string; path?: string; page?: number; limit?: number }) =>
    apiClient.get('/assessments', { params }),
  getById: (id: string) => apiClient.get(`/assessments/${id}`),
};

