import client from './client';

export const esgApi = {
  getESGReports: async (params?: { year?: number; status?: string }) => {
    const response = await client.get('/esg', { params });
    return response.data;
  },

  getESGReport: async (id: string) => {
    const response = await client.get(`/esg/${id}`);
    return response.data;
  },

  createESGReport: async (data: any) => {
    const response = await client.post('/esg', data);
    return response.data;
  },

  updateESGReport: async (id: string, data: any) => {
    const response = await client.put(`/esg/${id}`, data);
    return response.data;
  },
};

