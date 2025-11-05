import apiClient from './client';

export const authApi = {
  register: (data: { email: string; password: string; name: string; role?: string; department?: string }) =>
    apiClient.post('/api/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    apiClient.post('/api/auth/login', data),
  
  getProfile: () =>
    apiClient.get('/api/auth/profile'),
};

