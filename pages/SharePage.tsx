import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Lock, RefreshCw, CheckCircle, AlertCircle, Copy, Clock, CloudUpload, Archive } from 'lucide-react';
import { encryptFile } from '../utils/crypto';
import { FileProcessState } from '../types';

const SharePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [useGzip, setUseGzip] = useState(true); // Default to true for sharing
  const [expiry, setExpiry] = useState('1d');
  const [processState, setProcessState] = useState<FileProcessState>({ status: 'idle' });
  const [shareLink, setShareLink] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setProcessState({ status: 'idle' });
      setShareLink(null);
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !password) return;
    
    if (password !== confirmPassword) {
      setProcessState({ status: 'error', message: 'Passwords do not match.' });
      return;
    }

    setProcessState({ status: 'processing', message: 'Encrypting file locally...', progress: 0 });

    try {
      // 1. Local Encryption
      const encryptedBlob = await encryptFile(file, password, useGzip);
      
      // 2. Simulate Upload Process
      setProcessState({ status: 'processing', message: 'Uploading securely...', progress: 30 });
      
      // Mock upload progress animation
      const interval = setInterval(() => {
        setProcessState(prev => {
          if (prev.progress && prev.progress >= 95) {
            clearInterval(interval);
            return prev;
          }
          return { ...prev, progress: (prev.progress || 30) + 5 };
        });
      }, 100);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      clearInterval(interval);

      // 3. Generate Mock Link
      const randomId = Math.random().toString(36).substring(2, 10);
      setShareLink(`https://securevault.app/s/${randomId}`);
      setProcessState({ status: 'success', message: 'File Uploaded & Secured' });

    } catch (error) {
      console.error(error);
      setProcessState({ status: 'error', message: 'Processing failed. Please try again.' });
    }
  };

  const copyToClipboard = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-6 pb-12 flex flex-col items-center justify-center bg-slate-950 text-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl"
      >
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Share2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold">Secure Share</h1>
          </div>

          <form onSubmit={handleShare} className="space-y-6">
            
            {/* File Input */}
            <div className="relative group">
              <input 
                type="file" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                file 
                  ? 'border-indigo-500/50 bg-indigo-500/5' 
                  : 'border-slate-700 bg-slate-800/30 group-hover:border-slate-500 group-hover:bg-slate-800/50'
              }`}>
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="w-8 h-8 text-indigo-400" />
                    <span className="font-medium text-indigo-100">{file.name}</span>
                    <span className="text-xs text-indigo-400/60">{(file.size / 1024).toFixed(2)} KB</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <CloudUpload className="w-8 h-8 mb-2" />
                    <span className="font-medium">Drop file to share</span>
                  </div>
                )}
              </div>
            </div>

            {/* Passwords */}
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-700"
                  placeholder="Set a password for this link"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-3 focus:outline-none transition-all placeholder:text-slate-700 ${
                    password && confirmPassword && password !== confirmPassword 
                      ? 'border-red-500/50 focus:border-red-500' 
                      : 'border-slate-700 focus:border-indigo-500'
                  }`}
                  placeholder="Repeat password"
                />
              </div>
            </div>

            {/* Settings Row */}
            <div className="grid grid-cols-2 gap-4">
               {/* Timeframe */}
               <div className="bg-slate-950 rounded-xl border border-slate-800 p-3">
                  <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                    <Clock className="w-4 h-4" /> Expiration
                  </label>
                  <select 
                    value={expiry} 
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="1h">1 Hour</option>
                    <option value="24h">24 Hours</option>
                    <option value="3d">3 Days</option>
                    <option value="7d">7 Days (Max)</option>
                  </select>
               </div>

               {/* Compression */}
               <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Archive className="w-4 h-4" /> Compression
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <div className="relative inline-flex items-center">
                      <input type="checkbox" checked={useGzip} onChange={(e) => setUseGzip(e.target.checked)} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                    </div>
                    <span className="text-xs text-indigo-300/80">
                      {useGzip ? 'Enabled (Auto)' : 'Disabled'}
                    </span>
                  </label>
               </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
              <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-200/60 leading-relaxed">
                <strong>Server Disclaimer:</strong> The encrypted file will be stored on our servers for {expiry === '7d' ? '7 days' : expiry === '3d' ? '3 days' : expiry === '24h' ? '24 hours' : '1 hour'} and then permanently deleted. We cannot recover files after they expire.
              </p>
            </div>

            {/* Action Area */}
            <AnimatePresence mode='wait'>
              {processState.status === 'error' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  {processState.message}
                </motion.div>
              )}
            </AnimatePresence>

            {processState.status === 'success' && shareLink ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-4 flex items-center justify-between gap-2 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                  <code className="text-indigo-300 text-sm truncate flex-1 font-mono">{shareLink}</code>
                  <button 
                    type="button"
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-indigo-500/20 rounded-lg text-indigo-400 transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setProcessState({ status: 'idle' });
                    setShareLink(null);
                    setFile(null);
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="w-full py-3 text-sm text-slate-500 hover:text-white transition-colors"
                >
                  Share another file
                </button>
              </motion.div>
            ) : (
              <button 
                type="submit"
                disabled={processState.status === 'processing' || !file || !password}
                className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(99,102,241,0.2)]"
              >
                {processState.status === 'processing' ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> 
                    {processState.progress ? `Uploading ${processState.progress}%` : 'Processing...'}
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Encrypt & Create Link
                  </>
                )}
              </button>
            )}

          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default SharePage;