import client from './client';

export const reductionApi = {
  getReductionProjects: async (params?: { status?: string; vintage?: string }) => {
    const response = await client.get('/reduction', { params });
    return response.data;
  },

  getReductionProject: async (id: string) => {
    const response = await client.get(`/reduction/${id}`);
    return response.data;
  },

  createReductionProject: async (data: any) => {
    const response = await client.post('/reduction', data);
    return response.data;
  },

  updateReductionProject: async (id: string, data: any) => {
    const response = await client.put(`/reduction/${id}`, data);
    return response.data;
  },
};

