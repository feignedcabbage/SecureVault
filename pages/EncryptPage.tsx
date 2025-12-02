import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileUp, Lock, RefreshCw, CheckCircle, AlertCircle, Download, Archive, 
  Share2, HardDrive, Clock, Copy, CloudUpload, EyeOff, ServerOff
} from 'lucide-react';
import { encryptFile } from '../utils/crypto';
import { FileProcessState } from '../types';

type EncryptMode = 'download' | 'share';

const EncryptPage: React.FC = () => {
  const [mode, setMode] = useState<EncryptMode>('download');
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [useGzip, setUseGzip] = useState(false);
  const [hideFilename, setHideFilename] = useState(false);
  
  // Share specific state
  const [expiry, setExpiry] = useState('24h');
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [serviceAvailable, setServiceAvailable] = useState<boolean>(true);
  const [checkingService, setCheckingService] = useState<boolean>(false);
  
  const [processState, setProcessState] = useState<FileProcessState>({ status: 'idle' });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    // Check service health when mode changes to share
    const checkService = async () => {
      if (mode === 'share') {
        setCheckingService(true);
        try {
            await fetch('https://filecryption.duckdns.org/api/upload', { 
                method: 'POST', 
                body: new FormData() 
            });
            setServiceAvailable(true);
        } catch (e) {
            console.warn("Service check failed:", e);
            if (e instanceof TypeError) {
                 setServiceAvailable(false);
            } else {
                 setServiceAvailable(true);
            }
        } finally {
            setCheckingService(false);
        }
      }
    };
    checkService();
  }, [mode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setProcessState({ status: 'idle' });
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
      setShareCode(null);
    }
  };

  const handleModeChange = (newMode: EncryptMode) => {
    setMode(newMode);
    setProcessState({ status: 'idle' });
    setShareCode(null);
    setDownloadUrl(null);
    if (newMode === 'share') setUseGzip(true);
  };

  const copyToClipboard = () => {
    if (shareCode) {
      navigator.clipboard.writeText(shareCode);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !password) return;
    
    if (password !== confirmPassword) {
      setProcessState({ status: 'error', message: 'Passwords do not match.' });
      return;
    }

    if (mode === 'share' && file.size > 10 * 1024 * 1024) {
      setProcessState({ status: 'error', message: 'File is too large for sharing (Max 10MB).' });
      return;
    }

    setProcessState({ status: 'processing', message: 'Encrypting...', progress: 0 });

    try {
      const encryptedBlob = await encryptFile(file, password, useGzip);

      if (mode === 'download') {
        const url = URL.createObjectURL(encryptedBlob);
        setDownloadUrl(url);
        setProcessState({ status: 'success', message: 'Encryption Complete' });
      } else {
        // Share Mode: Upload to API
        setProcessState({ status: 'processing', message: 'Uploading to Secure Relay...', progress: 50 });
        
        const formData = new FormData();
        formData.append('file', encryptedBlob, 'encrypted_data.bin');
        formData.append('duration', expiry);

        const response = await fetch('https://filecryption.duckdns.org/api/upload', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        setShareCode(data.shareCode);
        setProcessState({ status: 'success', message: 'Ready to share' });
      }

    } catch (error: any) {
      console.error(error);
      setProcessState({ status: 'error', message: error.message || 'Processing failed. Please try again.' });
    }
  };

  const isShare = mode === 'share';
  const primaryColor = isShare ? 'indigo' : 'emerald';

  const getDownloadFilename = () => {
    if (!file) return 'file.enc';
    return hideFilename ? 'secure_vault_data.enc' : `${file.name}.enc`;
  };

  return (
    <div className="min-h-screen pt-24 px-6 pb-12 flex flex-col items-center justify-center bg-slate-950 text-white transition-colors duration-500">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl"
      >
        <div className={`bg-slate-900/50 backdrop-blur-xl border rounded-3xl p-8 shadow-2xl transition-colors duration-500 ${isShare ? 'border-indigo-500/20' : 'border-emerald-500/20'}`}>
          
          {/* Header & Mode Toggle */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${isShare ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                   {isShare ? <Share2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <h1 className="text-2xl font-bold transition-all">{isShare ? 'Secure Share' : 'Encrypt File'}</h1>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleModeChange('download')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  !isShare 
                    ? 'bg-slate-800 text-emerald-400 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HardDrive className="w-4 h-4" /> Save to Device
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('share')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  isShare 
                    ? 'bg-indigo-500/20 text-indigo-400 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CloudUpload className="w-4 h-4" /> Secure Relay
              </button>
            </div>
            
            {/* Service Status Warning */}
            <AnimatePresence>
                {isShare && !serviceAvailable && !checkingService && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2 text-xs"
                    >
                        <ServerOff className="w-4 h-4" />
                        Service Unavailable. The backend relay is unreachable.
                    </motion.div>
                )}
            </AnimatePresence>

          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* File Input */}
            <div className="relative group">
              <input 
                type="file" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                file 
                  ? `border-${primaryColor}-500/50 bg-${primaryColor}-500/5` 
                  : `border-slate-700 bg-slate-800/30 group-hover:border-slate-500 group-hover:bg-slate-800/50`
              }`}>
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className={`w-8 h-8 text-${primaryColor}-400`} />
                    <span className={`font-medium text-${primaryColor}-100`}>{file.name}</span>
                    <span className={`text-xs text-${primaryColor}-400/60`}>{(file.size / 1024).toFixed(2)} KB</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <FileUp className="w-8 h-8 mb-2" />
                    <span className="font-medium">
                      {isShare ? 'Drop file to share (Max 10MB)' : 'Drop file to encrypt'}
                    </span>
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
                  className={`w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-${primaryColor}-500 focus:ring-1 focus:ring-${primaryColor}-500 transition-all placeholder:text-slate-700`}
                  placeholder="Enter a strong password"
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
                      : `border-slate-700 focus:border-${primaryColor}-500`
                  }`}
                  placeholder="Repeat password"
                />
              </div>
            </div>

            {/* Shared Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Compression */}
                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <Archive className="w-5 h-5 text-amber-400" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Compress</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide">GZIP</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={useGzip} onChange={(e) => setUseGzip(e.target.checked)} className="sr-only peer" />
                    <div className={`w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isShare ? 'peer-checked:bg-indigo-500' : 'peer-checked:bg-emerald-500'}`}></div>
                  </label>
                </div>

                {/* Hide Filename */}
                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <EyeOff className="w-5 h-5 text-slate-400" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Hide Name</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide">Privacy</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={hideFilename} onChange={(e) => setHideFilename(e.target.checked)} className="sr-only peer" />
                    <div className={`w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isShare ? 'peer-checked:bg-indigo-500' : 'peer-checked:bg-emerald-500'}`}></div>
                  </label>
                </div>
            </div>

            {/* Share Specific Options */}
            <AnimatePresence>
              {isShare && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 mb-4">
                      <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                        <Clock className="w-4 h-4" /> Code Expiration
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

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                    <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-indigo-200/60 leading-relaxed">
                      <strong>Server Relay:</strong> Files are stored temporarily for {expiry}. We cannot see content (E2EE). 10MB Limit.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Area */}
            <AnimatePresence mode='wait'>
              {processState.status === 'error' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm mb-4"
                >
                  <AlertCircle className="w-4 h-4" />
                  {processState.message}
                </motion.div>
              )}
            </AnimatePresence>

            {processState.status === 'success' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {isShare && shareCode ? (
                  // SHARE SUCCESS UI
                  <>
                     <div className="bg-slate-950 border border-indigo-500/30 rounded-xl p-6 flex flex-col items-center gap-4 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                      <div className="text-sm text-indigo-300 uppercase tracking-widest font-semibold">Share Code</div>
                      <code className="text-2xl md:text-3xl text-white font-mono font-bold tracking-tight text-center">{shareCode}</code>
                      <button 
                        type="button"
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg text-indigo-300 transition-colors text-sm"
                      >
                        <Copy className="w-4 h-4" /> Copy Code
                      </button>
                    </div>
                    <p className="text-center text-xs text-slate-500">Share this code securely with the recipient.</p>
                    <button 
                      type="button"
                      onClick={() => {
                        setProcessState({ status: 'idle' });
                        setShareCode(null);
                        setFile(null);
                        setPassword('');
                        setConfirmPassword('');
                        setHideFilename(false);
                      }}
                      className="w-full py-3 text-sm text-slate-500 hover:text-white transition-colors"
                    >
                      Share another file
                    </button>
                  </>
                ) : (
                  // DOWNLOAD SUCCESS UI
                  <>
                    <a 
                      href={downloadUrl!} 
                      download={getDownloadFilename()}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                      <Download className="w-5 h-5" /> Download Encrypted File
                    </a>
                    <button 
                      type="button"
                      onClick={() => {
                        setProcessState({ status: 'idle' });
                        setDownloadUrl(null);
                        setFile(null);
                        setPassword('');
                        setConfirmPassword('');
                        setHideFilename(false);
                      }}
                      className="w-full py-3 text-sm text-slate-500 hover:text-white transition-colors text-center"
                    >
                      Encrypt another file
                    </button>
                  </>
                )}
              </motion.div>
            ) : (
              // DEFAULT ACTION BUTTON
              <button 
                type="submit"
                disabled={processState.status === 'processing' || !file || !password || (isShare && !serviceAvailable)}
                className={`w-full flex items-center justify-center gap-2 text-white font-bold py-4 rounded-xl transition-all ${
                  isShare 
                    ? 'bg-indigo-500 hover:bg-indigo-400 shadow-[0_4px_20px_rgba(99,102,241,0.2)]' 
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_4px_20px_rgba(16,185,129,0.2)]'
                } disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none`}
              >
                {processState.status === 'processing' ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> 
                    {processState.progress ? `Processing` : 'Processing...'}
                  </>
                ) : (
                   isShare ? 'Upload to Relay' : 'Encrypt File'
                )}
              </button>
            )}

          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default EncryptPage;