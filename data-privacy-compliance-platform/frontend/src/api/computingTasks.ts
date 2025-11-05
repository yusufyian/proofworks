import apiClient from './client';

export const computingTaskApi = {
  getComputingTasks: async (params?: { page?: number; limit?: number; status?: string; method?: string }) => {
    const response = await apiClient.get('/api/computing-tasks', { params });
    return response.data;
  },

  createComputingTask: async (data: {
    name: string;
    description: string;
    method: string;
    authorizationIds: string[];
    participants: string[];
  }) => {
    const response = await apiClient.post('/api/computing-tasks', data);
    return response.data;
  },

  updateTaskStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/api/computing-tasks/${id}/status`, { status });
    return response.data;
  },
};

