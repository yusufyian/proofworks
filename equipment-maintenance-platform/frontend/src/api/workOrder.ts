import client from './client';

export const workOrderApi = {
  getAll: async (params?: { equipmentId?: string; status?: string; priority?: string; search?: string }) => {
    const response = await client.get('/work-orders', { params });
    return response.data;
  },
  
  get: async (id: string) => {
    const response = await client.get(`/work-orders/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await client.post('/work-orders', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await client.put(`/work-orders/${id}`, data);
    return response.data;
  },
};
