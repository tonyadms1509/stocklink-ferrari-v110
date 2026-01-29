
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
import { ClientInvoice, InvoiceStatus, ClientQuoteItem } from '../../types';
import { 
    ArrowLeftIcon, PlusIcon, DocumentTextIcon, BanknotesIcon, 
    ClockIcon, CheckCircleIcon, TrashIcon, ExclamationTriangleIcon, 
    EllipsisHorizontalIcon, SparklesIcon, MicrophoneIcon 
} from '@heroicons/react/24/solid';
import EmptyState from '../../components/EmptyState';
import AICollectionsModal from '../../components/AICollectionsModal';
import InvoiceGeneratorModal from '../../components/InvoiceGeneratorModal';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import VoiceInvoiceModal from '../../components/VoiceInvoiceModal';

const StatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
    const styles = {
        [InvoiceStatus.Draft]: 'bg-gray-100 text-gray-600 border-gray-200',
        [InvoiceStatus.Sent]: 'bg-blue-50 text-blue-700 border-blue-200',
        [InvoiceStatus.Paid]: 'bg-green-50 text-green-700 border-green-200',
        [InvoiceStatus.Overdue]: 'bg-red-50 text-red-700 border-red-200',
        [InvoiceStatus.Cancelled]: 'bg-gray-50 text-gray-400 border-gray-200 line-through',
    };
    
    return (
        <span className={`px-2.5 py-1 rounded-md text-[9px] font-black border flex items-center w-fit uppercase tracking-widest ${styles[status]}`}>
            {status}
        </span>
    );
};

const StatBox: React.FC<{ title: string, value: string, icon: React.ElementType, color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl flex items-center gap-8 text-left relative overflow-hidden group">
        <div className="absolute inset-0 bg-carbon opacity-5"></div>
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-${color.replace('bg-', '')} transition-transform group-hover:scale-110 shadow-lg border border-white/5`}>
            <Icon className={`h-8 w-8 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">{title}</p>
            <p className="text-3xl font-black text-white italic tracking-tighter leading-none">{value}</p>
        </div>
    </div>
);

interface InvoicesPageProps {
    onBack?: () => void;
}

