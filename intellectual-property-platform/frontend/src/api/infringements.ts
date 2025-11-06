import { apiClient } from './client';

export const infringementsApi = {
  getAll: async (params?: { page?: number; pageSize?: number; status?: string; platform?: string }) => {
    const response = await apiClient.get('/infringements', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/infringements/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post('/infringements', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/infringements/${id}`, data);
    return response.data;
  },
};

