import apiClient from './client';

export const authorizationApi = {
  getAuthorizations: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await apiClient.get('/api/authorizations', { params });
    return response.data;
  },

  createAuthorization: async (data: {
    dataAssetId: string;
    grantee: string;
    purpose: string;
    fields: string[];
    dataScope: string;
    validTo: string;
    usageLimit?: number;
    resultType?: string;
  }) => {
    const response = await apiClient.post('/api/authorizations', data);
    return response.data;
  },

  updateAuthorizationStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/api/authorizations/${id}/status`, { status });
    return response.data;
  },
};

