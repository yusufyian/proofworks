import client from './client';

export const blockchainApi = {
  certify: async (resourceType: string, resourceId: string) => {
    const response = await client.post('/blockchain/certify', { resourceType, resourceId });
    return response.data;
  },

  getRecords: async () => {
    const response = await client.get('/blockchain/records');
    return response.data;
  },
};
