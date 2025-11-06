import client from './client';

export const productApi = {
  getProductFootprints: async (params?: { verified?: boolean }) => {
    const response = await client.get('/product', { params });
    return response.data;
  },

  getProductFootprint: async (id: string) => {
    const response = await client.get(`/product/${id}`);
    return response.data;
  },

  createProductFootprint: async (data: any) => {
    const response = await client.post('/product', data);
    return response.data;
  },

  updateProductFootprint: async (id: string, data: any) => {
    const response = await client.put(`/product/${id}`, data);
    return response.data;
  },
};

