import apiClient from './client';

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', { email, password });
    return response.data;
  },

  register: async (data: {
    email: string;
    password: string;
    name: string;
    organization: string;
    role: string;
  }) => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/api/auth/profile');
    return response.data;
  },
};

