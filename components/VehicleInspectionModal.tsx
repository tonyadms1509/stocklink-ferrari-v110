
import React, { useState, useEffect } from 'react';
import { XMarkIcon, ShieldCheckIcon, TruckIcon, BoltIcon, Gauge, Cpu } from 'lucide-react';
import { SparklesIcon } from '@heroicons/react/24/solid';

interface VehicleInspectionModalProps {
    onClose: () => void;
    onComplete: () => void;
}

const VehicleInspectionModal: React.FC<VehicleInspectionModalProps> = ({ onClose, onComplete }) => {
    const [checks, setChecks] = useState([
        { id: 'tyres', label: 'Unit Traction (Tyres)', checked: false },
        { id: 'lights', label: 'Signal Grid (Lights)', checked: false },
        { id: 'brakes', label: 'Retardation System (Brakes)', checked: false },
        { id: 'fuel', label: 'Energy Reservoir (Fuel/Bat)', checked: false },
        { id: 'license', label: 'Operational Clearance (Disc)', checked: false },
    ]);
    
    const [isIgniting, setIsIgniting] = useState(false);
    const [throttle, setThrottle] = useState(0);

    const allVerified = checks.every(c => c.checked);

    const toggleCheck = (id: string) => {
        setChecks(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
    };

    const handleStartEngine = () => {
        setIsIgniting(true);
    };

    useEffect(() => {
        if (isIgniting && throttle < 100) {
            const timer = setTimeout(() => setThrottle(prev => prev + 2), 20);
            return () => clearTimeout(timer);
        } else if (throttle >= 100) {
            setTimeout(onComplete, 500);
        }
    }, [isIgniting, throttle, onComplete]);

    return (
        <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[100] p-4 animate-fade-in backdrop-blur-md">
            <div className="bg-slate-900 border border-white/10 rounded-[3.5rem] shadow-2xl max-w-sm w-full relative overflow-hidden flex flex-col">
                <div className="bg-red-600 p-8 text-white text-center relative">
                    <div className="absolute inset-0 bg-carbon opacity-10"></div>
                    <TruckIcon className="h-16 w-16 mx-auto mb-4 relative z-10 drop-shadow-xl" />
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter relative z-10 leading-none">PRE-FLIGHT</h2>
                    <p className="text-red-100 text-[10px] font-black uppercase tracking-widest mt-2 relative z-10">Unit Integrity Audit Required</p>
                </div>
                
                <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-20">
                    <XMarkIcon className="h-6 w-6"/>
                </button>

                <div className="p-8 space-y-3">
                    {!isIgniting ? (
                        <>
                            {checks.map(check => (
                                <button
                                    key={check.id}
                                    onClick={() => toggleCheck(check.id)}
                                    className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between transition-all duration-300 ${check.checked ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                                >
                                    <span className="font-black uppercase tracking-widest text-[10px] italic">{check.label}</span>
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${check.checked ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_emerald]' : 'border-slate-700'}`}>
                                        {check.checked && <ShieldCheckIcon className="h-4 w-4 text-slate-950"/>}
                                    </div>
                                </button>
                            ))}
                        </>
                    ) : (
                        <div className="py-12 space-y-10 flex flex-col items-center">
                            <div className="relative w-48 h-48 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                                    <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={502} strokeDashoffset={502 - (502 * throttle) / 100} className="text-red-600 transition-all duration-75 ease-linear" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <p className="text-5xl font-black italic tracking-tighter text-white">{throttle}%</p>
                                    <p className="text-[10px] font-black uppercase text-red-500 tracking-widest mt-2">Throttle</p>
                                </div>
                                <div className="absolute inset-0 bg-red-600/5 rounded-full animate-pulse"></div>
                            </div>
                            
                            <div className="w-full space-y-4">
                                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 animate-fade-in">
                                    <Cpu className="h-5 w-5 text-blue-400 animate-spin" />
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Neural Link Synchronized</p>
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 animate-fade-in delay-500">
                                    <BoltIcon className="h-5 w-5 text-amber-500 animate-pulse" />
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Engine Manifold Sealed</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-8 pt-0">
                    {!isIgniting ? (
                        <button
                            onClick={handleStartEngine}
                            disabled={!allVerified}
                            className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all transform active:scale-95 border-4 border-slate-950 ${allVerified ? 'bg-white text-slate-950 hover:bg-slate-100' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                        >
                            {allVerified ? "START ENGINE" : "Finalize Integrity"}
                        </button>
                    ) : (
                         <div className="text-center">
                            <span className="text-[9px] font-black uppercase text-slate-600 tracking-[0.4em] animate-pulse italic">Engaging High-Performance Core...</span>
                         </div>
                    )}
                    <div className="mt-6 flex items-center justify-center gap-2 opacity-30">
                        <BoltIcon className="h-3 w-3 text-red-500"/>
                        <span className="text-[8px] font-black uppercase tracking-widest">Ferrari Protocol Sync v80.5</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleInspectionModal;
