import client from './client';

export const blockchainApi = {
  getAll: async (params?: { recordType?: string; equipmentId?: string }) => {
    const response = await client.get('/blockchain', { params });
    return response.data;
  },
  
  get: async (id: string) => {
    const response = await client.get(`/blockchain/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await client.post('/blockchain', data);
    return response.data;
  },
};
