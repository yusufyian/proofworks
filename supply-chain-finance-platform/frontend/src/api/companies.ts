import apiClient from './client';

export interface Company {
  id: string;
  name: string;
  unifiedSocialCreditCode: string;
  type: 'core_enterprise' | 'supplier' | 'bank' | 'guarantee';
  creditRating?: string;
  creditLimit?: number;
  usedCreditLimit?: number;
  status: string;
}

export const companiesApi = {
  getAll: (params?: { type?: string }) =>
    apiClient.get('/companies', { params }),
  
  getById: (id: string) =>
    apiClient.get(`/companies/${id}`),
};

