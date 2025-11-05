import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Certificates from './pages/Certificates';
import CertificateDetail from './pages/CertificateDetail';
import IssueCertificate from './pages/IssueCertificate';
import Transfers from './pages/Transfers';
import Financing from './pages/Financing';
import FinancingDetail from './pages/FinancingDetail';
import Audit from './pages/Audit';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
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
          <Route path="certificates/issue" element={<IssueCertificate />} />
          <Route path="transfers" element={<Transfers />} />
          <Route path="financing" element={<Financing />} />
          <Route path="financing/:id" element={<FinancingDetail />} />
          <Route path="audit" element={<Audit />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

