import client from './client';

export const inventoryApi = {
  getInventories: async (params?: { period?: string; status?: string }) => {
    const response = await client.get('/inventory', { params });
    return response.data;
  },

  getInventory: async (id: string) => {
    const response = await client.get(`/inventory/${id}`);
    return response.data;
  },

  createInventory: async (data: any) => {
    const response = await client.post('/inventory', data);
    return response.data;
  },

  updateInventory: async (id: string, data: any) => {
    const response = await client.put(`/inventory/${id}`, data);
    return response.data;
  },

  getActivityData: async (period?: string) => {
    const response = await client.get('/inventory/activity', { params: { period } });
    return response.data;
  },

  createActivityData: async (data: any) => {
    const response = await client.post('/inventory/activity', data);
    return response.data;
  },
};

