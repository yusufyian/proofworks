import apiClient from './client';

export interface Recall {
  id: string;
  batchId: string;
  batchNumber: string;
  reason: string;
  riskLevel: string;
  initiatedBy: string;
  initiatedAt: string;
  status: string;
  recallProgress: {
    totalQuantity: number;
    recalledQuantity: number;
    locations: Array<{
      name: string;
      quantity: number;
      status: string;
    }>;
  };
  completedAt?: string;
}

export const recallApi = {
  getRecalls: (params?: { status?: string; riskLevel?: string }) => {
    return apiClient.get<{ success: boolean; data: Recall[]; total: number }>('/recalls', { params });
  },
  
  getRecall: (id: string) => {
    return apiClient.get<{ success: boolean; data: Recall }>(`/recalls/${id}`);
  },
};

