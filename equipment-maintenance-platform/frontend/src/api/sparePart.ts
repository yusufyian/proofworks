import client from './client';

export const sparePartApi = {
  getAll: async (params?: { equipmentId?: string; search?: string }) => {
    const response = await client.get('/spare-parts', { params });
    return response.data;
  },
  
  get: async (id: string) => {
    const response = await client.get(`/spare-parts/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await client.post('/spare-parts', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await client.put(`/spare-parts/${id}`, data);
    return response.data;
  },
};
