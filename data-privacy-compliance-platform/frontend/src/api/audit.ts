import apiClient from './client';

export const auditApi = {
  getAuditRecords: async (params?: {
    page?: number;
    limit?: number;
    action?: string;
    resourceType?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await apiClient.get('/api/audit', { params });
    return response.data;
  },
};

