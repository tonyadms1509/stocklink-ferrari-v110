
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useLocalization } from '../../hooks/useLocalization';
import { AuthorityMilestone, RegulatoryAlert, MetroPerformance } from '../../types';
import { 
    ScaleIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon, 
    DocumentMagnifyingGlassIcon, SparklesIcon, GlobeAltIcon, 
    ArrowPathIcon, BuildingLibraryIcon, ShieldCheckIcon,
    ArrowDownTrayIcon, ChartBarIcon, MapIcon, ArrowUpIcon, ArrowDownIcon
} from '@heroicons/react/24/solid';
import { GoogleGenAI } from '@google/genai';
import { useToast } from '../../hooks/useToast';
import AnimatedNumber from '../../components/AnimatedNumber';

const MilestoneCard: React.FC<{ milestone: AuthorityMilestone; onUpdate: () => void }> = ({ milestone, onUpdate }) => {
    const statusColors = {
        'Not Started': 'bg-gray-100 text-gray-500 border-gray-200',
        'In Progress': 'bg-blue-50 text-blue-600 border-blue-200',
        'Awaiting Decision': 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse',
        'Approved': 'bg-emerald-50 text-emerald-600 border-emerald-200',
        'Blocked': 'bg-red-50 text-red-600 border-red-200'
    };

    const daysPending = milestone.submittedAt 
        ? Math.ceil((Date.now() - new Date(milestone.submittedAt).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    const progress = Math.min((daysPending / milestone.estimatedLeadDays) * 100, 100);

    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 hover:shadow-2xl transition-all duration-500 group text-left">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[milestone.status as keyof typeof statusColors]}`}>
                        {milestone.status}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-4 tracking-tighter italic uppercase">{milestone.title}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{milestone.authorityName}</p>
                </div>
                <div className="text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Forecast</p>
                     <p className="text-3xl font-black text-slate-900 tracking-tighter">{milestone.estimatedLeadDays} Days</p>
                </div>
            </div>

            <div className="space-y-4 mb-8">
                <div>
                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                        <span>Friction Elapsed</span>
                        <span>{daysPending} Days / {progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                        <div 
                            className={`h-full transition-all duration-1000 ${milestone.status === 'Blocked' ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-blue-600 shadow-[0_0_10px_#2563eb]'}`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Verification Dossier</h4>
                 <div className="flex flex-wrap gap-2">
                     {milestone.requiredDocuments?.map(doc => (
                         <span key={doc} className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:border-blue-500/30 transition-colors">{doc}</span>
                     ))}
                 </div>
            </div>

            <button className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-black transition-all transform active:scale-95 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2">
                <DocumentMagnifyingGlassIcon className="h-4 w-4 text-blue-400"/>
                Uplink for Verification
            </button>
        </div>
    );
};

const MetroPerformanceRow: React.FC<{ data: MetroPerformance }> = ({ data }) => (
    <div className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-[2rem] hover:bg-white/10 transition-all group">
        <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center font-black text-slate-400 text-xs tracking-tighter group-hover:border-blue-500/30 transition-colors">
                {data.city.slice(0, 3).toUpperCase()}
            </div>
            <div className="text-left">
                <p className="font-black text-white text-base tracking-tight italic uppercase">{data.city}</p>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Metro Node</p>
            </div>
        </div>
        <div className="flex items-center gap-10">
            <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pace Index</p>
                <p className="font-black text-white text-lg flex items-center justify-end gap-2 tracking-tighter">
                    {data.avgApprovalDays}D
                    {data.trend === 'Improving' ? <ArrowDownIcon className="h-4 w-4 text-emerald-400" /> : <ArrowUpIcon className="h-4 w-4 text-red-400" />}
                </p>
            </div>
        </div>
    </div>
);

const AuthorityGateway: React.FC = () => {
    const { authorityMilestones = [], metroPerformance = [], regulatoryAlerts = [] } = useData();
    const { showToast } = useToast();
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<string | null>(null);

    const handleSyncAuthorities = async () => {
        if (!process.env.API_KEY) return;
        setIsScanning(true);
        setScanResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Perform a scan of building standards for JHB/CPT. Reference SANS 10400-XA. Official tactical briefing tone. Max 3 sentences.`;
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });
            setScanResult(response.text || "Handshake Successful. Grid state: Nominal.");
            showToast("Metro Pulse Sync Successful", "success");
        } catch (e) {
            showToast("Uplink Interrupted", "error");
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="pb-12 max-w-7xl mx-auto space-y-12 font-sans">
            <div className="bg-slate-950 rounded-[3rem] p-12 shadow-2xl border border-white/5 relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://i.imgur.com/v2T3mJ5.png')] bg-cover bg-center grayscale opacity-10 mix-blend-overlay pointer-events-none"></div>
                 <div className="absolute top-0 right-0 p-12 opacity-5">
                     <BuildingLibraryIcon className="h-96 w-96 text-white transform rotate-12" />
                 </div>

                 <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16 text-left">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <ScaleIcon className="h-6 w-6 text-blue-600 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Legal Intelligence Core v62</span>
                            </div>
                            <h1 className="text-7xl font-black tracking-tighter italic uppercase text-white">Authority <span className="text-blue-500">Gateway</span></h1>
                            <p className="text-slate-500 mt-4 font-mono text-sm tracking-widest uppercase">Municipal Bottleneck Analysis & Regulatory Pulse</p>
                        </div>
                        <button 
                            onClick={handleSyncAuthorities}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-black py-5 px-12 rounded-[2rem] shadow-2xl shadow-blue-900/40 transition-all flex items-center gap-4 uppercase tracking-[0.2em] text-xs transform active:scale-95 disabled:opacity-50"
                        >
                            {isScanning ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <GlobeAltIcon className="h-5 w-5" />}
                            Sync Metro Pulse
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
                        <div className="lg:col-span-8 space-y-10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.3em] flex items-center gap-3">
                                    <div className="w-8 h-px bg-slate-800"></div>
                                    Decision Pipeline
                                </h3>
                                <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">{authorityMilestones.length} Pending Actions</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {authorityMilestones.map(m => <MilestoneCard key={m.id} milestone={m} onUpdate={() => {}} />)}
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-10">
                             <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl border border-white/5 relative group">
                                 <div className="absolute top-0 right-0 p-6 opacity-5"><SparklesIcon className="h-24 w-24"/></div>
                                 <p className="text-[10px] font-black text-blue-400 uppercase mb-6 tracking-[0.4em] font-mono border-b border-white/10 pb-4">Gazette AI Brief</p>
                                 <p className="text-base italic text-blue-100/80 leading-loose font-serif">
                                     "{scanResult || 'Initiate sync to scan official South African metros for approval bottlenecks and updated building standards...'}"
                                 </p>
                             </div>
                             
                             <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl border border-white/5">
                                <h3 className="text-xl font-black italic tracking-tighter uppercase mb-10 flex items-center gap-3">
                                    <MapIcon className="h-6 w-6 text-blue-500" />
                                    Metro <span className="text-blue-500">Pace</span>
                                </h3>
                                <div className="space-y-4">
                                    {metroPerformance.map((m, i) => (
                                        <MetroPerformanceRow key={i} data={m} />
                                    ))}
                                </div>
                            </div>

                             <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase text-slate-400 tracking-[0.3em] flex items-center gap-3 ml-4">
                                    Regulatory Watch
                                </h3>
                                {regulatoryAlerts.map(alert => (
                                    <div key={alert.id} className="p-6 bg-white rounded-[2rem] border border-slate-200 hover:border-blue-500/50 transition-colors shadow-sm text-left">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[9px] font-black bg-slate-900 text-white px-2 py-1 rounded uppercase tracking-widest">{alert.source}</span>
                                            <span className="text-[10px] text-slate-400 font-bold">{new Date(alert.date).toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-sm leading-tight mb-2">{alert.title}</h4>
                                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed italic">"{alert.summary}"</p>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default AuthorityGateway;
