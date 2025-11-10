import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Batches } from './pages/Batches';
import { Trace } from './pages/Trace';
import { Recalls } from './pages/Recalls';
import { Analytics } from './pages/Analytics';
import { TemperatureAnalysis } from './pages/TemperatureAnalysis';
import { QualityAnalysis } from './pages/QualityAnalysis';
import { LogisticsAnalysis } from './pages/LogisticsAnalysis';

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
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/analytics/temperature" element={<TemperatureAnalysis />} />
        <Route path="/analytics/quality" element={<QualityAnalysis />} />
        <Route path="/analytics/logistics" element={<LogisticsAnalysis />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

