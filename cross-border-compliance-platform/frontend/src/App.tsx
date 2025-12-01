import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Assessments from './pages/Assessments';
import Contracts from './pages/Contracts';
import Transmissions from './pages/Transmissions';
import Payments from './pages/Payments';
import Orders from './pages/Orders';
import Reports from './pages/Reports';
import Blockchain from './pages/Blockchain';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter basename="/cross-border-compliance">
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
          <Route path="assessments" element={<Assessments />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="transmissions" element={<Transmissions />} />
          <Route path="payments" element={<Payments />} />
          <Route path="orders" element={<Orders />} />
          <Route path="reports" element={<Reports />} />
          <Route path="blockchain" element={<Blockchain />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

