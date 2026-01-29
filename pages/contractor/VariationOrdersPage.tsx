
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext.tsx';
import { VariationOrder, Project } from '../../types.ts';
import { 
    Scale, Sparkles, Plus, Trash2, 
    CheckCircle, XCircle, Clock, 
    ArrowRight, FileText, Activity,
    ShieldAlert, Banknote
} from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency.tsx';
import { useToast } from '../../hooks/useToast.tsx';
import VariationOrderModal from '../../components/VariationOrderModal.tsx';
import EmptyState from '../../components/EmptyState.tsx';
import AnimatedNumber from '../../components/AnimatedNumber.tsx';

const VOCard: React.FC<{ vo: VariationOrder, projectName: string, onAction: () => void }> = ({ vo, projectName, onAction }) => {
    const { formatCurrency } = useCurrency();
    const statusColors = {
        'Draft': 'bg-slate-800 text-slate-400 border-slate-700',
        'Sent': 'bg-blue-600/10 text-blue-400 border-blue-500/20',
        'Approved': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]',
        'Declined': 'bg-red-600/10 text-red-500 border-red-500/20'
    };

    return (
        <div className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 hover:border-blue-500/30 transition-all duration-500 group relative overflow-hidden text-left shadow-2xl">
             <div className="absolute inset-0 bg-carbon opacity-5 group-hover:opacity-10 transition-opacity"></div>
             
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="font-mono text-[10px] font-black text-blue-500 bg-blue-600/10 px-3 py-1 rounded-lg border border-blue-500/20">{vo.number}</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${statusColors[vo.status] || 'bg-slate-800'}`}>
                                {vo.status}
                            </span>
                        </div>
                        <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{vo.title}</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Target Node: {projectName}</p>
                    </div>
                    <div className="text-right">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Fiscal Impact</p>
                         <p className={`text-4xl font-black italic tracking-tighter ${vo.costImpact > 0 ? 'text-red-500' : 'text-emerald-400'}`}>
                            {vo.costImpact > 0 ? '+' : ''}{formatCurrency(vo.costImpact)}
                        </p>
                    </div>
                </div>

                <div className="bg-black/40 p-6 rounded-[2rem] border border-white/5 mb-8 shadow-inner">
                    <p className="text-sm text-slate-400 leading-relaxed font-medium italic">"{vo.description}"</p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex gap-6">
                        <div className="text-left">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Pace Shift</p>
                            <p className="text-white font-black italic text-lg tracking-tighter">{vo.timeImpactDays} Days</p>
                        </div>
                    </div>
                    <button 
                        onClick={onAction}
                        className="bg-white text-slate-950 font-black py-4 px-10 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl transform active:scale-95 transition-all flex items-center justify-center gap-3 border-4 border-slate-900"
                    >
                        <FileText size={14} className="text-red-600"/> View Dossier
                    </button>
                </div>
             </div>
        </div>
    );
};

const VariationOrdersPage: React.FC = () => {
    const { variationOrders = [], projects = [] } = useData();
    const { showToast } = useToast();
    const { formatCurrency } = useCurrency();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');

    const filteredVOs = useMemo(() => {
        if (!selectedProjectId) return variationOrders;
        return variationOrders.filter(v => v.projectId === selectedProjectId);
    }, [variationOrders, selectedProjectId]);

    const netDelta = useMemo(() => filteredVOs.reduce((sum, v) => sum + v.costImpact, 0), [filteredVOs]);

    return (
        <div className="space-y-12 animate-fade-in pb-24 text-left selection:bg-red-600/30">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12">
                <div className="text-left">
                    <div className="flex items-center gap-4 mb-4 text-left">
                        <Scale className="h-10 w-10 text-red-600 shadow-2xl animate-pulse" />
                        <span className="text-[12px] font-black uppercase tracking-[0.5em] text-red-600 italic">AMENDMENT_ORCHESTRATOR v1.0</span>
                    </div>
                    <h1 className="text-7xl font-black text-white tracking-tighter uppercase italic leading-none text-left">VARIATION <span className="text-red-600 text-glow-red">REGISTRY</span></h1>
                    <p className="text-slate-500 mt-6 font-mono text-sm tracking-widest uppercase italic max-w-2xl leading-relaxed text-left">"Synchronize scope changes with the grid. Neural drafting for project amendments and legal handshake automation."</p>
                </div>
                
                <div className="flex gap-4">
                    <div className="bg-slate-900 p-2 rounded-[2rem] border border-white/5 shadow-2xl flex items-center gap-4 px-8 backdrop-blur-xl">
                        <div className="text-left">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Sector Focus</p>
                            <select 
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-white font-black italic text-sm uppercase appearance-none cursor-pointer hover:text-red-600 transition-colors"
                            >
                                <option value="" className="bg-slate-900">All Sectors</option>
                                {projects.map(p => <option key={p.id} value={p.id} className="bg-slate-900">{p.projectName}</option>)}
                            </select>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-red-600 hover:bg-red-700 text-white font-black py-6 px-12 rounded-[2.5rem] flex items-center gap-5 transition-all transform active:scale-95 shadow-2xl border-4 border-slate-950 uppercase text-xs tracking-widest"
                    >
                        <Plus size={20} />
                        Propose Amendment
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="bg-slate-900 border border-white/5 p-10 rounded-[3rem] shadow-2xl text-left">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Registry Depth</p>
                     <p className="text-6xl font-black text-white italic tracking-tighter leading-none">{filteredVOs.length}</p>
                     <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-6">Logged Amendments</p>
                </div>
                 <div className="bg-slate-900 border border-white/5 p-10 rounded-[3rem] shadow-2xl text-left">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Fiscal Delta (Net)</p>
                     <p className="text-5xl font-black text-red-600 italic tracking-tighter leading-none">
                        R <AnimatedNumber value={netDelta} format={(v) => v.toLocaleString()} />
                     </p>
                     <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-6">Accumulated Scope Creep</p>
                </div>
                 <div className="bg-slate-900 border border-emerald-500/20 p-10 rounded-[3rem] shadow-2xl text-left relative overflow-hidden">
                      <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>
                      <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-4">Approval Velocity</p>
                      <p className="text-5xl font-black text-white italic tracking-tighter leading-none">82%</p>
                      <p className="text-[9px] font-bold text-emerald-600/60 uppercase tracking-widest mt-6">Handshake Efficiency</p>
                </div>
            </div>

            {filteredVOs.length === 0 ? (
                <div className="py-20">
                    <EmptyState icon={Scale} title="REGISTRY CLEAR" message="No structural or fiscal amendments identified for the selected sector buffer." />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {filteredVOs.map(vo => (
                        <VOCard 
                            key={vo.id} 
                            vo={vo} 
                            projectName={projects.find(p => p.id === vo.projectId)?.projectName || 'GRID_NODE'} 
                            onAction={() => showToast("Accessing Encrypted Dossier...", "info")}
                        />
                    ))}
                </div>
            )}

            <div className="fixed bottom-12 left-12 pointer-events-none opacity-[0.03] -z-10 rotate-90 select-none text-left">
                <span className="text-[180px] font-black tracking-tighter text-white uppercase italic leading-none">AMENDMENT_REGISTRY</span>
            </div>

            {isModalOpen && projects[0] && (
                <VariationOrderModal 
                    project={projects[0]} 
                    onClose={() => setIsModalOpen(false)} 
                    onSave={() => showToast("Amendment Protocol Synchronized", "success")}
                />
            )}
        </div>
    );
};

export default VariationOrdersPage;
