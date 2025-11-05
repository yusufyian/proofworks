import { api } from './api';

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
      companyName?: string;
    };
  };
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: 'core_enterprise' | 'supplier' | 'bank' | 'admin';
  companyName?: string;
  companyCode?: string;
}

export const authService = {
  async login(username: string, password: string): Promise<{ token: string; user: any }> {
    const response = await api.post<LoginResponse>('/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  async register(data: RegisterRequest): Promise<any> {
    return api.post('/auth/register', data);
  },

  async getCurrentUser(): Promise<any> {
    return api.get('/auth/me');
  },
};

