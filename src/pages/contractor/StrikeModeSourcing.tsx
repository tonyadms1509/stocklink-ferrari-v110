
import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization.tsx';
import { useData } from '../../hooks/useDataContext.tsx';
import { useCurrency } from '../../hooks/useCurrency.tsx';
import { 
    FireIcon, RadioIcon, 
    ArrowLeftIcon, ArrowPathIcon, ShoppingCartIcon,
    ClockIcon, MapPinIcon, CheckCircleIcon, SparklesIcon,
    BoltIcon, TruckIcon, SignalIcon
} from '@heroicons/react/24/solid';
import { useToast } from '../../hooks/useToast.tsx';
import { GoogleGenAI, Type } from '@google/genai';
import AnimatedNumber from '../../components/AnimatedNumber.tsx';
import EmptyState from '../../components/EmptyState.tsx';

const RadarScanner = ({ scanStage }: { scanStage: string }) => (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in-scale">
        <div className="relative w-80 h-80 mb-12">
            <div className="absolute inset-0 rounded-full border-4 border-red-500/10 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-red-500/5 to-transparent"></div>
            <div className="absolute inset-10 rounded-full border-2 border-red-500/20"></div>
            <div className="absolute inset-20 rounded-full border border-red-500/30"></div>
            <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="w-1/2 h-1/2 bg-gradient-to-br from-transparent via-red-500/30 to-red-500/80 absolute top-0 right-0 origin-bottom-left animate-[spin_3s_linear_infinite] rounded-tr-full filter blur-xl"></div>
            </div>
            <div className="absolute inset-0 m-auto w-4 h-4 bg-white rounded-full shadow-[0_0_30px_#ef4444] z-10 animate-pulse"></div>
            {/* Supply Blips */}
            <div className="absolute top-20 left-20 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
            <div className="absolute bottom-24 right-32 w-2 h-2 bg-emerald-500 rounded-full animate-ping delay-500"></div>
            <div className="absolute top-1/2 right-12 w-2 h-2 bg-red-500 rounded-full animate-ping delay-1000"></div>
        </div>
        <div className="text-center space-y-4">
            <h3 className="text-3xl font-black text-gray-100 uppercase tracking-tighter italic leading-none">GRID <span className="text-red-600">INTERCEPT</span></h3>
            <p className="text-xs font-black text-red-500 uppercase tracking-[0.5em] animate-pulse">{scanStage}</p>
        </div>
    </div>
);

