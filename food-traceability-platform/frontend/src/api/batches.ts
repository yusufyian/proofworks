import apiClient from './client';

export interface Batch {
  id: string;
  batchNumber: string;
  traceCodePrefix: string;
  productId: string;
  productName?: string; // 后端返回时已包含产品名称
  productionDate: string;
  expiryDays: number;
  quantity: number;
  unit: string;
  ingredients: Array<{
    name: string;
    batchNumber: string;
    amount: number;
  }>;
  qualityReports: Array<{
    testItem: string;
    result: string;
    agency: string;
    reportNumber: string;
    reportHash: string;
    testDate: string;
  }>;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const batchApi = {
  getBatches: (params?: { productId?: string; status?: string; startDate?: string; endDate?: string; page?: number; pageSize?: number }) => {
    return apiClient.get<{ success: boolean; data: Batch[]; total: number; page?: number; pageSize?: number; totalPages?: number }>('/batches', { params });
  },
  
  getBatch: (id: string) => {
    return apiClient.get<{ success: boolean; data: Batch }>(`/batches/${id}`);
  },
  
  getBatchStatistics: () => {
    return apiClient.get<{ success: boolean; data: any }>('/batches/statistics/overview');
  },
};

