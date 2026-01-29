
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { RocketLaunchIcon, SparklesIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import Confetti from './Confetti';

const LaunchCelebration: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timers = [
            setTimeout(() => setStep(1), 1000),
            setTimeout(() => setStep(2), 2500),
            setTimeout(() => setStep(3), 4500),
            setTimeout(() => onClose(), 8000),
        ];
        return () => timers.forEach(clearTimeout);
    }, [onClose]);

    return createPortal(
        <div className="fixed inset-0 z-[10000] bg-slate-950 flex flex-col items-center justify-center text-white overflow-hidden font-sans">
            <Confetti duration={8000} />
            
            {/* Holographic Rays */}
            <div className="absolute inset-0 pointer-events-none">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20 rotate-45 animate-pulse"></div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20 -rotate-45 animate-pulse"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
                {step === 1 && (
                    <div className="animate-fade-in-up flex flex-col items-center">
                        <RocketLaunchIcon className="h-32 w-32 text-blue-500 mb-8 animate-bounce" />
                        <h2 className="text-7xl font-black italic tracking-tighter uppercase mb-4">Ignition <span className="text-blue-600">Success</span></h2>
                        <p className="text-blue-400 font-mono text-xl tracking-[0.4em] uppercase">Bypassing Staging Layer...</p>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in-up flex flex-col items-center">
                        <SparklesIcon className="h-32 w-32 text-yellow-400 mb-8 animate-pulse" />
                        <h2 className="text-7xl font-black italic tracking-tighter uppercase mb-4">Grid <span className="text-yellow-400">Expansion</span></h2>
                        <p className="text-yellow-200 font-mono text-xl tracking-[0.4em] uppercase">Syncing National Wholesalers...</p>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-fade-in-scale flex flex-col items-center">
                        <div className="p-8 rounded-[4rem] bg-emerald-500 shadow-[0_0_100px_rgba(16,185,129,0.4)] mb-10">
                            <ShieldCheckIcon className="h-40 w-40 text-white drop-shadow-2xl" />
                        </div>
                        <h2 className="text-8xl font-black italic tracking-tighter uppercase mb-4 leading-none">SYSTEM <br/> <span className="text-emerald-500">LIVE</span></h2>
                        <div className="mt-8 flex gap-3">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-75"></div>
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-150"></div>
                        </div>
                        <p className="mt-8 text-slate-500 font-black uppercase tracking-[0.5em] text-sm">StockLink Ferrari Production v62.2 Active</p>
                    </div>
                )}
            </div>

            <div className="absolute bottom-10 font-mono text-xs text-slate-800 tracking-widest uppercase">
                Terminal Auth Key: FERRARI_G7_PRODUCTION_ZA
            </div>
        </div>,
        document.body
    );
};

export default LaunchCelebration;
