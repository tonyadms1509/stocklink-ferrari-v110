import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../hooks/useDataContext.tsx';
import { useCurrency } from '../../hooks/useCurrency.tsx';
import { GoogleGenAI, Type, Part } from '@google/genai';
import { 
    Wrench, Sparkles, Camera, ShieldCheck, 
    RefreshCcw, AlertTriangle, Truck,
    Cpu, Activity, Gauge, Zap, FileText,
    ArrowUpRight, Microscope, CheckCircle,
    ArrowDown, Power, Play, Lock, Unlock
} from 'lucide-react';
import { useToast } from '../../hooks/useToast.tsx';
import AnimatedNumber from '../../components/AnimatedNumber.tsx';

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
    const { vehicles = [], updateAsset } = useData();
    const { showToast } = useToast();
    
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [report, setReport] = useState<any | null>(null);
    const [releaseStep, setReleaseStep] = useState<number>(0); // 0: Idle, 1: Disengaging Locks, 2: Lowering, 3: Engine Pulse, 4: Ready
    const fileInputRef = useRef<HTMLInputElement>(null);

    const selectedVehicle = vehicles.find((v:any) => v.id === selectedVehicleId);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setReport(null);
            setReleaseStep(0);
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

    const runReleaseSequence = () => {
        if (releaseStep > 0) return;
        setReleaseStep(1);
        
        // Sequence of mechanical steps
        setTimeout(() => setReleaseStep(2), 2000);
        setTimeout(() => setReleaseStep(3), 4000);
        setTimeout(() => setReleaseStep(4), 6000);
        
        // Final completion and data update
        setTimeout(async () => {
            if (selectedVehicleId) {
                await updateAsset(selectedVehicleId, { status: 'Available' });
                showToast("Node Re-entered Active Grid", "success");
                window.location.hash = '#/fleet';
            }
        }, 8000);
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
                            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-red-500 italic">FLEET_SERVICE_NODE_v110</span>
                        </div>
                        <h2 className="text-7xl font-black italic tracking-tighter uppercase text-white leading-none">WORKSHOP <span className="text-red-600">LIFT</span></h2>
                        <p className="text-slate-500 font-mono text-sm mt-6 tracking-[0.3em] uppercase max-w-xl leading-relaxed italic text-left">"Step out of maintenance. Execute high-fidelity mechanical release sequences to re-sync with the national grid."</p>
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
                             <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Hydraulics: {selectedVehicleId ? 'LOCKED' : 'IDLE'}</span>
                         </div>
                    </div>
                </div>
            </div>

            {releaseStep === 0 ? (
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

                                            <div className="bg-white p-8 rounded-[3rem] text-slate-950 shadow-2xl border-4 border-slate-950 text-left mb-6">
                                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 leading-none">Diagnostic Verdict</p>
                                                <p className="text-2xl font-black italic tracking-tighter uppercase leading-none">{report.verdict}</p>
                                            </div>

                                            {report.readiness > 80 && (
                                                <button 
                                                    onClick={runReleaseSequence}
                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-8 rounded-[3rem] uppercase tracking-[0.4em] text-sm shadow-[0_0_60px_rgba(37,99,235,0.4)] transition-all transform active:scale-95 border-4 border-slate-950 flex items-center justify-center gap-6"
                                                >
                                                    <Play className="h-8 w-8 fill-current" />
                                                    INITIATE RELEASE PROTOCOL
                                                </button>
                                            )}
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
            ) : (
                <div className="bg-slate-950 rounded-[5rem] p-24 border-4 border-slate-900 shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden animate-fade-in-scale text-center">
                    <div className="absolute inset-0 bg-carbon opacity-30"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent"></div>
                    
                    <div className="relative z-10 space-y-16">
                        <div className="flex flex-col items-center">
                             <div className={`w-40 h-40 rounded-full border-8 border-slate-800 flex items-center justify-center transition-all duration-1000 ${releaseStep >= 4 ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_60px_rgba(16,185,129,0.4)]' : 'bg-slate-900'}`}>
                                {releaseStep === 1 && <Lock className="h-16 w-16 text-red-500 animate-pulse" />}
                                {releaseStep === 2 && <Unlock className="h-16 w-16 text-blue-500 animate-bounce" />}
                                {releaseStep === 3 && <Zap className="h-16 w-16 text-amber-400 animate-ping" />}
                                {releaseStep === 4 && <CheckCircle className="h-20 w-20 text-white" />}
                             </div>
                             <h3 className="mt-12 text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
                                {releaseStep === 1 && "DISENGAGING HYDRAULIC LOCKS"}
                                {releaseStep === 2 && "LOWERING CHASSIS MODULE"}
                                {releaseStep === 3 && "ENGINE PULSE CALIBRATION"}
                                {releaseStep === 4 && "MISSION READY"}
                             </h3>
                             <p className="text-blue-500 font-black uppercase tracking-[0.6em] text-[12px] mt-6 animate-pulse">SEQUENCE STAGE 0{releaseStep} / 04</p>
                        </div>

                        <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
                            {[1,2,3,4].map(step => (
                                <div key={step} className={`h-2 rounded-full transition-all duration-1000 ${releaseStep >= step ? 'bg-blue-500 shadow-[0_0_15px_#3b82f6]' : 'bg-slate-800'}`}></div>
                            ))}
                        </div>

                        <div className="bg-black/40 p-10 rounded-[3rem] border border-white/5 max-w-md mx-auto shadow-inner text-left font-mono">
                            <p className={`text-[10px] transition-opacity duration-300 ${releaseStep >= 1 ? 'text-emerald-500 opacity-100' : 'text-slate-800 opacity-20'}`}>[SYS] RELEASING HYDRAULIC NODE GP-04... OK</p>
                            <p className={`text-[10px] mt-2 transition-opacity duration-300 ${releaseStep >= 2 ? 'text-emerald-500 opacity-100' : 'text-slate-800 opacity-20'}`}>[CHASSIS] LIFT DESCENT AT 0.4M/S... OK</p>
                            <p className={`text-[10px] mt-2 transition-opacity duration-300 ${releaseStep >= 3 ? 'text-emerald-500 opacity-100' : 'text-slate-800 opacity-20'}`}>[V12] INJECTOR SYNC AT 850RPM... OK</p>
                            <p className={`text-[10px] mt-2 transition-opacity duration-300 ${releaseStep >= 4 ? 'text-emerald-500 opacity-100' : 'text-slate-800 opacity-20'}`}>[GRID] HANDSHAKE SECURE. NODE ACTIVE.</p>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes scan { 0% { top: 0%; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
                .animate-scan { animation: scan 4s linear infinite; }
                .breathe-red { animation: breathe-red-workshop 5s infinite ease-in-out; }
                @keyframes breathe-red-workshop { 
                    0%, 100% { border-color: rgba(220,0,0,0.1); } 
                    50% { border-color: rgba(220,0,0,0.4); box-shadow: 0 0 50px rgba(220,0,0,0.1); } 
                }
            `}</style>
        </div>
    );
};

export default FleetWorkshop;