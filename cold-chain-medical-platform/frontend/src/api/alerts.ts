import client from './client';

export const alertsApi = {
  getAlerts: async (params?: {
    batchId?: string;
    deviceId?: string;
    status?: string;
    level?: string;
    startTime?: string;
    endTime?: string;
  }) => {
    const response = await client.get('/alerts', { params });
    return response.data;
  },
  getAlert: async (id: string) => {
    const response = await client.get(`/alerts/${id}`);
    return response.data;
  },
  updateAlert: async (id: string, data: any) => {
    const response = await client.put(`/alerts/${id}`, data);
    return response.data;
  },
};



