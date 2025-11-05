import apiClient from './client';

export interface Certificate {
  id: string;
  certificateNumber: string;
  creditorId: string;
  debtorId: string;
  initialAmount: number;
  remainingAmount: number;
  issueDate: string;
  expiryDate: string;
  status: 'holding' | 'transferred' | 'pledged' | 'redeemed' | 'split';
  contractHash?: string;
  invoiceHash?: string;
  receiptHash?: string;
  blockchainTxHash?: string;
  creditor?: { id: string; name: string };
  debtor?: { id: string; name: string };
}

export const certificatesApi = {
  create: (data: {
    debtorId: string;
    initialAmount: number;
    expiryDate: string;
    contractHash?: string;
    invoiceHash?: string;
    receiptHash?: string;
  }) => apiClient.post('/certificates', data),
  
  getAll: (params?: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) => apiClient.get('/certificates', { params }),
  
  getById: (id: string) =>
    apiClient.get(`/certificates/${id}`),
  
  getHistory: (id: string) =>
    apiClient.get(`/certificates/${id}/history`),
  
  verify: (id: string, data: {
    certificateNumber?: string;
    blockchainTxHash?: string;
  }) => apiClient.post(`/certificates/${id}/verify`, data),
};

