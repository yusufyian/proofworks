import { apiClient } from './client';

export const authApi = {
  login: async (username: string, password: string) => {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data;
  },

  register: async (data: {
    username: string;
    email: string;
    password: string;
    name: string;
    role?: string;
    organization?: string;
  }) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

