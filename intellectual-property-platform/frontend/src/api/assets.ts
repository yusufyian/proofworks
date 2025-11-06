import { apiClient } from './client';

export const assetsApi = {
  getAll: async (params?: { page?: number; pageSize?: number; assetType?: string; status?: string }) => {
    const response = await apiClient.get('/assets', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/assets/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post('/assets', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/assets/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/assets/${id}`);
    return response.data;
  },
};

