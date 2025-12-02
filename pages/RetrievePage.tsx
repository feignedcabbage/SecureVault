import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DownloadCloud, KeyRound, Lock, Unlock, AlertCircle, CheckCircle, RefreshCw, FileText, Download, FileArchive } from 'lucide-react';
import { decryptFile, DecryptionResult } from '../utils/crypto';
import { FileProcessState } from '../types';

const RetrievePage: React.FC = () => {
  const [step, setStep] = useState<'input-code' | 'fetching' | 'input-password' | 'decrypting' | 'success'>('input-code');
  const [shareCode, setShareCode] = useState('');
  const [password, setPassword] = useState('');
  const [encryptedBlob, setEncryptedBlob] = useState<Blob | null>(null);
  const [fileSize, setFileSize] = useState<string>('');
  const [result, setResult] = useState<DecryptionResult | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  const handleFetchFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareCode) return;

    setStep('fetching');
    setDownloadProgress(0);
    setError(null);

    try {
      const response = await fetch(`https://filecryption.duckdns.org/api/file/${shareCode}`);
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'File not found or expired');
      }

      // Progress Tracking Logic
      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;

      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];

      if (!reader) {
         // Fallback if streams aren't supported
         const blob = await response.blob();
         setEncryptedBlob(blob);
         setFileSize((blob.size / 1024 / 1024).toFixed(2) + ' MB');
         setStep('input-password');
         return;
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        if (value) {
          chunks.push(value);
          loaded += value.length;
          if (total > 0) {
            setDownloadProgress(Math.round((loaded / total) * 100));
          }
        }
      }

      const blob = new Blob(chunks);
      setEncryptedBlob(blob);
      setFileSize((blob.size / 1024 / 1024).toFixed(2) + ' MB');
      setStep('input-password');

    } catch (err: any) {
      setError(err.message || 'Failed to retrieve file');
      setStep('input-code');
    }
  };

  const handleDownloadEncrypted = () => {
    if (!encryptedBlob) return;
    const url = URL.createObjectURL(encryptedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `secure_vault_${shareCode}.enc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!encryptedBlob || !password) return;

    setStep('decrypting');
    setError(null);

    try {
      // Create a File object from the blob to satisfy the decryptFile signature
      const fileToDecrypt = new File([encryptedBlob], "encrypted_content.enc");
      const res = await decryptFile(fileToDecrypt, password);
      
      setResult(res);
      setDownloadUrl(URL.createObjectURL(res.blob));
      setStep('success');

    } catch (err: any) {
      console.error(err);
      setError('Decryption failed. Incorrect password.');
      setStep('input-password');
    }
  };

  const reset = () => {
    setStep('input-code');
    setShareCode('');
    setPassword('');
    setEncryptedBlob(null);
    setResult(null);
    setDownloadUrl(null);
    setError(null);
    setDownloadProgress(0);
  };

  return (
    <div className="min-h-screen pt-20 px-6 pb-12 flex flex-col items-center justify-center bg-slate-950 text-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold">Receive File</h1>
          </div>

          <AnimatePresence mode='wait'>
            
            {/* STEP 1: INPUT SHARE CODE */}
            {(step === 'input-code' || step === 'fetching') && (
              <motion.form 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleFetchFile}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Share Code</label>
                  <input 
                    type="text" 
                    value={shareCode}
                    onChange={(e) => setShareCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-700 font-mono text-center tracking-wider text-lg"
                    placeholder="piano-airport-brisk"
                    autoFocus
                    disabled={step === 'fetching'}
                  />
                  <p className="text-xs text-slate-500 mt-2 text-center">Enter the 3-word phrase provided by the sender</p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm justify-center">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}

                {step === 'fetching' ? (
                  <div className="space-y-2">
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <motion.div 
                        className="bg-indigo-500 h-2.5 rounded-full" 
                        initial={{ width: 0 }}
                        animate={{ width: `${downloadProgress}%` }}
                        transition={{ ease: "linear" }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-indigo-300">
                      <span>Retrieving Data...</span>
                      <span>{downloadProgress}%</span>
                    </div>
                  </div>
                ) : (
                  <button 
                    type="submit"
                    disabled={!shareCode}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(99,102,241,0.2)] disabled:shadow-none"
                  >
                    Find File
                  </button>
                )}
              </motion.form>
            )}

            {/* STEP 2: INPUT PASSWORD OR DOWNLOAD */}
            {(step === 'input-password' || step === 'decrypting') && (
              <motion.form 
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleDecrypt}
                className="space-y-6"
              >
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-200">Encrypted Archive</p>
                    <span className="text-xs text-slate-500">{fileSize}</span>
                  </div>
                  <div className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">Locked</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Decryption Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-700"
                      placeholder="Enter password"
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2 text-sm justify-center">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                    <button 
                      type="submit"
                      disabled={step === 'decrypting' || !password}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(99,102,241,0.2)] disabled:shadow-none"
                    >
                      {step === 'decrypting' ? (
                        <>
                          <Unlock className="w-5 h-5 animate-pulse" /> Decrypting...
                        </>
                      ) : (
                        'Unlock & Download'
                      )}
                    </button>

                    <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-slate-800"></div>
                        <span className="flex-shrink-0 mx-4 text-[10px] text-slate-600 uppercase tracking-widest font-semibold">Options</span>
                        <div className="flex-grow border-t border-slate-800"></div>
                    </div>

                    <button 
                        type="button"
                        onClick={handleDownloadEncrypted}
                        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 rounded-xl transition-all border border-slate-700"
                    >
                        <FileArchive className="w-4 h-4" /> Download Encrypted Archive
                    </button>
                </div>

              </motion.form>
            )}

            {/* STEP 3: SUCCESS */}
            {step === 'success' && result && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400 ring-1 ring-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
                <p className="text-slate-400 mb-6 text-sm">
                  Successfully decrypted <br />
                  <span className="text-emerald-300 font-semibold">{result.filename}</span>
                </p>
                
                <a 
                  href={downloadUrl!} 
                  download={result.filename}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  <Download className="w-5 h-5" /> Save File
                </a>

                <button 
                  onClick={reset}
                  className="mt-6 text-sm text-slate-500 hover:text-white transition-colors"
                >
                  Receive another file
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default RetrievePage;