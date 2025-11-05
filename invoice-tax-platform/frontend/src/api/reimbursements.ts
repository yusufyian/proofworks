import apiClient from './client';

export const reimbursementApi = {
  create: (data: any) => apiClient.post('/api/reimbursements', data),
  getList: (params?: any) => apiClient.get('/api/reimbursements', { params }),
  getDetail: (id: string) => apiClient.get(`/api/reimbursements/${id}`),
  approve: (id: string, data: { action: 'approve' | 'reject'; comment?: string }) =>
    apiClient.post(`/api/reimbursements/${id}/approve`, data),
};

