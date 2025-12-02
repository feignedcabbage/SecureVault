import React from 'react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import EncryptPage from './pages/EncryptPage';
import DecryptPage from './pages/DecryptPage';
import RetrievePage from './pages/RetrievePage';
import { AnimatePresence, motion } from 'framer-motion';

// Wrapper to handle route transitions
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <AnimatePresence mode='wait'>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full"
        >
          <Routes location={location}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/encrypt" element={<EncryptPage />} />
            <Route path="/decrypt" element={<DecryptPage />} />
            <Route path="/retrieve" element={<RetrievePage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

const App: React.FC = () => {
  return (
    <MemoryRouter>
      <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-emerald-500/30 overflow-x-hidden">
        <AnimatedRoutes />
      </div>
    </MemoryRouter>
  );
};

export default App;