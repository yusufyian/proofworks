import client from './client';

export const batchesApi = {
  getBatches: async (params?: { status?: string; search?: string }) => {
    const response = await client.get('/batches', { params });
    return response.data;
  },
  getBatch: async (id: string) => {
    const response = await client.get(`/batches/${id}`);
    return response.data;
  },
  createBatch: async (data: any) => {
    const response = await client.post('/batches', data);
    return response.data;
  },
  updateBatch: async (id: string, data: any) => {
    const response = await client.put(`/batches/${id}`, data);
    return response.data;
  },
};



