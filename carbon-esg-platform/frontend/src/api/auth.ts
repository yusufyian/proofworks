import client from './client';

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await client.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  register: async (data: {
    email: string;
    password: string;
    name: string;
    role: string;
    companyId?: string;
  }) => {
    const response = await client.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  getProfile: async () => {
    const response = await client.get('/auth/profile');
    return response.data;
  },
};

