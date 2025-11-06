import client from './client';

export const authApi = {
  register: async (data: { email: string; password: string; name: string; role?: string; department?: string; phone?: string }) => {
    const response = await client.post('/auth/register', data);
    return response.data;
  },
  
  login: async (data: { email: string; password: string }) => {
    const response = await client.post('/auth/login', data);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await client.get('/auth/profile');
    return response.data;
  },
};
