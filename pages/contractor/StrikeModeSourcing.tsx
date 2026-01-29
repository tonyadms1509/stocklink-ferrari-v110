import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization.tsx';
import { useData } from '../../hooks/useDataContext.tsx';
import { useCurrency } from '../../hooks/useCurrency.tsx';
import { 
    FireIcon, RadioIcon, 
    ArrowLeftIcon, ArrowPathIcon,
    ClockIcon, CheckCircleIcon, SparklesIcon,
    BoltIcon, SignalIcon
} from '@heroicons/react/24/solid';
import { useToast } from '../../hooks/useToast.tsx';
import { GoogleGenAI } from '@google/genai';
import EmptyState from '../../components/EmptyState.tsx';

const RadarScanner = ({ scanStage }: { scanStage: string }) => (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in-scale">
        <div className="relative w-96 h-96 mb-16">
            <div className="absolute inset-0 rounded-full border-4 border-red-500/10 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-red-500/5 to-transparent"></div>
            <div className="absolute inset-10 rounded-full border-2 border-red-500/20"></div>
            <div className="absolute inset-20 rounded-full border border-red-500/30"></div>
            <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="w-1/2 h-1/2 bg-gradient-to-br from-transparent via-red-500/30 to-red-500/80 absolute top-0 right-0 origin-bottom-left animate-[spin_2s_linear_infinite] rounded-tr-full filter blur-2xl"></div>
            </div>
            <div className="absolute inset-0 m-auto w-6 h-6 bg-white rounded-full shadow-[0_0_40px_#ef4444] z-10 animate-pulse"></div>
            {/* Supply Blips */}
            <div className="absolute top-20 left-24 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
            <div className="absolute bottom-24 right-32 w-3 h-3 bg-emerald-500 rounded-full animate-ping delay-500"></div>
            <div className="absolute top-1/3 right-14 w-3 h-3 bg-red-500 rounded-full animate-ping delay-1000"></div>
        </div>
        <div className="text-center space-y-6">
            <h3 className="text-5xl font-black text-gray-100 uppercase tracking-tighter italic leading-none">GRID <span className="text-red-600">INTERCEPT</span></h3>
            <p className="text-sm font-black text-red-500 uppercase tracking-[0.8em] animate-pulse">{scanStage}</p>
        </div>
    </div>
);

