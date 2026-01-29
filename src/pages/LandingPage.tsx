
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
    Globe, Zap, ShieldCheck, Activity, Radar, Server, Shield
} from 'lucide-react';
import { BoltIcon } from '@heroicons/react/24/solid';
import Logo from '../components/Logo';

const TechnicalLog = ({ text, delay }: { text: string; delay: number }) => {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), delay);
        return () => clearTimeout(t);
    }, [delay]);

    if (!visible) return null;
    return (
        <div className="flex gap-2 font-mono text-[9px] text-blue-400/60 uppercase tracking-widest animate-fade-in text-left">
            <span className="text-blue-600">[SYS]</span> {text}
        </div>
    );
};

const LandingPage: React.FC = () => {
  const { login, startTestDrive } = useAuth();
  const [ignitionState, setIgnitionState] = useState<'idle' | 'scanning' | 'loading'>('idle');
  const [systemLoad, setSystemLoad] = useState(0);

  useEffect(() => {
    if (ignitionState === 'loading') {
        const interval = setInterval(() => {
            setSystemLoad(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => startTestDrive(), 800);
                    return 100;
                }
                return prev + 2;
            });
        }, 300);
        return () => clearInterval(interval);
    }
  }, [ignitionState, startTestDrive]);

  const handleIgnite = () => {
    setIgnitionState('scanning');
    setTimeout(() => setIgnitionState('loading'), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans relative overflow-x-hidden flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-carbon opacity-30"></div>
          <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-red-600/5 rounded-full blur-[180px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[1200px] h-[1200px] bg-blue-600/5 rounded-full blur-[180px] translate-y-1/2 -translate-x-1/3"></div>
      </div>

      <div className="scanline opacity-30"></div>

      <nav className="fixed top-0 left-0 right-0 z-[100] p-10 flex justify-between items-center bg-slate-950/20 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-6 cursor-pointer group" onClick={() => window.location.reload()}>
              <Logo className="h-16 w-14 transition-all duration-700 drop-shadow-[0_0_30px_rgba(220,0,0,0.6)]" />
              <div className="text-left">
                  <span className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">StockLink</span>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.6em] mt-2">OS_REFLINE_v110</p>
              </div>
          </div>
          <div className="flex items-center gap-6">
              <button onClick={() => window.location.hash = '#/login'} className="holographic-glass px-10 py-4 text-slate-300 hover:text-white rounded-2xl transition-all uppercase font-black text-[10px] tracking-widest border border-white/10 shadow-2xl">
                  Grid Authentication
              </button>
          </div>
      </nav>

      <div className="relative z-10 flex flex-col items-center text-center max-w-7xl w-full">
        {ignitionState === 'idle' && (
            <div className="animate-fade-in-up flex flex-col items-center w-full">
                <div className="inline-flex items-center gap-4 px-12 py-4 rounded-full bg-white/5 border border-white/10 mb-20 shadow-2xl backdrop-blur-md">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_15px_#DC0000]"></div>
                    <span className="text-[11px] font-black uppercase tracking-[0.8em] text-red-500">Node Ignition: READY</span>
                </div>

                <div className="relative mb-20 group">
                    <div className="absolute inset-0 bg-red-600/20 blur-[120px] rounded-full animate-pulse transition-all group-hover:bg-red-600/40"></div>
                    <Logo className="h-80 w-64 md:h-[28rem] md:w-96 relative z-10 drop-shadow-[0_0_80px_rgba(220,0,0,0.5)] transform hover:scale-105 transition-transform duration-1000" />
                </div>

                <h1 className="text-7xl md:text-[10rem] font-black text-white tracking-tighter uppercase italic leading-[0.8] mb-12 drop-shadow-2xl text-center">
                    ENGAGE <br/>
                    <span className="text-red-600 text-glow-red">THE GRID.</span>
                </h1>

                <p className="max-w-4xl text-2xl md:text-3xl text-slate-400 font-medium leading-relaxed italic mb-24 opacity-80 px-8 text-center">
                    The masterpiece operating system for South African construction. Engineered for speed, intelligence, and national network synchronization.
                </p>

                <div className="relative group mb-32">
                    <button 
                        onClick={handleIgnite}
                        className="relative w-72 h-72 rounded-full bg-slate-900 border-[16px] border-slate-800 flex flex-col items-center justify-center transition-all duration-700 hover:border-red-600 shadow-[0_0_100px_rgba(0,0,0,0.8)] active:scale-95 group"
                    >
                        <div className="p-10 bg-red-600 rounded-[2.5rem] shadow-2xl shadow-red-900/50 mb-4 group-hover:scale-110 transition-transform">
                            <BoltIcon className="h-14 w-14 text-white" />
                        </div>
                        <span className="text-[14px] font-black uppercase tracking-[0.5em] text-white">Initialize</span>
                        <div className="absolute inset-[-12px] rounded-full border border-dashed border-white/10 animate-[spin_15s_linear_infinite]"></div>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto w-full mb-32">
                    {/* Contractor Card */}
                    <button 
                        onClick={() => login('contractor@stocklink.io', 'ferrari')}
                        className="group bg-slate-100 hover:bg-white text-slate-950 p-10 rounded-[3rem] text-left transition-all hover:scale-105 active:scale-95 shadow-2xl border-b-8 border-slate-300"
                    >
                        <span className="block text-5xl mb-6 grayscale group-hover:grayscale-0 transition-all">🏠</span>
                        <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">The<br/>Contractor</h2>
                        <p className="text-xs font-bold opacity-60 mt-4 uppercase tracking-widest leading-relaxed">Neural Sourcing, Site HUD & Automated Compliance</p>
                    </button>

                    {/* Supplier Card */}
                    <button 
                        onClick={() => login('supplier@stocklink.io', 'ferrari')}
                        className="group bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-10 rounded-[3rem] text-left transition-all hover:scale-105 active:scale-95 shadow-2xl border-b-8 border-black"
                    >
                        <span className="block text-5xl mb-6 grayscale group-hover:grayscale-0 transition-all">🏭</span>
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-white leading-none">The<br/>Supplier</h2>
                        <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest leading-relaxed">Inventory Pulse, Market Intelligence & Fulfill Ops</p>
                    </button>

                    {/* Logistics Card */}
                    <button 
                        onClick={() => login('logistics@stocklink.io', 'ferrari')}
                        className="group bg-blue-600 hover:bg-blue-500 text-white p-10 rounded-[3rem] text-left transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(37,99,235,0.2)] border-b-8 border-blue-800"
                    >
                        <span className="block text-5xl mb-6 grayscale group-hover:grayscale-0 transition-all">🚛</span>
                        <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">The<br/>Logistics</h2>
                        <p className="text-xs font-bold text-blue-100 mt-4 uppercase tracking-widest leading-relaxed">Dispatch Control, Route Optimisation & Fleet Management</p>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full px-8">
                    {[
                        { icon: Globe, label: "National Hub", val: "Sector One" },
                        { icon: Zap, label: "Grid Status", val: "Optimal v110" },
                        { icon: ShieldCheck, label: "Compliance", val: "SANS Verified" },
                        { icon: Activity, label: "Neural Vitals", val: "Nominal" }
                    ].map((feature, i) => (
                        <div key={i} className="holographic-glass p-12 rounded-[4rem] border border-white/5 text-left group hover:border-red-600/30 transition-all shadow-2xl">
                            <feature.icon className="h-10 w-10 text-red-600 mb-10 group-hover:scale-110 transition-transform" />
                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">{feature.label}</p>
                            <p className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">{feature.val}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {ignitionState === 'scanning' && (
            <div className="animate-fade-in flex flex-col items-center py-20 space-y-20 w-full">
                <div className="w-[500px] h-[500px] relative flex items-center justify-center">
                    <Radar className="w-full h-full text-blue-600 animate-pulse" />
                    <div className="absolute inset-0 border-8 border-blue-500/10 rounded-full animate-ping"></div>
                    <div className="absolute inset-32 border-8 border-blue-500/20 rounded-full animate-ping delay-200"></div>
                    <Logo className="absolute inset-0 m-auto h-48 w-40 text-blue-600/40" />
                </div>
                <div className="text-left space-y-6 bg-black/40 p-16 rounded-[4rem] border border-white/5 backdrop-blur-3xl min-w-[600px] shadow-[0_0_80px_rgba(0,0,0,0.5)]">
                    <TechnicalLog text="LOCATING NATIONAL SUPPLY NODES..." delay={200} />
                    <TechnicalLog text="ESTABLISHING ARBITRAGE VECTORS..." delay={600} />
                    <TechnicalLog text="SYNCHRONIZING SITE TELEMETRY..." delay={1000} />
                    <TechnicalLog text="IDENTIFYING PERFORMANCE GAPS..." delay={1400} />
                    <TechnicalLog text="NEURAL HANDSHAKE: SUCCESSFUL_LOCKED" delay={1800} />
                </div>
            </div>
        )}

        {ignitionState === 'loading' && (
            <div className="animate-fade-in flex flex-col items-center py-20 w-full">
                <div className="relative w-[500px] h-[500px] mb-24">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.03)" strokeWidth="4" fill="transparent" />
                        <circle 
                            cx="50" cy="50" r="45" 
                            stroke="#DC0000" strokeWidth="6" 
                            fill="transparent" 
                            strokeDasharray="282.7" 
                            strokeDashoffset={282.7 - (282.7 * systemLoad) / 100}
                            className="transition-all duration-1000 ease-linear drop-shadow-[0_0_30px_#DC0000]"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <Logo className="h-64 w-56 mb-12 text-white animate-pulse" />
                        <p className="text-9xl font-black text-white italic tracking-tighter leading-none">{systemLoad}%</p>
                        <p className="text-[14px] font-black uppercase text-red-500 tracking-[0.8em] mt-10">Grid Saturation</p>
                    </div>
                </div>
                <p className="text-4xl font-black uppercase tracking-[1.5em] text-slate-500 animate-pulse italic text-center">IGNITING CORE...</p>
            </div>
        )}
      </div>

      <div className="ferrari-watermark"></div>
    </div>
  );
};

export default LandingPage;
