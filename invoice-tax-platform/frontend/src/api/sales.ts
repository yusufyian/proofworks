import apiClient from './client';

export const salesApi = {
  createInvoice: (data: any) => apiClient.post('/api/sales/invoices', data),
  getInvoices: (params?: any) => apiClient.get('/api/sales/invoices', { params }),
};

