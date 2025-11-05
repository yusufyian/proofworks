import apiClient from './client';

export const matchApi = {
  performThreeWayMatch: (data: { invoiceId: string; orderId: string; receiptId: string }) =>
    apiClient.post('/api/matches/three-way', data),
  getMatches: (params?: any) => apiClient.get('/api/matches', { params }),
};