const RequestPulse: React.FC<{ request: any }> = ({ request }) => {
    const { isRuggedMode } = useData();
    return (
        <div className={`p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group mb-8 animate-fade-in-up text-left border-2 transition-all duration-700 ${isRuggedMode ? 'bg-white border-black border-[4px]' : 'bg-slate-900 border-white/5 breathe-red'}`}>
            {!isRuggedMode && <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent"></div>}
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12 text-left">
                 <div className="flex items-center gap-10">
                    <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 border-4 ${isRuggedMode ? 'bg-black border-black text-white' : 'bg-red-600 border-red-400 shadow-red-900/40 animate-pulse'}`}>
                        <RadioIcon className="h-12 w-12 text-white"/>
                    </div>
                    <div className="text-left">
                         <div className="flex items-center gap-4 mb-4">
                             <span className={`font-black text-[11px] uppercase tracking-[0.6em] animate-pulse ${isRuggedMode ? 'text-black font-black' : 'text-red-500'}`}>STRIKE PROTOCOL ACTIVE</span>
                             <div className={`w-2 h-2 rounded-full ${isRuggedMode ? 'bg-black' : 'bg-red-600'}`}></div>
                             <span className={`text-[10px] font-black uppercase tracking-widest font-mono ${isRuggedMode ? 'text-black' : 'text-slate-600'}`}>NODE_UID: {request.id?.slice(-6) || 'SECURE'}</span>
                         </div>
                         <h2 className={`text-6xl font-black italic uppercase tracking-tighter leading-none ${isRuggedMode ? 'text-black' : 'text-white'}`}>{request.productName}</h2>
                         <p className={`font-bold text-base mt-4 uppercase tracking-widest ${isRuggedMode ? 'text-black' : 'text-slate-500'}`}>Payload: <span className={isRuggedMode ? 'text-black underline' : 'text-white'}>{request.quantity} Units</span> • Sector Alpha Deployment</p>
                    </div>
                 </div>

                 <div className="flex gap-16 text-right items-end">
                     <div>
                         <p className={`text-[11px] font-black uppercase tracking-widest mb-3 ${isRuggedMode ? 'text-black' : 'text-slate-500'}`}>Intercept Window</p>
                         <p className={`text-5xl font-black italic tracking-tighter ${isRuggedMode ? 'text-black' : 'text-white'}`}>{request.deadlineMins} MINS</p>
                     </div>
                     <div className={`h-20 w-px hidden md:block ${isRuggedMode ? 'bg-black' : 'bg-white/5'}`}></div>
                     <div>
                         <p className={`text-[11px] font-black uppercase tracking-widest mb-3 ${isRuggedMode ? 'text-black' : 'text-slate-500'}`}>Node Handshake</p>
                         <p className={`text-3xl font-black uppercase italic tracking-tighter animate-pulse ${isRuggedMode ? 'text-black' : 'text-red-500'}`}>{request.status}</p>
                     </div>
                 </div>
            </div>
        </div>
    );
}

const StrikeModeSourcing: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { emergencyRequests = [], createStrikeRequest, isRuggedMode } = useData();
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
        <div className={`pb-24 max-w-7xl mx-auto space-y-16 font-sans selection:bg-red-600/30 overflow-hidden text-left transition-all duration-700 ${isRuggedMode ? 'rugged-view' : ''}`}>
            <header className={`flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b-2 pb-12 transition-all duration-700 ${isRuggedMode ? 'border-black' : 'border-white/5'}`}>
                <div className="text-left">
                    <div className="flex items-center gap-4 mb-6">
                         <FireIcon className={`h-10 w-10 animate-pulse ${isRuggedMode ? 'text-black' : 'text-red-600 shadow-[0_0_30px_#ef4444]'}`} />
                         <span className={`text-[14px] font-black uppercase tracking-[0.8em] italic ${isRuggedMode ? 'text-black' : 'text-red-600'}`}>STRIKE MODE CORE v110</span>
                    </div>
                    <h1 className={`text-8xl md:text-[10rem] font-black tracking-tighter italic uppercase text-white leading-[0.7] ${isRuggedMode ? 'text-black' : 'text-white'}`}>THE <span className={isRuggedMode ? 'text-orange-600' : 'text-red-600 text-glow-red'}>STRIKE</span></h1>
                    <p className={`mt-8 font-mono text-sm tracking-widest uppercase max-w-3xl leading-loose ${isRuggedMode ? 'text-black font-black' : 'text-slate-500 italic'}`}>Immediate 120-minute fulfillment protocol for critical project stalls. Decrypt the live national supply buffer for emergency payload delivery.</p>
                </div>
                {onBack && (
                    <button onClick={onBack} className={`font-black py-5 px-14 rounded-3xl border-4 uppercase tracking-[0.4em] text-[11px] transition-all transform active:scale-95 shadow-2xl ${isRuggedMode ? 'bg-black text-white border-black' : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/10'}`}>
                        Abort Mission
                    </button>
                )}
            </header>

            {isBroadcasting ? (
                <div className={`rounded-[5rem] p-32 shadow-inner relative overflow-hidden transition-all duration-700 ${isRuggedMode ? 'bg-slate-50 border-black border-4' : 'bg-slate-900 border-white/5'}`}>
                    <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none"></div>
                    <RadarScanner scanStage={scanStage} />
                </div>
            ) : (
                <>
                    <div className={`p-16 rounded-[4rem] shadow-2xl relative overflow-hidden group border-2 transition-all duration-700 ${isRuggedMode ? 'bg-white border-black border-[4px]' : 'bg-slate-900 border-white/10'}`}>
                        {!isRuggedMode && <div className="absolute inset-0 bg-carbon opacity-10"></div>}
                        <div className={`absolute top-0 right-0 p-16 opacity-5 group-hover:scale-110 transition-transform duration-1000 ${isRuggedMode ? 'text-black' : 'text-red-600'}`}><BoltIcon className="h-[500px] w-[500px]"/></div>
                        
                        <div className="relative z-10 text-left">
                            <h3 className={`text-4xl font-black italic uppercase tracking-tighter mb-12 flex items-center gap-6 ${isRuggedMode ? 'text-black font-black' : 'text-white'}`}>
                                <RadioIcon className={`h-12 w-12 ${isRuggedMode ? 'text-black' : 'text-red-600 shadow-[0_0_20px_red] animate-pulse'}`} />
                                Initiate <span className={isRuggedMode ? 'text-black underline' : 'text-red-600'}>Signal Blast</span>
                            </h3>

                            <div className="flex flex-col xl:flex-row gap-8 items-end w-full">
                                <div className="flex-grow w-full text-left">
                                    <label className={`block text-[11px] font-black uppercase mb-4 tracking-[0.4em] ml-4 ${isRuggedMode ? 'text-black' : 'text-slate-500'}`}>Emergency Payload Identification Code</label>
                                    <input 
                                        type="text" 
                                        value={itemName}
                                        onChange={e => setItemName(e.target.value)}
                                        placeholder="e.g. 50 BAGS CEMENT 42.5N"
                                        className={`w-full p-8 border-4 rounded-[3rem] text-4xl font-black italic outline-none transition-all placeholder:opacity-20 shadow-inner ${isRuggedMode ? 'bg-slate-50 border-black text-black' : 'bg-black/40 border-white/5 text-white focus:border-red-600'}`}
                                    />
                                </div>
                                <div className="w-full xl:w-48 text-left">
                                    <label className={`block text-[11px] font-black uppercase mb-4 tracking-[0.4em] ml-4 ${isRuggedMode ? 'text-black' : 'text-slate-500'}`}>Load</label>
                                    <input 
                                        type="number" 
                                        value={qty}
                                        onChange={e => setQty(parseInt(e.target.value) || 1)}
                                        className={`w-full p-8 border-4 rounded-[3rem] text-4xl font-black text-center outline-none transition-all ${isRuggedMode ? 'bg-slate-50 border-black text-black' : 'bg-black/40 border-white/5 text-white focus:border-red-600'}`}
                                    />
                                </div>
                                <button 
                                    onClick={handleLaunch}
                                    disabled={!itemName.trim()}
                                    className={`w-full xl:w-auto h-[104px] font-black px-24 rounded-[3rem] shadow-2xl transition-all transform active:scale-95 disabled:opacity-30 border-4 uppercase tracking-[0.6em] text-sm flex items-center justify-center gap-4 ${isRuggedMode ? 'bg-black text-white border-black' : 'bg-red-600 hover:bg-red-700 text-white border-slate-950 shadow-red-900/40'}`}
                                >
                                    <BoltIcon className="h-6 w-6"/> Launch
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-12 text-left pt-12">
                        <div className="flex items-center justify-between px-10">
                            <h3 className={`text-3xl font-black italic uppercase tracking-tighter ${isRuggedMode ? 'text-black underline' : 'text-white'}`}>Active <span className="text-red-600">Intercepts</span></h3>
                            <div className={`flex items-center gap-4 px-6 py-2 rounded-full border transition-all duration-700 ${isRuggedMode ? 'bg-black border-black text-white' : 'bg-white/5 border-white/10 shadow-2xl'}`}>
                                <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_red] ${isRuggedMode ? 'bg-white' : 'bg-red-600 animate-ping'}`}></div>
                                <span className="text-[11px] font-black uppercase tracking-[0.4em]">Scanning Grid Nodes</span>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            {emergencyRequests.map(req => <RequestPulse key={req.id} request={req} />)}
                            
                            {emergencyRequests.length === 0 && (
                                <div className={`border-4 border-dashed rounded-[5rem] p-32 flex flex-col items-center justify-center text-center group transition-all duration-700 ${isRuggedMode ? 'bg-slate-50 border-black' : 'bg-slate-900/50 border-white/5 opacity-30 hover:opacity-50'}`}>
                                     <SignalIcon className={`h-32 w-32 mb-10 transition-transform duration-1000 group-hover:scale-110 ${isRuggedMode ? 'text-black' : 'text-slate-700'}`} />
                                     <p className={`font-black uppercase tracking-[0.8em] text-[12px] max-w-sm leading-loose italic ${isRuggedMode ? 'text-black' : 'text-slate-500'}`}>"No active strike signals detected. Project operations nominal within current sector buffer."</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            <div className={`fixed bottom-12 right-12 pointer-events-none opacity-[0.03] -z-10 rotate-90 select-none ${isRuggedMode ? 'text-black font-black' : 'text-white'}`}>
                <span className="text-[220px] font-black tracking-tighter uppercase italic leading-none">STRIKE HUD</span>
            </div>
        </div>
    );
};

export default StrikeModeSourcing;