import { api } from './api';

export interface Certificate {
  id: string;
  certificate_id: string;
  creditor_id: string;
  debtor_id: string;
  initial_amount: number;
  remaining_amount: number;
  issue_date: string;
  expiry_date: string;
  status: 'holding' | 'transferred' | 'pledged' | 'redeemed' | 'expired';
  contract_hash?: string;
  invoice_hash?: string;
  creditor_name?: string;
  debtor_name?: string;
}

export const certificateService = {
  async getCertificates(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ certificates: Certificate[]; pagination: any }> {
    return api.get('/certificates', { params });
  },

  async getCertificateById(id: string): Promise<Certificate> {
    return api.get(`/certificates/${id}`);
  },

  async issueCertificate(data: {
    debtorId: string;
    initialAmount: number;
    expiryDate: string;
    contractHash?: string;
    invoiceHash?: string;
  }): Promise<Certificate> {
    return api.post('/certificates', data);
  },
};

