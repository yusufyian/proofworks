import api from './client';

export const settlementApi = {
  getRecords: (params?: any) => api.get('/settlement/records', { params }),
  createSettlement: (data: any) => api.post('/settlement/create', data),
};

