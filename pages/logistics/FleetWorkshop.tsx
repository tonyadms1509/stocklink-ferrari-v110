import React, { useState, useRef } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useCurrency } from '../../hooks/useCurrency';
import { GoogleGenAI, Type, Part } from '@google/genai';
import { 
    Wrench, Sparkles, Camera, ShieldCheck, 
    RefreshCcw, AlertTriangle, Truck,
    Cpu, Activity, Gauge, Zap, FileText,
    ArrowUpRight, Microscope
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import AnimatedNumber from '../../components/AnimatedNumber';

const fileToBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [header, data] = result.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1];
            if (mimeType && data) resolve({ mimeType, data });
            else reject(new Error("Document intake failed."));
        };
        reader.onerror = error => reject(error);
    });
};

const DiagnosticGauge: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div className="bg-black/40 border border-white/5 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center shadow-inner group">
        <div className="relative w-32 h-16 overflow-hidden mb-4">
            <svg viewBox="0 0 100 50" className="w-full h-full">
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={color} strokeWidth="6" strokeDasharray="125.6" strokeDashoffset={125.6 - (value / 100) * 125.6} className="transition-all duration-1000" strokeLinecap="round" opacity="0.3" />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 text-center">
                <span className="text-xl font-black italic text-white tracking-tighter">{value}%</span>
            </div>
        </div>
        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-blue-400 transition-colors">{label}</span>
    </div>
);

