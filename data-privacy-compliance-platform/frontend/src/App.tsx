import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DataAssets from './pages/DataAssets';
import Authorizations from './pages/Authorizations';
import ComputingTasks from './pages/ComputingTasks';
import Audit from './pages/Audit';
import Blockchain from './pages/Blockchain';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter basename="/data-privacy-compliance">
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
          <Route path="data-assets" element={<DataAssets />} />
          <Route path="authorizations" element={<Authorizations />} />
          <Route path="computing-tasks" element={<ComputingTasks />} />
          <Route path="audit" element={<Audit />} />
          <Route path="blockchain" element={<Blockchain />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

