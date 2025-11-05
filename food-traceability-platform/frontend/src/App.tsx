import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Batches } from './pages/Batches';
import { Trace } from './pages/Trace';
import { Recalls } from './pages/Recalls';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/batches" element={<Batches />} />
        <Route path="/trace" element={<Trace />} />
        <Route path="/trace/batch/:batchId" element={<Trace />} />
        <Route path="/recalls" element={<Recalls />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

