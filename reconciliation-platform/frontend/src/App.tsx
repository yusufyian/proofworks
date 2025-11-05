import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reconciliation from './pages/Reconciliation';
import Discrepancy from './pages/Discrepancy';
import Settlement from './pages/Settlement';
import Layout from './components/Layout';
import { QueryClient, QueryClientProvider } from 'react-query';
import { authApi } from './api/auth';

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setAuth, token, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 如果已经有用户信息且已认证，直接通过
    if (user && isAuthenticated) {
      setIsLoading(false);
      return;
    }

    // 如果有token但没有用户信息，需要从API获取用户信息
    if (token && !user) {
      authApi.getCurrentUser()
        .then((response) => {
          // 成功获取用户信息，更新store
          setAuth(response.data, token);
          setIsLoading(false);
        })
        .catch((error) => {
          // token无效，清除并跳转登录
          console.error('获取用户信息失败:', error);
          localStorage.removeItem('token');
          setIsLoading(false);
        });
    } else if (!token) {
      // 没有token，直接跳转到登录页
      setIsLoading(false);
    }
  }, [token, user, isAuthenticated, setAuth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="reconciliation" element={<Reconciliation />} />
            <Route path="discrepancy" element={<Discrepancy />} />
            <Route path="settlement" element={<Settlement />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

