import apiClient from './client';

export interface Financing {
  id: string;
  certificateId: string;
  applicantId: string;
  financierId: string;
  amount: number;
  interestRate: number;
  term: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'repaid' | 'overdue';
  riskScore?: number;
  riskRating?: string;
  approvalDate?: string;
  disbursementDate?: string;
  repaymentDate?: string;
  paymentTxHash?: string;
  certificate?: any;
  applicant?: { id: string; name: string };
  financier?: { id: string; name: string };
}

export const financingApi = {
  create: (data: {
    certificateId: string;
    financierId: string;
    amount: number;
    term: number;
  }) => apiClient.post('/financing', data),
  
  getAll: (params?: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) => apiClient.get('/financing', { params }),
  
  getById: (id: string) =>
    apiClient.get(`/financing/${id}`),
  
  approve: (id: string) =>
    apiClient.post(`/financing/${id}/approve`),
  
  reject: (id: string, reason?: string) =>
    apiClient.post(`/financing/${id}/reject`, { reason }),
  
  disburse: (id: string, paymentTxHash?: string) =>
    apiClient.post(`/financing/${id}/disburse`, { paymentTxHash }),
};

