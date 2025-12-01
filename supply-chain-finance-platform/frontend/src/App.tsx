import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Certificates from './pages/Certificates';
import CertificateDetail from './pages/CertificateDetail';
import Transfers from './pages/Transfers';
import Financing from './pages/Financing';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter basename="/supply-chain-finance">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="certificates/:id" element={<CertificateDetail />} />
          <Route path="transfers" element={<Transfers />} />
          <Route path="financing" element={<Financing />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

