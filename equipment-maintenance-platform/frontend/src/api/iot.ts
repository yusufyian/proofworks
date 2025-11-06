import client from './client';

export const iotApi = {
  getData: async (params?: { equipmentId?: string; startTime?: string; endTime?: string }) => {
    const response = await client.get('/iot', { params });
    return response.data;
  },
  
  createData: async (data: any) => {
    const response = await client.post('/iot', data);
    return response.data;
  },
};

