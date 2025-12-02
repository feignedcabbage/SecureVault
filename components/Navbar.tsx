import React from 'react';
import { Lock, Unlock, Shield, DownloadCloud } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    const baseClass = "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300";
    
    if (isActive) {
      if (path === '/encrypt') return `${baseClass} bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`;
      if (path === '/decrypt') return `${baseClass} bg-cyan-500/10 text-cyan-400 border border-cyan-500/20`;
      if (path === '/retrieve') return `${baseClass} bg-indigo-500/10 text-indigo-400 border border-indigo-500/20`;
      return baseClass;
    }
    
    return `${baseClass} text-slate-400 hover:text-white hover:bg-slate-800`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-black" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            SecureVault
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/encrypt" className={getLinkClass('/encrypt')}>
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Encrypt</span>
          </Link>
          <Link to="/retrieve" className={getLinkClass('/retrieve')}>
            <DownloadCloud className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Receive</span>
          </Link>
          <Link to="/decrypt" className={getLinkClass('/decrypt')}>
            <Unlock className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Decrypt</span>
          </Link>
        </div>
      </div>
      
      {/* Scroll Progress Bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 origin-left"
        style={{ scaleX }}
      />
    </nav>
  );
};

export default Navbar;