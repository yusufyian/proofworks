import apiClient from './client';

export interface Transfer {
  id: string;
  certificateId: string;
  fromCompanyId: string;
  toCompanyId: string;
  amount: number;
  transferType: 'full' | 'split';
  status: 'pending' | 'completed' | 'rejected' | 'cancelled';
  reason?: string;
  blockchainTxHash?: string;
  certificate?: any;
  fromCompany?: { id: string; name: string };
  toCompany?: { id: string; name: string };
}

export const transfersApi = {
  create: (data: {
    certificateId: string;
    toCompanyId: string;
    amount: number;
    transferType: 'full' | 'split';
  }) => apiClient.post('/transfers', data),
  
  getAll: (params?: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) => apiClient.get('/transfers', { params }),
  
  getById: (id: string) =>
    apiClient.get(`/transfers/${id}`),
  
  approve: (id: string) =>
    apiClient.post(`/transfers/${id}/approve`),
  
  reject: (id: string, reason?: string) =>
    apiClient.post(`/transfers/${id}/reject`, { reason }),
};

