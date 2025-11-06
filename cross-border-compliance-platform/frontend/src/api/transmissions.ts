import apiClient from './client';

export const transmissionsApi = {
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    apiClient.get('/transmissions', { params }),
  getById: (id: string) => apiClient.get(`/transmissions/${id}`),
};

