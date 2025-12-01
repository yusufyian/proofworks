import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import AssetDetail from './pages/AssetDetail';
import Infringements from './pages/Infringements';
import RightsProtection from './pages/RightsProtection';
import Licenses from './pages/Licenses';
import Devices from './pages/Devices';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter basename="/intellectual-property">
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
          <Route path="assets" element={<Assets />} />
          <Route path="assets/:id" element={<AssetDetail />} />
          <Route path="infringements" element={<Infringements />} />
          <Route path="rights-protection" element={<RightsProtection />} />
          <Route path="licenses" element={<Licenses />} />
          <Route path="devices" element={<Devices />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

