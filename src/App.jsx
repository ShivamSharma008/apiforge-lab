import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import ApiPlayground from './pages/ApiPlayground';
import Dashboard from './pages/Dashboard';
import DbSandbox from './pages/DbSandbox';
import Workflows from './pages/Workflows';
import Events from './pages/Events';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/api-playground" element={<ApiPlayground />} />
        <Route path="/db-sandbox" element={<DbSandbox />} />
        <Route path="/workflows" element={<Workflows />} />
        <Route path="/events" element={<Events />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter basename="/apiforge-lab">
      <div className="min-h-screen flex flex-col bg-surface">
        <Navbar />
        <main className="flex-1">
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
