import client from './client';

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await client.post('/auth/login', { email, password });
    return response.data;
  },
  getMe: async () => {
    const response = await client.get('/auth/me');
    return response.data;
  },
};