const FleetWorkshop: React.FC = () => {
    const { vehicles = [] } = useData();
    const { showToast } = useToast();
    
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [report, setReport] = useState<any | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const selectedVehicle = vehicles.find((v:any) => v.id === selectedVehicleId);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setReport(null);
        }
    };

    const executeNeuralInspection = async () => {
        if (!image || !process.env.API_KEY) {
            showToast("System Authorization Failure", "error");
            return;
        }
        setIsAnalyzing(true);
        setReport(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const { mimeType, data } = await fileToBase64(image);
            const imagePart: Part = { inlineData: { mimeType, data } };

            const prompt = `
                Perform a high-fidelity Neural Mechanical Audit on this construction vehicle node.
                Vehicle Context: ${selectedVehicle?.makeModel || 'Heavy Utility Chassis'}.
                1. Detect mechanical anomalies in the provided visual feed (Engine, Tyres, or Chassis).
                2. Calculate an "Integrity Score" (0-100%).
                3. Calculate "Mission Readiness" (0-100%).
                4. List 3 specific technical remediation protocols.
                
                Return JSON.
            `;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    integrity: { type: Type.NUMBER },
                    readiness: { type: Type.NUMBER },
                    findings: { type: Type.ARRAY, items: { type: Type.STRING } },
                    remediations: { type: Type.ARRAY, items: { type: Type.STRING } },
                    verdict: { type: Type.STRING }
                },
                required: ['integrity', 'readiness', 'findings', 'remediations', 'verdict']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: [imagePart, { text: prompt }] },
                config: { responseMimeType: 'application/json', responseSchema }
            });

            setReport(JSON.parse(response.text || '{}'));
            showToast("Neural Diagnostic Sealed", "success");
        } catch (e) {
            showToast("Vision Link Failure", "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-12 animate-fade-in pb-20 text-left selection:bg-red-600/30">
            {/* Workshop Header */}
            <div className="bg-slate-900 rounded-[4rem] p-16 text-white shadow-2xl border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-carbon opacity-10"></div>
                <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000"><Wrench size={400} className="text-red-600"/></div>
                
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12 text-left">
                    <div className="text-left flex-grow">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-red-600 rounded-2xl animate-pulse shadow-[0_0_30px_#dc2626]">
                                <Wrench size={24} className="text-white" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-red-500 italic">FLEET_SERVICE_NODE_v100</span>
                        </div>
                        <h2 className="text-7xl font-black italic tracking-tighter uppercase text-white leading-none">WORKSHOP <span className="text-red-600">LIFT</span></h2>
                        <p className="text-slate-500 font-mono text-sm mt-6 tracking-[0.3em] uppercase max-w-xl leading-relaxed italic text-left">"Elite mechanical grounding. Sync visual sensor feeds to the National Maintenance Registry."</p>
                    </div>

                    <div className="bg-black/40 border border-white/5 p-10 rounded-[3rem] shadow-inner backdrop-blur-xl min-w-[320px]">
                         <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4 ml-2">Assign Node to Lift</label>
                         <select 
                            value={selectedVehicleId} 
                            onChange={e => setSelectedVehicleId(e.target.value)}
                            className="w-full p-5 bg-white/5 border-2 border-white/5 rounded-3xl text-white font-black italic text-xl uppercase outline-none focus:border-red-600 appearance-none cursor-pointer"
                         >
                            <option value="" disabled className="bg-slate-950">Select Chassis...</option>
                            {vehicles.map((v:any) => <option key={v.id} value={v.id} className="bg-slate-950">{v.makeModel} ({v.registration})</option>)}
                         </select>
                         <div className="mt-6 flex items-center gap-3 justify-center text-left">
                             <div className={`w-2 h-2 rounded-full ${selectedVehicleId ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></div>
                             <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Connection: {selectedVehicleId ? 'SECURE' : 'ISOLATED'}</span>
                         </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
                {/* Vision Deck */}
                <div className="lg:col-span-7 space-y-8">
                     <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative h-[550px] rounded-[4rem] border-4 border-dashed transition-all duration-700 cursor-pointer flex flex-col items-center justify-center overflow-hidden ${previewUrl ? 'border-red-600/50 bg-black shadow-2xl' : 'border-white/5 bg-slate-900 hover:bg-slate-800'}`}
                    >
                         <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none"></div>
                         {!previewUrl ? (
                             <div className="text-center animate-fade-in text-left">
                                 <div className="p-8 bg-slate-800 rounded-full mb-8 group-hover:scale-110 transition-transform shadow-xl mx-auto flex items-center justify-center"><Camera size={48} className="text-slate-500"/></div>
                                 <p className="text-xl font-black text-slate-400 uppercase italic tracking-tighter">Initialize Visual Link</p>
                                 <p className="text-[10px] text-slate-600 mt-2 font-black uppercase tracking-widest">Uplink Chassis Telemetry (JPG/PNG)</p>
                             </div>
                         ) : (
                             <>
                                <img src={previewUrl} className={`w-full h-full object-cover transition-all duration-1000 ${isAnalyzing ? 'blur-md grayscale opacity-40' : 'opacity-80 group-hover:opacity-100'}`} alt="Visual Feed" />
                                {isAnalyzing && (
                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-left">
                                        <div className="w-full h-1 bg-red-600 absolute top-0 shadow-[0_0_30px_red] animate-scan"></div>
                                        <Microscope size={64} className="text-red-600 animate-pulse mb-8" />
                                        <p className="text-[11px] font-black text-red-500 uppercase tracking-[0.8em] italic">De-coding Molecular Stress...</p>
                                    </div>
                                )}
                                {!isAnalyzing && !report && (
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-left">
                                        <div className="bg-red-600 p-4 rounded-full shadow-2xl shadow-red-900/40"><RefreshCcw size={32} className="text-white"/></div>
                                    </div>
                                )}
                             </>
                         )}
                         <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                </div>

                {/* Diagnostics Panel */}
                <div className="lg:col-span-5 h-[550px] flex flex-col text-left">
                    <div className="bg-slate-900 border border-white/5 rounded-[4rem] p-12 shadow-2xl flex flex-col h-full relative overflow-hidden group">
                        <div className="absolute inset-0 bg-carbon opacity-5"></div>
                        <div className="relative z-10 flex flex-col h-full text-left">
                            <div className="flex justify-between items-start mb-12 text-left">
                                <div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">REDLINE <span className="text-red-600">AUDIT</span></h3>
                                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-2 font-mono">Sensory Handshake Result</p>
                                </div>
                                {previewUrl && !report && (
                                    <button 
                                        onClick={executeNeuralInspection}
                                        disabled={isAnalyzing || !selectedVehicleId}
                                        className="bg-red-600 hover:bg-red-700 text-white font-black px-10 py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl transition-all transform active:scale-95 disabled:opacity-30 border border-white/10"
                                    >
                                        Execute Scan
                                    </button>
                                )}
                            </div>

                            <div className="flex-grow overflow-y-auto custom-scrollbar pr-4 space-y-10 text-left">
                                {report ? (
                                    <div className="space-y-12 animate-fade-in-up text-left">
                                        <div className="grid grid-cols-2 gap-8 text-left">
                                            <DiagnosticGauge label="Chassis Integrity" value={report.integrity} color="#DC0000" />
                                            <DiagnosticGauge label="Mission Readiness" value={report.readiness} color="#2563eb" />
                                        </div>

                                        <div className="space-y-6 text-left">
                                             <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2 ml-4">Anomaly Log</h4>
                                             {report.findings.map((f: string, i: number) => (
                                                 <div key={i} className="flex items-start gap-4 p-5 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all shadow-inner text-left">
                                                     <div className="w-1.5 h-10 bg-blue-600 rounded-full group-hover:scale-y-110 transition-transform shadow-lg"></div>
                                                     <p className="text-sm font-medium text-slate-300 italic leading-relaxed">"{f}"</p>
                                                 </div>
                                             ))}
                                        </div>

                                        <div className="space-y-6 text-left">
                                             <h4 className="text-[9px] font-black text-red-600 uppercase tracking-widest border-b border-white/5 pb-2 ml-4">Remediation Protocols</h4>
                                             {report.remediations.map((p: string, i: number) => (
                                                 <div key={i} className="bg-red-600/10 p-6 rounded-3xl border border-red-500/20 flex items-start gap-5 text-left">
                                                     <Zap size={16} className="text-red-500 shrink-0 mt-1" />
                                                     <p className="text-xs font-black text-red-100 italic leading-relaxed uppercase tracking-tight">{p}</p>
                                                 </div>
                                             ))}
                                        </div>

                                        <div className="bg-white p-8 rounded-[3rem] text-slate-950 shadow-2xl border-4 border-slate-950 text-left">
                                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 leading-none">Diagnostic Verdict</p>
                                            <p className="text-2xl font-black italic tracking-tighter uppercase leading-none">{report.verdict}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 text-center">
                                        <Activity size={64} className="h-16 w-16 mb-6 text-slate-500 mx-auto" />
                                        <p className="text-sm font-black uppercase tracking-widest text-slate-500 max-w-xs leading-loose">Initialize visual sensor uplink to begin <br/> Chassis Molecular Audit</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Maintenance History Hub */}
            <div className="bg-slate-900 border border-white/10 rounded-[4rem] p-12 shadow-2xl text-left relative overflow-hidden group">
                 <div className="absolute inset-0 bg-carbon opacity-5"></div>
                 <div className="flex justify-between items-center mb-12 relative z-10 text-left">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Maintenance <span className="text-red-600">Schematic</span></h3>
                    <button className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all border border-white/5 shadow-xl"><FileText size={20}/></button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 text-left">
                     {[1,2,3].map(i => (
                         <div key={i} className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all duration-500 group/item text-left">
                             <div className="flex justify-between items-start mb-6">
                                 <p className="text-[10px] font-mono font-black text-slate-600">LOG_v42.0{i}</p>
                                 <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black px-2 py-0.5 rounded-full border border-emerald-500/20">Verified</span>
                             </div>
                             <h4 className="text-xl font-black text-white italic uppercase tracking-tight mb-2">Engine Manifold Sync</h4>
                             <p className="text-xs text-slate-500 leading-relaxed italic">Successful neural calibration of fuel injection grid nodes.</p>
                             <div className="mt-8 flex justify-between items-center pt-6 border-t border-white/5">
                                 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Oct 12, 2024</span>
                                 <ArrowUpRight size={14} className="text-slate-700 group-hover/item:text-blue-500 transition-colors" />
                             </div>
                         </div>
                     ))}
                 </div>
            </div>

            <div className="fixed bottom-10 left-10 pointer-events-none opacity-[0.02] -z-10 rotate-90 select-none text-left">
                <span className="text-[180px] font-black tracking-tighter text-white uppercase italic leading-none">WORKSHOP_DECK</span>
            </div>
            
            <style>{`
                @keyframes scan { 0% { top: 0%; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
                .animate-scan { animation: scan 4s linear infinite; }
            `}</style>
        </div>
    );
};

export default FleetWorkshop;