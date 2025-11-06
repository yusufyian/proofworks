import client from './client';

export const maintenanceApi = {
  getAll: async (params?: { equipmentId?: string; status?: string }) => {
    const response = await client.get('/maintenance', { params });
    return response.data;
  },
  
  get: async (id: string) => {
    const response = await client.get(`/maintenance/${id}`);
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await client.post('/maintenance', data);
    return response.data;
  },
  
  update: async (id: string, data: any) => {
    const response = await client.put(`/maintenance/${id}`, data);
    return response.data;
  },
};
