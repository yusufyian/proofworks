import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

// 从localStorage加载初始状态
const loadAuthFromStorage = () => {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.state?.user || null,
        token: parsed.state?.token || null,
        isAuthenticated: !!parsed.state?.token,
      };
    }
  } catch (e) {
    // ignore
  }
  return { user: null, token: null, isAuthenticated: false };
};

const initialState = loadAuthFromStorage();

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  setAuth: (user, token) => {
    localStorage.setItem('auth-storage', JSON.stringify({ state: { user, token } }));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('auth-storage');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

