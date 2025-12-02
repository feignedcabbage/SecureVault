import React, { useRef, MouseEvent, ReactNode } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, ArrowRight, FileKey, ChevronDown, Lock, LockOpen, 
  Eye, EyeOff, Archive, 
  Ghost, HardDrive, FileText, Sparkles, DownloadCloud
} from 'lucide-react';

// --- Animated Icon Components ---

interface AnimatedIconProps {
  className?: string;
}

const AnimatedLock: React.FC<AnimatedIconProps> = ({ className = "w-12 h-12" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <motion.div
        initial={{ opacity: 1, scale: 1, rotateY: 0 }}
        whileInView={{ opacity: 0, scale: 0.5, rotateY: 90 }}
        viewport={{ amount: 0.6 }} // Wait until 60% visible
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center text-rose-500"
      >
        <LockOpen className="w-full h-full" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 1.5, rotateY: -90 }}
        whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
        viewport={{ amount: 0.6 }}
        transition={{ duration: 1.2, ease: "backOut", delay: 0.4 }} // Delayed start
        className="absolute inset-0 flex items-center justify-center text-emerald-400"
      >
        <Lock className="w-full h-full" />
      </motion.div>
    </div>
  );
};

const AnimatedZeroKnowledge: React.FC<AnimatedIconProps> = ({ className = "w-12 h-12" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* 1. Start with Eye Open */}
      <motion.div
        initial={{ opacity: 1, filter: "blur(0px)" }}
        whileInView={{ opacity: 0, filter: "blur(10px)" }}
        viewport={{ amount: 0.6 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 flex items-center justify-center text-cyan-400"
      >
        <Eye className="w-full h-full" />
      </motion.div>

      {/* 2. Brief flash of Eye Off */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: [0, 1, 0], scale: [0.8, 1.1, 0.8] }}
        viewport={{ amount: 0.6 }}
        transition={{ duration: 2, times: [0, 0.4, 1] }}
        className="absolute inset-0 flex items-center justify-center text-slate-400"
      >
        <EyeOff className="w-full h-full opacity-50" />
      </motion.div>
      
      {/* 3. Final Shield State */}
      <motion.div
        initial={{ pathLength: 0, opacity: 0, scale: 0.8 }}
        whileInView={{ pathLength: 1, opacity: 1, scale: 1 }}
        viewport={{ amount: 0.6 }}
        transition={{ duration: 1.5, delay: 0.8, type: "spring" }}
        className="absolute inset-0 flex items-center justify-center text-cyan-500"
      >
        <ShieldCheck className="w-full h-full" />
      </motion.div>
    </div>
  );
};

const AnimatedCompression: React.FC<AnimatedIconProps> = ({ className = "w-12 h-12" }) => {
  // Total animation duration approx 4.5s
  const duration = 4.5;
  
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Top Press Bar */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        whileInView={{ y: [-60, -60, -22, -22, -60], opacity: [0, 1, 1, 1, 0] }}
        viewport={{ amount: 0.6 }}
        transition={{ duration: duration, times: [0, 0.2, 0.5, 0.7, 1], ease: "easeInOut" }}
        className="absolute w-[80%] h-2 bg-amber-500 rounded-full z-20 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
      />

      {/* Bottom Press Bar */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        whileInView={{ y: [60, 60, 22, 22, 60], opacity: [0, 1, 1, 1, 0] }}
        viewport={{ amount: 0.6 }}
        transition={{ duration: duration, times: [0, 0.2, 0.5, 0.7, 1], ease: "easeInOut" }}
        className="absolute w-[80%] h-2 bg-amber-500 rounded-full z-20 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
      />

      {/* Stack of Files - Top */}
      <motion.div
        initial={{ y: -25, opacity: 0, scale: 1 }}
        whileInView={{ 
          y: [-25, -25, 0, 0], 
          opacity: [0, 1, 1, 0],
          scale: [1, 1, 0.9, 0]
        }}
        viewport={{ amount: 0.6 }}
        transition={{ duration: duration, times: [0, 0.1, 0.5, 0.55] }}
        className="absolute text-amber-200/50 w-[60%] h-[60%]"
      >
        <FileText className="w-full h-full" />
      </motion.div>

      {/* Stack of Files - Middle */}
      <motion.div
        initial={{ y: 0, opacity: 0, scale: 1 }}
        whileInView={{ 
          opacity: [0, 1, 1, 0],
          scale: [1, 1, 0.9, 0] // Squish slightly before vanishing
        }}
        viewport={{ amount: 0.6 }}
        transition={{ duration: duration, times: [0, 0.1, 0.5, 0.55] }}
        className="absolute text-amber-200 w-[60%] h-[60%]"
      >
        <FileText className="w-full h-full" />
      </motion.div>

      {/* Stack of Files - Bottom */}
      <motion.div
        initial={{ y: 25, opacity: 0, scale: 1 }}
        whileInView={{ 
          y: [25, 25, 0, 0], 
          opacity: [0, 1, 1, 0],
          scale: [1, 1, 0.9, 0]
        }}
        viewport={{ amount: 0.6 }}
        transition={{ duration: duration, times: [0, 0.1, 0.5, 0.55] }}
        className="absolute text-amber-200/50 w-[60%] h-[60%]"
      >
        <FileText className="w-full h-full" />
      </motion.div>

      {/* Impact Flash */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 2] }}
        viewport={{ amount: 0.6 }}
        transition={{ duration: 0.4, delay: duration * 0.5 }}
        className="absolute w-12 h-12 bg-amber-400 rounded-full blur-md z-30"
      />

      {/* Final Compressed Archive */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: [0, 0, 0.8, 1.1, 1], opacity: [0, 0, 1, 1, 1] }}
        viewport={{ amount: 0.6 }}
        transition={{ duration: duration, times: [0, 0.55, 0.6, 0.8, 1] }}
        className="absolute text-amber-500 w-[70%] h-[70%] z-10"
      >
        <Archive className="w-full h-full" />
      </motion.div>

    </div>
  );
};

