import api from './client';

export const reconciliationApi = {
  getRecords: (params?: any) => api.get('/reconciliation/records', { params }),
  getSummary: (date?: string) => api.get('/reconciliation/summary', { params: { date } }),
  triggerReconciliation: (date?: string) => api.post('/reconciliation/trigger', { date }),
};

