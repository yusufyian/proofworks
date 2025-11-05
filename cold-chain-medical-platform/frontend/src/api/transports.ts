import client from './client';

export const transportsApi = {
  getTransports: async (params?: {
    fromCompanyId?: string;
    toCompanyId?: string;
    status?: string;
    search?: string;
  }) => {
    const response = await client.get('/transports', { params });
    return response.data;
  },
  getTransport: async (id: string) => {
    const response = await client.get(`/transports/${id}`);
    return response.data;
  },
  createTransport: async (data: any) => {
    const response = await client.post('/transports', data);
    return response.data;
  },
  updateTransport: async (id: string, data: any) => {
    const response = await client.put(`/transports/${id}`, data);
    return response.data;
  },
};