const AnimatedEphemeral: React.FC<AnimatedIconProps> = ({ className = "w-12 h-12" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Server fading out slowly */}
      <motion.div
        initial={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
        whileInView={{ opacity: 0, filter: "blur(20px)", scale: 0.9 }}
        viewport={{ amount: 0.6 }}
        transition={{ duration: 2.5, ease: "easeInOut" }} // Very slow fade
        className="absolute inset-0 flex items-center justify-center text-pink-500"
      >
        <HardDrive className="w-full h-full" />
      </motion.div>

      {/* Ghost floating up slowly */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.5 }}
        whileInView={{ opacity: 1, y: -5, scale: 1.1 }}
        viewport={{ amount: 0.6 }}
        transition={{ delay: 1.0, duration: 2.0, ease: "easeOut" }}
        className="absolute inset-0 flex items-center justify-center text-pink-300"
      >
        <Ghost className="w-full h-full" />
      </motion.div>
      
      {/* Sparkles appearing late */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0] }}
        viewport={{ amount: 0.6 }}
        transition={{ delay: 2.0, duration: 2, repeat: Infinity, repeatDelay: 1 }}
        className="absolute -top-2 -right-2 w-[40%] h-[40%] text-white"
      >
        <Sparkles className="w-full h-full" />
      </motion.div>
    </div>
  );
};


