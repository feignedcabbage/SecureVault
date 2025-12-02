import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Lock, Unlock, FileText, Clock, ShieldCheck, 
  AlertTriangle, CheckCircle, Server, Eye, KeyRound
} from 'lucide-react';

const DownloadPage: React.FC = () => {
  const { id } = useParams();
  const [status, setStatus] = useState<'fetching' | 'locked' | 'decrypting' | 'success' | 'error'>('fetching');
  const [password, setPassword] = useState('');
  const [shake, setShake] = useState(0);

  // Mock Metadata
  const [meta, setMeta] = useState({
    filename: 'confidential_project_v2.pdf.enc',
    size: '4.2 MB',
    expiry: '23h 15m',
    isCompressed: true
  });

  // Simulate fetching metadata on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('locked');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    // Simulate password validation
    if (password.length < 4) {
      setShake(prev => prev + 1);
      return;
    }

    setStatus('decrypting');

    // Simulate Decryption Process
    setTimeout(() => {
      setStatus('success');
    }, 2000);
  };

  // Generate a dummy file for the download simulation
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob(["This is a simulated decrypted file content from Secure Vault."], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "decrypted_content.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen pt-20 px-6 pb-12 flex flex-col items-center justify-center bg-slate-950 text-white relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e50a_1px,transparent_1px),linear-gradient(to_bottom,#4f46e50a_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        
        {/* Connection Status Badge */}
        <div className="flex justify-center mb-8">
           <motion.div 
             initial={{ width: 0, opacity: 0 }}
             animate={{ width: 'auto', opacity: 1 }}
             className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/50 backdrop-blur-md text-xs text-slate-400 font-mono"
           >
              <div className={`w-2 h-2 rounded-full ${status === 'fetching' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></div>
              {status === 'fetching' ? 'ESTABLISHING SECURE TUNNEL...' : 'E2EE TUNNEL ESTABLISHED'}
           </motion.div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-1 shadow-[0_0_50px_rgba(79,70,229,0.1)]">
          <div className="bg-slate-950/50 rounded-[22px] p-8 relative overflow-hidden">
            
            {/* Decorative Top Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>

            <AnimatePresence mode="wait">
              
              {/* STATE: FETCHING */}
              {status === 'fetching' && (
                <motion.div 
                  key="fetching"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-12"
                >
                  <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    <Server className="absolute inset-0 m-auto w-6 h-6 text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-medium text-indigo-100">Retrieving Container</h2>
                  <p className="text-sm text-indigo-400/60 mt-2">Verifying integrity hash...</p>
                </motion.div>
              )}

              {/* STATE: LOCKED */}
              {(status === 'locked' || status === 'decrypting') && (
                <motion.div
                  key="locked"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                        <Lock className="w-6 h-6" />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-white">Encrypted Archive</h1>
                        <div className="flex items-center gap-2 text-xs text-indigo-300/60 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>Expires in {meta.expiry}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* File Metadata Card */}
                  <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 mb-8 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{meta.filename}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">{meta.size}</span>
                        {meta.isCompressed && (
                          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">GZIP</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleUnlock}>
                    <div className="mb-6 relative">
                      <label className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 ml-1">
                        Decryption Key
                      </label>
                      <motion.div 
                        animate={{ x: shake % 2 === 0 ? 0 : [0, -10, 10, -10, 10, 0] }}
                        transition={{ duration: 0.4 }}
                      >
                        <div className="relative">
                          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                          <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={status === 'decrypting'}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-700"
                            placeholder="Enter password to unlock"
                            autoFocus
                          />
                        </div>
                      </motion.div>
                    </div>

                    <button 
                      type="submit"
                      disabled={status === 'decrypting' || !password}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(99,102,241,0.2)] disabled:shadow-none"
                    >
                      {status === 'decrypting' ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Decrypting...
                        </>
                      ) : (
                        <>
                          <Unlock className="w-5 h-5" /> Unlock & Download
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* STATE: SUCCESS */}
              {status === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400 ring-1 ring-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Decryption Successful</h2>
                  <p className="text-slate-400 mb-8 max-w-xs mx-auto text-sm">
                    Your file has been restored to its original state.
                  </p>
                  
                  <button 
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse"
                  >
                    <Download className="w-5 h-5" /> Save File
                  </button>

                  <div className="mt-8 pt-6 border-t border-slate-800/50">
                     <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                        <ShieldCheck className="w-3 h-3" /> Verifiably decrypted in browser
                     </p>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center space-y-2">
           <div className="flex items-center justify-center gap-1 text-xs text-indigo-300/40">
              <Eye className="w-3 h-3" />
              <span>Zero-knowledge architecture</span>
           </div>
           <p className="text-[10px] text-slate-600">
             ID: {id} &bull; <a href="#" className="hover:text-slate-400 underline decoration-slate-700">Report Abuse</a>
           </p>
        </div>

      </motion.div>
    </div>
  );
};

export default DownloadPage;