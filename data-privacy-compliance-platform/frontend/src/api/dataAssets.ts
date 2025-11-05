import apiClient from './client';

export const dataAssetApi = {
  getDataAssets: async (params?: { page?: number; limit?: number; category?: string; classification?: number }) => {
    const response = await apiClient.get('/api/data-assets', { params });
    return response.data;
  },

  getDataAsset: async (id: string) => {
    const response = await apiClient.get(`/api/data-assets/${id}`);
    return response.data;
  },
};

