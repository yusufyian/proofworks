import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const token = localStorage.getItem('token');
  // 如果有token但没有用户信息，标记为未认证，让组件去获取用户信息
  return {
    user: null,
    token,
    isAuthenticated: false, // 初始化为false，需要验证token后设置为true
    setAuth: (user, token) => {
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});

