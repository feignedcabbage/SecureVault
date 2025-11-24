import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Unlock, FileKey, RefreshCw, AlertCircle, Download, CheckCircle } from 'lucide-react';
import { decryptFile } from '../utils/crypto';
import { FileProcessState } from '../types';

const DecryptPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [processState, setProcessState] = useState<FileProcessState>({ status: 'idle' });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [restoredFilename, setRestoredFilename] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setProcessState({ status: 'idle' });
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
      setRestoredFilename('');
    }
  };

  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !password) return;

    setProcessState({ status: 'processing', message: 'Decrypting...' });

    try {
      const { blob, filename } = await decryptFile(file, password);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setRestoredFilename(filename);
      setProcessState({ status: 'success', message: `Decryption Complete` });
    } catch (error) {
      console.error(error);
      setProcessState({ status: 'error', message: 'Invalid password or corrupted file.' });
    }
  };

  return (
    <div className="min-h-screen pt-20 px-6 pb-12 flex flex-col items-center justify-center bg-slate-950 text-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl"
      >
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Unlock className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold">Decrypt File</h1>
          </div>

          <form onSubmit={handleDecrypt} className="space-y-6">
            
            {/* File Input */}
            <div className="relative group">
              <input 
                type="file" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                file 
                  ? 'border-cyan-500/50 bg-cyan-500/5' 
                  : 'border-slate-700 bg-slate-800/30 group-hover:border-slate-500 group-hover:bg-slate-800/50'
              }`}>
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="w-8 h-8 text-cyan-400" />
                    <span className="font-medium text-cyan-100">{file.name}</span>
                    <span className="text-xs text-cyan-400/60">{(file.size / 1024).toFixed(2)} KB</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <FileKey className="w-8 h-8 mb-2" />
                    <span className="font-medium">Drop encrypted file</span>
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Decryption Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-700"
                placeholder="Enter password to unlock"
              />
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

            {processState.status === 'success' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                 <div className="mb-4 text-center text-sm text-cyan-300/80">
                    Restored: <span className="font-semibold text-cyan-200">{restoredFilename}</span>
                 </div>
                <a 
                  href={downloadUrl!} 
                  download={restoredFilename}
                  className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                >
                  <Download className="w-5 h-5" /> Download Decrypted File
                </a>
              </motion.div>
            ) : (
              <button 
                type="submit"
                disabled={processState.status === 'processing' || !file || !password}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-200 disabled:bg-slate-700 disabled:text-slate-500 text-black font-bold py-4 rounded-xl transition-all"
              >
                {processState.status === 'processing' ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> Unlocking...
                  </>
                ) : (
                  'Unlock File'
                )}
              </button>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default DecryptPage;