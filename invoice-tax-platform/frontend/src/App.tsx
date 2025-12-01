import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';
import Reimbursements from './pages/Reimbursements';
import ReimbursementDetail from './pages/ReimbursementDetail';
import SalesInvoices from './pages/SalesInvoices';
import ThreeWayMatch from './pages/ThreeWayMatch';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter basename="/invoice-tax">
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
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/:id" element={<InvoiceDetail />} />
          <Route path="reimbursements" element={<Reimbursements />} />
          <Route path="reimbursements/:id" element={<ReimbursementDetail />} />
          <Route path="sales" element={<SalesInvoices />} />
          <Route path="matches" element={<ThreeWayMatch />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

