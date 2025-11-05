import { api } from './api';

export interface FinancingApplication {
  id: string;
  certificate_id: string;
  applicant_id: string;
  financier_id?: string;
  financing_amount: number;
  financing_rate?: number;
  financing_term?: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'repaid' | 'defaulted';
  risk_score?: number;
  risk_rating?: string;
  created_at: string;
}

export const financingService = {
  async applyForFinancing(data: {
    certificateId: string;
    financingAmount: number;
    financingTerm?: number;
  }): Promise<FinancingApplication> {
    return api.post('/financing/apply', data);
  },

  async getApplications(params?: { status?: string }): Promise<FinancingApplication[]> {
    return api.get('/financing/applications', { params });
  },

  async getApplicationById(id: string): Promise<FinancingApplication> {
    return api.get(`/financing/applications/${id}`);
  },

  async approveApplication(id: string, data: {
    financingRate: number;
    riskScore: number;
    riskRating: string;
  }): Promise<FinancingApplication> {
    return api.post(`/financing/applications/${id}/approve`, data);
  },

  async rejectApplication(id: string): Promise<FinancingApplication> {
    return api.post(`/financing/applications/${id}/reject`);
  },

  async disburseFunds(id: string): Promise<FinancingApplication> {
    return api.post(`/financing/applications/${id}/disburse`);
  },
};

