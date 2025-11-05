import apiClient from './client';

export const orderApi = {
  getOrders: (params?: any) => apiClient.get('/api/orders', { params }),
  getOrder: (id: string) => apiClient.get(`/api/orders/${id}`),
  getReceipts: (params?: any) => apiClient.get('/api/orders/receipts', { params }),
};

