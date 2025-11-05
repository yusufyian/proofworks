import apiClient from './client';

export const invoiceApi = {
  upload: (data: any) => apiClient.post('/api/invoices/upload', data),
  getList: (params?: any) => apiClient.get('/api/invoices', { params }),
  getDetail: (id: string) => apiClient.get(`/api/invoices/${id}`),
  verify: (id: string) => apiClient.post(`/api/invoices/${id}/verify`),
};

