import React from 'react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import EncryptPage from './pages/EncryptPage';
import DecryptPage from './pages/DecryptPage';
import { AnimatePresence, motion } from 'framer-motion';

// Wrapper to handle route transitions
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key={location.pathname}
        // Removed filter property as it creates a containing block that breaks position: sticky
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
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <MemoryRouter>
      <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-emerald-500/30 overflow-x-hidden">
        <Navbar />
        <AnimatedRoutes />
      </div>
    </MemoryRouter>
  );
};

export default App;