const InvoicesPage: React.FC<InvoicesPageProps> = ({ onBack }) => {
    const { t } = useLocalization();
    const { clientInvoices = [], createClientInvoice, updateClientInvoiceStatusInDb, projects, projectExpenses, projectMaterials } = useData(); 
    const { user } = useAuth();
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();

    const [filter, setFilter] = useState<'All' | 'Overdue' | 'Paid' | 'Draft'>('All');
    const [chasingInvoice, setChasingInvoice] = useState<ClientInvoice | null>(null);
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    
    const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

    const handleGenerateFromProject = () => {
        setIsProjectSelectorOpen(true);
    };

    const confirmProjectSelection = () => {
        if (selectedProjectId) {
            setIsProjectSelectorOpen(false);
            setIsGeneratorOpen(true);
        }
    };
    
    const selectedProjectData = useMemo(() => {
        if (!selectedProjectId) return null;
        return {
            project: projects.find(p => p.id === selectedProjectId),
            expenses: projectExpenses.filter(e => e.projectId === selectedProjectId),
            materials: projectMaterials.filter(m => m.projectId === selectedProjectId)
        };
    }, [selectedProjectId, projects, projectExpenses, projectMaterials]);

    const handleMarkPaid = async (id: string) => {
        await updateClientInvoiceStatusInDb(id, InvoiceStatus.Paid);
        showToast('Settlement Confirmed', 'success');
    };

    const filteredInvoices = useMemo(() => {
        if (!user) return [];
        let data = (clientInvoices || []).filter(i => i.contractorId === user.id);
        if (filter !== 'All') {
            data = data.filter(i => i.status === filter);
        }
        return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [clientInvoices, user, filter]);

    const stats = useMemo(() => {
        const myInvoices = (clientInvoices || []).filter(i => i.contractorId === user?.id);
        const outstanding = myInvoices.filter(i => i.status === InvoiceStatus.Sent || i.status === InvoiceStatus.Overdue).reduce((sum, i) => sum + i.total, 0);
        const overdue = myInvoices.filter(i => i.status === InvoiceStatus.Overdue).reduce((sum, i) => sum + i.total, 0);
        const settled = myInvoices.filter(i => i.status === InvoiceStatus.Paid).reduce((sum, i) => sum + i.total, 0);
        
        return { outstanding, overdue, settled };
    }, [clientInvoices, user]);

    return (
        <div className="h-full flex flex-col font-sans selection:bg-red-600/30 text-left">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12 mb-12">
                <div className="text-left">
                    <div className="flex items-center gap-3 mb-4 text-red-600">
                        <BanknotesIcon className="h-8 w-8 animate-pulse shadow-[0_0_20px_red]" />
                        <span className="text-[12px] font-black uppercase tracking-[0.6em] italic text-red-600">SETTLEMENT ENGINE v1.2 REDLINE</span>
                    </div>
                    <h1 className="text-7xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">CLIENT <span className="text-red-600">LEDGER</span></h1>
                    <p className="text-slate-500 mt-4 font-mono text-sm tracking-widest uppercase italic max-w-2xl leading-relaxed">"National grid synchronized receivables. Automated milestone collections and structural financial auditing."</p>
                </div>
                
                <div className="flex gap-4">
                    <button onClick={() => setIsVoiceModalOpen(true)} className="bg-slate-900 hover:bg-black text-white font-black py-5 px-8 rounded-3xl transition-all border border-white/10 shadow-2xl uppercase tracking-widest text-[10px] flex items-center gap-3">
                        <MicrophoneIcon className="h-5 w-5 text-blue-500" />
                        Dictate
                    </button>
                    <button onClick={handleGenerateFromProject} className="bg-red-600 hover:bg-red-700 text-white font-black py-5 px-12 rounded-[2rem] shadow-2xl shadow-red-900/40 transition-all transform active:scale-95 uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-4 border-4 border-slate-950">
                        <SparklesIcon className="h-6 w-6 text-yellow-300 animate-pulse"/>
                        Generate Dossier
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 flex-shrink-0">
                <StatBox title="Net Hold" value={formatCurrency(stats.outstanding)} icon={ClockIcon} color="bg-blue-600" />
                <StatBox title="Critical Debt" value={formatCurrency(stats.overdue)} icon={ExclamationTriangleIcon} color="bg-red-600" />
                <StatBox title="Settled MTD" value={formatCurrency(stats.settled)} icon={CheckCircleIcon} color="bg-emerald-600" />
            </div>

            <div className="bg-white rounded-[4rem] shadow-sm border border-slate-200 flex-grow overflow-hidden flex flex-col">
                <div className="flex border-b border-slate-100 px-10 overflow-x-auto bg-slate-50/50">
                    {['All', 'Draft', 'Sent', 'Overdue', 'Paid'].map(f => (
                        <button 
                            key={f} 
                            onClick={() => setFilter(f as any)}
                            className={`px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] border-b-4 transition-all whitespace-nowrap ${filter === f ? 'border-red-600 text-red-600' : 'border-transparent text-slate-400 hover:text-slate-900'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="overflow-auto flex-grow">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 sticky top-0 z-10 border-b">
                            <tr>
                                <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Dossier Node</th>
                                <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Identity</th>
                                <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Settlement Value</th>
                                <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                                <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {filteredInvoices.map(invoice => (
                                <tr key={invoice.id} className="hover:bg-blue-50/20 transition-all duration-300 group">
                                    <td className="p-8 font-mono font-bold text-primary group-hover:translate-x-1 transition-transform">{invoice.invoiceNumber}</td>
                                    <td className="p-8 font-black uppercase italic tracking-tight text-gray-900">{invoice.clientName}</td>
                                    <td className="p-8 text-right font-black text-gray-900 text-xl tracking-tighter">{formatCurrency(invoice.total)}</td>
                                    <td className="p-8"><div className="flex justify-center"><StatusBadge status={invoice.status} /></div></td>
                                    <td className="p-8 text-right">
                                        <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {invoice.status === InvoiceStatus.Overdue && (
                                                <button 
                                                    onClick={() => setChasingInvoice(invoice)} 
                                                    className="bg-red-600 text-white font-black px-5 py-2 rounded-xl hover:bg-red-700 transition-all flex items-center gap-2 uppercase text-[9px] tracking-widest shadow-xl shadow-red-900/20"
                                                >
                                                    <SparklesIcon className="h-4 w-4 text-yellow-300 animate-pulse"/> 
                                                    Chase
                                                </button>
                                            )}
                                            {invoice.status !== InvoiceStatus.Paid && (
                                                <button onClick={() => handleMarkPaid(invoice.id)} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 shadow-sm" title="Confirm Settlement">
                                                    <CheckCircleIcon className="h-6 w-6"/>
                                                </button>
                                            )}
                                            <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all border border-slate-100" title="Archive">
                                                <TrashIcon className="h-6 w-6"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-32 text-center text-slate-300 uppercase font-black tracking-[1em] text-xs animate-pulse italic">Awaiting Financial Sync...</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {chasingInvoice && <AICollectionsModal invoice={chasingInvoice} onClose={() => setChasingInvoice(null)} />}
            {isVoiceModalOpen && <VoiceInvoiceModal onClose={() => setIsVoiceModalOpen(false)} onInvoiceGenerated={() => showToast("Voice Dossier Created", "success")} />}
            {isProjectSelectorOpen && (
                <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-[130] p-4 backdrop-blur-md">
                    <div className="bg-white rounded-[3rem] shadow-2xl p-12 max-w-sm w-full border border-gray-100 text-left">
                        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-8">Node <span className="text-blue-600">Selection</span></h3>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Active Project Target</label>
                        <select 
                            value={selectedProjectId} 
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl mb-10 font-bold text-lg outline-none focus:border-blue-600 appearance-none cursor-pointer"
                        >
                            <option value="">-- Manual Matrix --</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                        </select>
                        <div className="flex gap-4">
                             <button onClick={() => setIsProjectSelectorOpen(false)} className="flex-1 py-5 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors">Abort</button>
                             <button onClick={confirmProjectSelection} disabled={!selectedProjectId} className="flex-2 px-12 py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] disabled:opacity-30 shadow-2xl shadow-blue-900/40 transform active:scale-95 transition-all">Initialize</button>
                        </div>
                    </div>
                </div>
            )}

            {isGeneratorOpen && selectedProjectData?.project && (
                <InvoiceGeneratorModal 
                    project={selectedProjectData.project}
                    expenses={selectedProjectData.expenses}
                    materials={selectedProjectData.materials}
                    onClose={() => setIsGeneratorOpen(false)}
                />
            )}
            
            <div className="fixed bottom-10 left-10 pointer-events-none opacity-[0.03] -z-10 rotate-90 select-none text-left">
                <span className="text-[180px] font-black tracking-tighter text-white uppercase">REVENUE GRID</span>
            </div>
        </div>
    );
};

export default InvoicesPage;
