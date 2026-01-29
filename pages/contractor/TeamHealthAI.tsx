import React, { useState, useMemo, useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { useData } from '../../hooks/useDataContext';
import { 
    HeartIcon, SparklesIcon, UsersIcon, 
    ArrowPathIcon, ChartBarIcon, BoltIcon,
    ShieldCheckIcon, ExclamationTriangleIcon,
    ArrowUpIcon, ArrowDownIcon, UserGroupIcon,
    ClipboardDocumentListIcon, BeakerIcon
} from '@heroicons/react/24/solid';
import { GoogleGenAI, Type } from '@google/genai';
import { useToast } from '../../hooks/useToast';
import AnimatedNumber from '../../components/AnimatedNumber';

const HealthGauge: React.FC<{ label: string; score: number; color: string }> = ({ label, score, color }) => (
    <div className="bg-slate-900 border border-white/5 p-6 rounded-[2rem] flex items-center justify-between group hover:bg-slate-800/80 transition-all duration-500">
        <div className="flex items-center gap-5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} bg-opacity-20 transition-transform group-hover:scale-110`}>
                <BoltIcon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div className="text-left">
                <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">{label}</h4>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Grid Telemetry</p>
            </div>
        </div>
        <div className="text-right">
             <p className="text-3xl font-black text-white tracking-tighter">{score}%</p>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Efficiency</p>
        </div>
    </div>
);

const TeamHealthAI: React.FC = () => {
    const { t } = useLocalization();
    const { timesheets, projectMembers, projects } = useData();
    const { showToast } = useToast();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [report, setReport] = useState<string | null>(null);

    const metrics = useMemo(() => {
        const totalHours = timesheets.reduce((sum, t) => sum + t.hours, 0);
        const avgHours = projectMembers.length > 0 ? totalHours / projectMembers.length : 0;
        const burnoutRisk = avgHours > 45 ? 'High' : avgHours > 40 ? 'Medium' : 'Low';
        
        return { totalHours, avgHours, burnoutRisk, activeStaff: projectMembers.length };
    }, [timesheets, projectMembers]);

    const runNeuralAnalysis = async () => {
        if (!process.env.API_KEY) return;
        setIsAnalyzing(true);
        setReport(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Perform a neural burnout and efficiency audit for a construction team in South Africa.
                Context:
                - Active Staff: ${metrics.activeStaff}
                - Total Hours (MTD): ${metrics.totalHours}
                - Burnout Risk Level: ${metrics.burnoutRisk}
                
                Provide a 2-sentence tactical summary of team morale and operational efficiency. 
                Use high-performance, professional language.
            `;
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });
            setReport(response.text);
            showToast("Personnel Telemetry Decrypted", "success");
        } catch (e) {
            showToast("Neural Bridge Error", "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="pb-20 max-w-7xl mx-auto space-y-10 font-sans">
             {/* Ferrari Header */}
             <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 p-12 opacity-5">
                    <UserGroupIcon className="h-96 w-96 text-blue-500 transform -rotate-12" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                    <div className="text-left">
                         <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-500 rounded-lg animate-pulse">
                                <HeartIcon className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Team Vitals Engine v4.1</span>
                        </div>
                        <h1 className="text-7xl font-black tracking-tighter italic uppercase text-white leading-none">HEALTH <span className="text-blue-500">AI</span></h1>
                        <p className="text-slate-500 mt-4 font-mono text-sm tracking-widest uppercase">Burnout Detection & Personnel Optimization</p>
                    </div>

                    <button 
                        onClick={runNeuralAnalysis}
                        disabled={isAnalyzing}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-black py-5 px-12 rounded-[2rem] shadow-2xl shadow-blue-900/40 transition-all flex items-center gap-4 uppercase tracking-[0.2em] text-xs transform active:scale-95 disabled:opacity-50"
                    >
                        {isAnalyzing ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <SparklesIcon className="h-5 w-5" />}
                        Run Personnel Audit
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <HealthGauge label="Morale Index" score={82} color="bg-emerald-500" />
                        <HealthGauge label="Fatigue Shield" score={metrics.burnoutRisk === 'Low' ? 95 : 40} color="bg-blue-500" />
                    </div>

                    <div className="bg-slate-900 rounded-[3rem] p-10 border border-white/5 shadow-2xl relative group">
                         <div className="absolute top-0 right-0 p-8 opacity-5"><SparklesIcon className="h-32 w-32" /></div>
                         <h3 className="text-xl font-black italic tracking-tighter uppercase mb-6 flex items-center gap-3 text-left">
                             <BeakerIcon className="h-6 w-6 text-purple-400" />
                             Tactical <span className="text-purple-500">Findings</span>
                         </h3>
                         <div className="bg-white/5 border border-white/10 p-8 rounded-3xl min-h-[150px] flex items-center justify-center">
                            {isAnalyzing ? (
                                <div className="text-center">
                                    <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Processing Biometric Patterns...</p>
                                </div>
                            ) : report ? (
                                <p className="text-slate-100 text-lg italic leading-loose font-serif text-center">"{report}"</p>
                            ) : (
                                <p className="text-slate-500 text-sm font-medium italic">Initialize neural scan to detect burnout risks and efficiency gaps in your workforce.</p>
                            )}
                         </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8 text-left">
                    <div className="bg-slate-900 rounded-[3rem] p-8 border border-white/5 shadow-2xl text-left">
                         <h3 className="text-lg font-black italic uppercase tracking-tighter text-white mb-8 flex items-center gap-3 text-left">
                             <ClipboardDocumentListIcon className="h-5 w-5 text-blue-500" /> Crew <span className="text-blue-500">Logistics</span>
                         </h3>
                         <div className="space-y-6">
                             <div className="flex justify-between items-center">
                                 <div>
                                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Personnel</p>
                                     <p className="text-2xl font-black text-white">{metrics.activeStaff}</p>
                                 </div>
                             </div>
                             <div className="flex justify-between items-center border-t border-white/5 pt-6">
                                 <div>
                                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg Weekly Load</p>
                                     <p className="text-2xl font-black text-white">{metrics.avgHours.toFixed(1)} Hrs</p>
                                 </div>
                             </div>
                              <div className="flex justify-between items-center border-t border-white/5 pt-6">
                                 <div>
                                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Retention Status</p>
                                     <p className="text-2xl font-black text-emerald-400">STABLE</p>
                                 </div>
                             </div>
                         </div>
                    </div>

                    <div className="bg-blue-600 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-8 opacity-20 transform -rotate-12 group-hover:scale-110 transition-transform duration-500">
                             <ShieldCheckIcon className="h-32 w-32" />
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 opacity-60">Human Asset Shield</p>
                         <h4 className="text-xl font-bold italic leading-tight text-left">StockLink Neural Audit protects your team from over-exertion.</h4>
                         <div className="mt-8 flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                             <span className="text-[10px] font-black uppercase tracking-widest">Retention Optimized</span>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamHealthAI;