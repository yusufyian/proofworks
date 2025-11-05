import client from './client';

export const devicesApi = {
  getDevices: async (params?: { type?: string; status?: string }) => {
    const response = await client.get('/devices', { params });
    return response.data;
  },
  getDevice: async (id: string) => {
    const response = await client.get(`/devices/${id}`);
    return response.data;
  },
  updateDevice: async (id: string, data: any) => {
    const response = await client.put(`/devices/${id}`, data);
    return response.data;
  },
};



