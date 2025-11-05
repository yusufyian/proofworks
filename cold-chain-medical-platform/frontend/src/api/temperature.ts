import client from './client';

export const temperatureApi = {
  getTemperatureData: async (params?: {
    deviceId?: string;
    batchId?: string;
    startTime?: string;
    endTime?: string;
  }) => {
    const response = await client.get('/temperature', { params });
    return response.data;
  },
};



