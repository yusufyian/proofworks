import apiClient from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  companyName: string;
  unifiedSocialCreditCode: string;
  companyType: 'core_enterprise' | 'supplier' | 'bank';
  role: 'core_enterprise' | 'supplier' | 'bank';
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post('/auth/login', data),
  
  register: (data: RegisterRequest) =>
    apiClient.post('/auth/register', data),
  
  getProfile: () =>
    apiClient.get('/auth/profile'),
  
  updateProfile: (data: { name?: string; phone?: string }) =>
    apiClient.put('/auth/profile', data),
};