const RequestPulse: React.FC<{ request: any }> = ({ request }) => {
    return (
        <div className="bg-slate-900 border border-white/5 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group mb-6 animate-fade-in-up breathe-red text-left">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                 <div className="flex items-center gap-8">
                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center bg-red-600 shadow-[0_0_50px_rgba(220,0,0,0.4)] animate-pulse border-2 border-red-400 transition-transform group-hover:scale-110`}>
                        <RadioIcon className="h-10 w-10 text-white"/>
                    </div>
                    <div className="text-left">
                         <div className="flex items-center gap-3 mb-2">
                             <span className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">EMERGENCY STRIKE ACTIVE</span>
                             <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                             <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest font-mono">NODE_UID: {request.id.slice(-6)}</span>
                         </div>
                         <h2 className="text-5xl font-black italic tracking-tighter uppercase text-white leading-none">{request.productName}</h2>
                         <p className="text-slate-500 font-bold text-sm mt-3 uppercase tracking-widest">Required Payload: <span className="text-white">{request.quantity} Units</span> • Sector Alpha</p>
                    </div>
                 </div>

                 <div className="flex gap-12 text-right">
                     <div>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Intercept Window</p>
                         <p className="text-4xl font-black text-white italic tracking-tighter">{request.deadlineMins} MINS</p>
                     </div>
                     <div className="h-16 w-px bg-white/5 hidden md:block"></div>
                     <div>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Handshake</p>
                         <p className="text-2xl font-black text-red-500 uppercase italic tracking-tighter animate-pulse">{request.status}</p>
                     </div>
                 </div>
            </div>
        </div>
    );
}

const StrikeModeSourcing: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { emergencyRequests, createStrikeRequest } = useData();
    const { showToast } = useToast();
    
    const [itemName, setItemName] = useState('');
    const [qty, setQty] = useState(1);
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [scanStage, setScanStage] = useState('Initializing Handshake...');

    const handleLaunch = async () => {
        if (!itemName.trim() || !process.env.API_KEY) return;
        setIsBroadcasting(true);
        
        const stages = [
            'PROVISIONING NEURAL LINK...',
            'LOCATING REGIONAL SUPPLY BLIPS...',
            'ESTABLISHING TRANSPORT VECTOR...',
            'COMMITTING HANDSHAKE TO GRID...'
        ];

        let stageIdx = 0;
        const interval = setInterval(() => {
            setScanStage(stages[stageIdx % stages.length]);
            stageIdx++;
        }, 1200);

        try {
            await createStrikeRequest({
                productName: itemName,
                quantity: qty,
                deadlineMins: 120,
                location: { lat: -26.1, lon: 28.0 }
            });
            
            setTimeout(() => {
                clearInterval(interval);
                setIsBroadcasting(false);
                setItemName('');
                setQty(1);
                showToast("Emergency Strike Signal Transmitted", "success");
            }, 5000);
        } catch (e) {
            clearInterval(interval);
            setIsBroadcasting(false);
        }
    };

    return (
        <div className="pb-20 max-w-7xl mx-auto space-y-12 font-sans selection:bg-blue-500/30 overflow-hidden text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12">
                <div className="text-left">
                    <div className="flex items-center gap-3 mb-4 text-red-600">
                         <FireIcon className="h-8 w-8 animate-pulse shadow-[0_0_20px_#ef4444]" />
                         <span className="text-[12px] font-black uppercase tracking-[0.6em] text-red-600 italic">STRIKE MODE CORE v80.5</span>
                    </div>
                    <h1 className="text-8xl font-black tracking-tighter italic uppercase text-white leading-none">THE <span className="text-red-600">STRIKE</span></h1>
                    <p className="text-slate-500 mt-6 font-mono text-sm tracking-widest uppercase max-w-2xl leading-relaxed">Immediate 120-minute fulfillment protocol for critical project stalls. Access the live provincial supply buffer.</p>
                </div>
                {onBack && (
                    <button onClick={onBack} className="bg-white/5 hover:bg-white/10 text-slate-400 font-black py-4 px-10 rounded-2xl border border-white/10 uppercase tracking-widest text-[10px] transition-all transform active:scale-95">
                        Abort Mission
                    </button>
                )}
            </div>

            {isBroadcasting ? (
                <div className="bg-slate-900 border border-white/5 rounded-[4rem] p-24 shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid opacity-10"></div>
                    <RadarScanner scanStage={scanStage} />
                </div>
            ) : (
                <>
                    <div className="bg-slate-900 rounded-[4rem] p-16 border border-white/10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-carbon opacity-10"></div>
                        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000"><BoltIcon className="h-64 w-64 text-red-600"/></div>
                        <div className="relative z-10 text-left">
                            <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-10 flex items-center gap-5">
                                <RadioIcon className="h-10 w-10 text-red-600" />
                                Initiate <span className="text-red-600">Signal Blast</span>
                            </h3>

                            <div className="flex flex-col md:flex-row gap-6 items-end">
                                <div className="flex-grow w-full">
                                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest">Emergency Payload Identifier</label>
                                    <input 
                                        type="text" 
                                        value={itemName}
                                        onChange={e => setItemName(e.target.value)}
                                        placeholder="e.g. 50 BAGS CEMENT 42.5N"
                                        className="w-full p-6 bg-white/5 border-2 border-white/5 rounded-[2.5rem] text-3xl font-black text-white italic focus:border-red-600 outline-none transition-all placeholder:text-slate-700 shadow-inner"
                                    />
                                </div>
                                <div className="w-full md:w-32">
                                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest">Load</label>
                                    <input 
                                        type="number" 
                                        value={qty}
                                        onChange={e => setQty(parseInt(e.target.value) || 1)}
                                        className="w-full p-6 bg-white/5 border-2 border-white/5 rounded-[2.5rem] text-3xl font-black text-white text-center focus:border-red-600 outline-none transition-all"
                                    />
                                </div>
                                <button 
                                    onClick={handleLaunch}
                                    disabled={!itemName.trim()}
                                    className="bg-red-600 hover:bg-red-700 text-white font-black py-7 px-16 rounded-[2.5rem] shadow-2xl shadow-red-900/40 transition-all flex items-center gap-4 uppercase tracking-[0.4em] text-sm transform active:scale-95 disabled:opacity-50 border-4 border-slate-950"
                                >
                                    Launch Signal
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8 text-left">
                        <div className="flex items-center justify-between px-8">
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Active <span className="text-red-600">Intercepts</span></h3>
                            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10 shadow-lg">
                                <div className="w-2 h-2 rounded-full bg-red-600 animate-ping shadow-[0_0_10px_red]"></div>
                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Scanning Grid Nodes</span>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            {emergencyRequests.map(req => <RequestPulse key={req.id} request={req} />)}
                            
                            {emergencyRequests.length === 0 && (
                                <div className="bg-slate-900/50 border-4 border-dashed border-white/5 rounded-[4rem] p-24 flex flex-col items-center justify-center text-center opacity-20 hover:opacity-40 transition-opacity">
                                     <SignalIcon className="h-24 w-24 text-slate-700 mb-8" />
                                     <p className="font-black uppercase tracking-[0.6em] text-xs text-slate-500 max-w-sm leading-loose">No active strike signals detected. Project operations nominal within current sector.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            <div className="fixed bottom-10 right-10 pointer-events-none opacity-[0.02] -z-10 rotate-90 select-none">
                <span className="text-[140px] font-black tracking-tighter text-white uppercase italic">STRIKE HUD</span>
            </div>
        </div>
    );
};

export default StrikeModeSourcing;
