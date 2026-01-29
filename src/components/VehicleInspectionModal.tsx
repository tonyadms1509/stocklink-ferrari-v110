import React, { useState } from 'react';
import { XMarkIcon, ShieldCheckIcon, TruckIcon, BoltIcon } from '@heroicons/react/24/solid';

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
        { id: 'license', label: 'Operational Clearence (Disc)', checked: false },
    ]);

    const allVerified = checks.every(c => c.checked);

    const toggleCheck = (id: string) => {
        setChecks(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
    };

    return (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-[100] p-4 animate-fade-in backdrop-blur-md">
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
                </div>

                <div className="p-8 pt-0">
                    <button
                        onClick={onComplete}
                        disabled={!allVerified}
                        className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all transform active:scale-95 border-4 border-slate-950 ${allVerified ? 'bg-white text-slate-950 hover:bg-slate-100' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                    >
                        {allVerified ? "Ignite Grid" : "Finalize Integrity"}
                    </button>
                    <div className="mt-6 flex items-center justify-center gap-2 opacity-30">
                        <BoltIcon className="h-3 w-3 text-red-500"/>
                        <span className="text-[8px] font-black uppercase tracking-widest">Protocol Sync established 2025</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleInspectionModal;