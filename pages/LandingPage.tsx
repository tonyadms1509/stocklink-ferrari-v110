
import React from 'react';
import { useAuth } from '../hooks/useAuth.tsx';

const LandingPage: React.FC = () => {
    const { login } = useAuth();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-950 text-slate-100 overflow-x-hidden">
            {/* Ambient Background HUD */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.02)_0%,_transparent_70%)]"></div>
            </div>

            <div className="max-w-6xl space-y-16 animate-fade-in">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-red-600/10 border border-red-600/30 text-red-500 text-[10px] font-black uppercase tracking-[0.4em] shadow-[0_0_20px_rgba(220,38,38,0.1)]">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                        National Grid v110.0
                    </div>
                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8] italic">
                        The Masterpiece <br/>
                        <span className="text-red-600">Operating System.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-3xl mx-auto italic text-center">
                        Precision engineered for the South African grid. <br className="hidden md:block" />
                        Synchronizing contractors, suppliers, and logistics in real-time.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Contractor Card */}
                    <button 
                        /* Fix: Added password to login arguments */
                        onClick={() => login('contractor@stocklink.io', 'ferrari')}
                        className="group bg-slate-100 hover:bg-white text-slate-950 p-10 rounded-[3rem] text-left transition-all hover:scale-105 active:scale-95 shadow-2xl border-b-8 border-slate-300"
                    >
                        <span className="block text-5xl mb-6 grayscale group-hover:grayscale-0 transition-all">🏠</span>
                        <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">The<br/>Contractor</h2>
                        <p className="text-xs font-bold opacity-60 mt-4 uppercase tracking-widest leading-relaxed">Neural Sourcing, Site HUD & Automated Compliance</p>
                    </button>

                    {/* Supplier Card */}
                    <button 
                        /* Fix: Added password to login arguments */
                        onClick={() => login('supplier@stocklink.io', 'ferrari')}
                        className="group bg-slate-900 border border-slate-800 hover:border-amber-500/50 p-10 rounded-[3rem] text-left transition-all hover:scale-105 active:scale-95 shadow-2xl border-b-8 border-black"
                    >
                        <span className="block text-5xl mb-6 grayscale group-hover:grayscale-0 transition-all">🏭</span>
                        <h2 className="text-3xl font-black uppercase tracking-tighter text-white leading-none">The<br/>Supplier</h2>
                        <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest leading-relaxed">Inventory Pulse, Market Intelligence & Fulfill Ops</p>
                    </button>

                    {/* Logistics Card */}
                    <button 
                        /* Fix: Added password to login arguments */
                        onClick={() => login('logistics@stocklink.io', 'ferrari')}
                        className="group bg-blue-600 hover:bg-blue-500 text-white p-10 rounded-[3rem] text-left transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(37,99,235,0.2)] border-b-8 border-blue-800"
                    >
                        <span className="block text-5xl mb-6 grayscale group-hover:grayscale-0 transition-all">🚛</span>
                        <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">The<br/>Logistics</h2>
                        <p className="text-xs font-bold text-blue-100 mt-4 uppercase tracking-widest leading-relaxed">Dispatch Control, Route Optimisation & Fleet Management</p>
                    </button>
                </div>

                {/* Grid Telemetry Stats */}
                <div className="pt-12 flex flex-wrap justify-center gap-16 border-t border-white/5 opacity-50">
                    <div className="flex flex-col items-center">
                        <span className="text-4xl font-black italic tracking-tighter">R14.2M</span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 mt-1">Grid Flux (MTD)</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-4xl font-black italic tracking-tighter text-red-600">842</span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 mt-1">Live Chassis Nodes</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-4xl font-black italic tracking-tighter">1.2ms</span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 mt-1">Sync Latency</span>
                    </div>
                </div>
            </div>

            {/* Subtle HUD Branding */}
            <div className="fixed bottom-10 left-10 pointer-events-none opacity-5">
                <span className="text-[120px] font-black tracking-tighter text-white uppercase italic">FERRARI</span>
            </div>
        </div>
    );
};

export default LandingPage;
