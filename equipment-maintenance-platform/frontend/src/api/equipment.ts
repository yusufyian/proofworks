import client from './client';

export const equipmentApi = {
  getAll: async (params?: { department?: string; status?: string; search?: string }) => {
    const response = await client.get('/equipment', { params });
    return response.data;
  },
  
  get: async (id: string) => {
    const response = await client.get(`/equipment/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await client.post('/equipment', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await client.put(`/equipment/${id}`, data);
    return response.data;
  },
};