// --- Spotlight Card Component ---
interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  index: number;
  colorHex: string; // Hex for the spotlight
  gradientClass: string; // Tailwind class for the orb
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon, 
  index, 
  colorHex,
  gradientClass
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      className="sticky w-full max-w-5xl mx-auto mb-24 rounded-3xl overflow-hidden border border-white/10 bg-slate-900/90 backdrop-blur-xl shadow-2xl"
      style={{ 
        top: `calc(15vh + ${index * 60}px)`,
        height: '550px', // Fixed height for consistency
        zIndex: index + 1
      }}
      initial={{ opacity: 0, y: 100, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.0, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.3 }} // Trigger card reveal earlier
      onMouseMove={handleMouseMove}
    >
      <div 
        className="group relative h-full flex flex-col md:flex-row items-center p-8 md:p-12 gap-12"
      >
        {/* Spotlight Effect (Mouse Tracking) */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                650px circle at ${mouseX}px ${mouseY}px,
                ${colorHex}15,
                transparent 80%
              )
            `,
          }}
        />

        {/* Text Content */}
        <div className="flex-1 relative z-10 flex flex-col justify-center h-full">
          <div className="mb-6 inline-flex">
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5 shadow-inner">
               {/* Small Icon rendered with specific size */}
               {React.isValidElement(icon) 
                  ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-8 h-8" })
                  : icon
               }
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
            {title}
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed max-w-md">
            {description}
          </p>
        </div>

        {/* Abstract Visual (Right Side) */}
        <div className="flex-1 w-full h-full min-h-[300px] bg-slate-950/30 rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-center">
           
           {/* Static Ambient Glow */}
           <div className={`absolute w-64 h-64 rounded-full ${gradientClass} opacity-20 blur-[80px]`}></div>
           
           {/* Pulsing Core */}
           <div className="relative z-10">
              <div className={`w-32 h-32 rounded-full ${gradientClass} opacity-10 animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-xl`}></div>
              
              <div className="relative z-20 w-full h-full transform transition-transform duration-700 group-hover:scale-110">
                {/* Clone the icon but large for the graphic */}
                {React.isValidElement(icon) 
                  ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { 
                      className: `w-40 h-40 drop-shadow-[0_0_25px_rgba(255,255,255,0.1)]` 
                    })
                  : icon
               }
              </div>
           </div>

           {/* Grid Lines overlay */}
           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]"></div>
        </div>
      </div>
    </motion.div>
  );
};

const LandingPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Parallax effects
  const heroTextY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 0.95]);

  // Feature Data - Using animated components
  const features = [
    {
      title: "AES-GCM Encryption",
      description: "Military-grade 256-bit encryption authenticated with Galois/Counter Mode. Your data is mathematically locked before it ever touches your disk.",
      icon: <AnimatedLock />,
      colorHex: "#10b981", // Emerald-500
      gradientClass: "bg-emerald-500",
    },
    {
      title: "Zero Knowledge",
      description: "We never see your passwords or files. Everything happens locally in your browser's memory using the Web Crypto API.",
      icon: <AnimatedZeroKnowledge />,
      colorHex: "#06b6d4", // Cyan-500
      gradientClass: "bg-cyan-500",
    },
    {
      title: "Smart Compression",
      description: "Optional GZIP compression runs before encryption, saving space and adding an entropy layer to your secure archives.",
      icon: <AnimatedCompression />,
      colorHex: "#f59e0b", // Amber-500
      gradientClass: "bg-amber-500",
    },
    {
      title: "Ephemeral Processing",
      description: "No servers. No databases. No traces. Once you close the tab, all session keys and file data are instantly wiped from memory.",
      icon: <AnimatedEphemeral />,
      colorHex: "#ec4899", // Pink-500
      gradientClass: "bg-pink-500",
    }
  ];

  return (
    <div ref={containerRef} className="bg-slate-950 text-white relative selection:bg-emerald-500/30 selection:text-emerald-50">
      
      {/* Background Noise/Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:48px_48px]"></div>
        <div className="absolute left-0 top-0 -z-10 h-[800px] w-[800px] rounded-full bg-emerald-500/5 blur-[120px]"></div>
        <div className="absolute right-0 bottom-0 -z-10 h-[600px] w-[600px] rounded-full bg-cyan-500/5 blur-[100px]"></div>
      </div>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center relative z-10 overflow-hidden pb-20">
        <motion.div 
          style={{ y: heroTextY, opacity: heroOpacity, scale: heroScale }}
          className="text-center px-6 max-w-6xl mx-auto z-20 flex flex-col items-center"
        >
          {/* Badge Removed per request */}
          
          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-500"
          >
            Privacy, <br className="hidden md:block" /> Encrypted.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            The ultimate client-side encryption tool. Secure your files with AES-GCM 
            before they ever leave your device. No servers, no tracking, pure mathematics.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link 
                to="/encrypt" 
                className="group relative px-8 py-4 bg-white text-slate-950 font-bold rounded-full text-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center gap-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                Start Encrypting <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/decrypt" 
                className="px-8 py-4 bg-slate-900 text-white font-semibold rounded-full text-lg border border-slate-700 hover:bg-slate-800 transition-all hover:border-slate-500 flex items-center gap-2"
              >
                Unlock Files <FileKey className="w-4 h-4" />
              </Link>
            </div>

            <Link 
              to="/retrieve" 
              className="group flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors text-sm font-medium mt-2"
            >
              <DownloadCloud className="w-4 h-4 group-hover:animate-bounce" /> Got a share code? Retrieve file here
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          style={{ opacity: heroOpacity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-xs uppercase tracking-widest font-medium">Scroll to explore</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </section>

      {/* Feature Stacking Section */}
      <section className="relative px-6 pb-40">
        <div className="max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              index={index}
              {...feature}
            />
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl font-bold mb-8 tracking-tight">Ready to secure your data?</h2>
          <p className="text-slate-400 text-xl mb-12">
            Open source, free, and designed for the paranoid. <br/>
            Your files never touch a cloud server.
          </p>
          <Link 
            to="/encrypt" 
            className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold rounded-2xl text-xl hover:scale-105 transition-transform shadow-[0_10px_40px_rgba(16,185,129,0.3)]"
          >
            Launch Vault <ShieldCheck className="w-6 h-6" />
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-slate-600 text-sm relative z-10 border-t border-white/5 bg-slate-950">
        <p>&copy; {new Date().getFullYear()} Secure Vault. Client-side encryption powered by Web Crypto API.</p>
      </footer>
    </div>
  );
};

export default LandingPage;