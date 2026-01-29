import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
import { ClientInvoice, InvoiceStatus, ClientQuoteItem } from '../../types';
import { ArrowLeftIcon, PlusIcon, DocumentTextIcon, BanknotesIcon, ClockIcon, CheckCircleIcon, TrashIcon, ExclamationTriangleIcon, EllipsisHorizontalIcon, SparklesIcon, MicrophoneIcon } from '@heroicons/react/24/solid';
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
    
    const icons = {
        [InvoiceStatus.Draft]: null,
        [InvoiceStatus.Sent]: null,
        [InvoiceStatus.Paid]: <CheckCircleIcon className="h-3 w-3 mr-1"/>,
        [InvoiceStatus.Overdue]: <ExclamationTriangleIcon className="h-3 w-3 mr-1"/>,
        [InvoiceStatus.Cancelled]: null
    }

    return (
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border flex items-center w-fit ${styles[status]}`}>
            {icons[status]}
            {status.toUpperCase()}
        </span>
    );
};

const StatBox: React.FC<{ title: string, value: string, icon: React.ElementType, color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 text-left">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-${color.replace('bg-', '')}`}>
            <Icon className={`h-7 w-7 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{value}</p>
        </div>
    </div>
);

interface InvoicesPageProps {
    onBack?: () => void;
}

const InvoicesPage: React.FC<InvoicesPageProps> = ({ onBack }) => {
    const { t } = useLocalization();
    const { clientInvoices, createClientInvoice, updateClientInvoiceStatusInDb, deleteClientQuote, projects, projectExpenses, projectMaterials } = useData(); 
    const { user } = useAuth();
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();

    const [filter, setFilter] = useState<'All' | 'Overdue' | 'Paid' | 'Draft'>('All');
    const [chasingInvoice, setChasingInvoice] = useState<ClientInvoice | null>(null);
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    
    // Generator State
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
    
    // Get data for generator
    const selectedProjectData = useMemo(() => {
        if (!selectedProjectId) return null;
        return {
            project: projects.find(p => p.id === selectedProjectId),
            expenses: projectExpenses.filter(e => e.projectId === selectedProjectId),
            materials: projectMaterials.filter(m => m.projectId === selectedProjectId)
        };
    }, [selectedProjectId, projects, projectExpenses, projectMaterials]);


    const handleVoiceInvoice = async (data: any) => {
        if (!user) return;
        
        const items: ClientQuoteItem[] = data.items.map((i: any, idx: number) => ({
            id: `voice-${Date.now()}-${idx}`,
            description: i.description,
            quantity: i.quantity || 1,
            unitPrice: i.unitPrice || 0,
            isStockLinkItem: false
        }));

        const subtotal = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
        const vatRate = 0.15;
        const total = subtotal * (1 + vatRate);
        const dueDate = data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await createClientInvoice({
            contractorId: user.id,
            clientName: data.clientName || "Unknown Client",
            items,
            subtotal,
            vatRate,
            total,
            status: InvoiceStatus.Draft,
            dueDate,
            notes: data.notes
        });
        showToast(`Invoice for ${data.clientName} created!`, 'success');
    };

    const handleMarkPaid = async (id: string) => {
        await updateClientInvoiceStatusInDb(id, InvoiceStatus.Paid);
        showToast('Invoice marked as paid', 'success');
    };

    const handleDelete = async (id: string) => {
        if(confirm('Delete this invoice?')) {
            await updateClientInvoiceStatusInDb(id, InvoiceStatus.Cancelled);
             showToast('Invoice cancelled', 'info');
        }
    }

    const filteredInvoices = useMemo(() => {
        if (!user) return [];
        let data = clientInvoices.filter(i => i.contractorId === user.id);
        if (filter !== 'All') {
            data = data.filter(i => i.status === filter);
        }
        return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [clientInvoices, user, filter]);

    const stats = useMemo(() => {
        const myInvoices = clientInvoices.filter(i => i.contractorId === user?.id);
        const outstanding = myInvoices.filter(i => i.status === InvoiceStatus.Sent || i.status === InvoiceStatus.Overdue).reduce((sum, i) => sum + i.total, 0);
        const overdue = myInvoices.filter(i => i.status === InvoiceStatus.Overdue).reduce((sum, i) => sum + i.total, 0);
        const paidThisMonth = myInvoices.filter(i => i.status === InvoiceStatus.Paid).reduce((sum, i) => sum + i.total, 0);
        
        return { outstanding, overdue, paidThisMonth };
    }, [clientInvoices, user]);

    return (
        <div className="h-full flex flex-col">
            {onBack && (
                <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-4 font-medium transition-colors hover:translate-x-[-4px]">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" /> {t('backToDashboard')}
                </button>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 flex-shrink-0 text-left">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Ledger Matrix</h2>
                    <p className="text-gray-500 mt-1 font-medium italic">High-fidelity client billing & neural collections dashboard.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsVoiceModalOpen(true)} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-md transition-all uppercase text-[10px] tracking-widest">
                        <MicrophoneIcon className="h-5 w-5"/> Dictate
                    </button>
                    <button onClick={handleGenerateFromProject} className="bg-secondary hover:bg-emerald-600 text-white font-black py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-md transition-all transform hover:-translate-y-0.5 uppercase text-[10px] tracking-widest">
                        <SparklesIcon className="h-5 w-5"/> Generate
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 flex-shrink-0">
                <StatBox title="Outstanding Hold" value={formatCurrency(stats.outstanding)} icon={ClockIcon} color="bg-blue-500" />
                <StatBox title="Critical Debt" value={formatCurrency(stats.overdue)} icon={ExclamationTriangleIcon} color="bg-red-500" />
                <StatBox title="Settled MTD" value={formatCurrency(stats.paidThisMonth)} icon={CheckCircleIcon} color="bg-green-500" />
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 flex-grow overflow-hidden flex flex-col">
                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-6 overflow-x-auto bg-gray-50/50">
                    {['All', 'Draft', 'Sent', 'Overdue', 'Paid'].map(f => (
                        <button 
                            key={f} 
                            onClick={() => setFilter(f as any)}
                            className={`px-6 py-5 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all whitespace-nowrap ${filter === f ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-800'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {filteredInvoices.length === 0 ? (
                    <div className="flex-grow p-6">
                        <EmptyState 
                            icon={DocumentTextIcon} 
                            title="LEDGER CLEAR" 
                            message={filter === 'All' ? "No historical billing events identified on the grid." : `No ${filter.toLowerCase()} invoices found.`} 
                        />
                    </div>
                ) : (
                    <div className="overflow-auto flex-grow text-left">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 sticky top-0 z-10 border-b">
                                <tr>
                                    <th className="p-6 text-[9px] font-black text-slate-500 uppercase tracking-widest">Invoice Node</th>
                                    <th className="p-6 text-[9px] font-black text-slate-500 uppercase tracking-widest">Client Target</th>
                                    <th className="p-6 text-[9px] font-black text-slate-500 uppercase tracking-widest">Settlement Window</th>
                                    <th className="p-6 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">ZAR Value</th>
                                    <th className="p-6 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Grid State</th>
                                    <th className="p-6 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredInvoices.map(invoice => (
                                    <tr key={invoice.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="p-6 font-mono font-bold text-primary">{invoice.invoiceNumber}</td>
                                        <td className="p-6 font-black uppercase italic tracking-tight text-gray-900">{invoice.clientName}</td>
                                        <td className="p-6 text-sm text-gray-500">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                                        <td className="p-6 text-right font-black text-gray-900 text-lg">{formatCurrency(invoice.total)}</td>
                                        <td className="p-6 text-center flex justify-center"><StatusBadge status={invoice.status} /></td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {invoice.status === InvoiceStatus.Overdue && (
                                                    <button 
                                                        onClick={() => setChasingInvoice(invoice)} 
                                                        className="text-[9px] font-black bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-all flex items-center gap-2 uppercase tracking-widest shadow-xl shadow-red-900/20" 
                                                        title="Chase Payment"
                                                    >
                                                        <SparklesIcon className="h-3 w-3 text-yellow-300 animate-pulse"/> Chase
                                                    </button>
                                                )}
                                                {invoice.status !== InvoiceStatus.Paid && (
                                                    <button onClick={() => handleMarkPaid(invoice.id)} className="text-slate-400 hover:text-emerald-600 p-2 rounded-xl hover:bg-emerald-50 transition-colors" title="Mark Paid">
                                                        <CheckCircleIcon className="h-6 w-6"/>
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(invoice.id)} className="text-slate-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors" title="Purge">
                                                    <TrashIcon className="h-6 w-6"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {chasingInvoice && (
                <AICollectionsModal 
                    invoice={chasingInvoice} 
                    onClose={() => setChasingInvoice(null)} 
                />
            )}
            
            {isVoiceModalOpen && (
                <VoiceInvoiceModal 
                    onClose={() => setIsVoiceModalOpen(false)}
                    onInvoiceGenerated={handleVoiceInvoice}
                />
            )}

            {/* Project Selection Modal */}
            {isProjectSelectorOpen && (
                <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-[130] p-4 backdrop-blur-md">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-sm w-full border border-gray-100">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-8 text-center">Dossier Billing</h3>
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Select Target Sector</label>
                            <select 
                                value={selectedProjectId} 
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                                className="w-full p-4 border-2 border-slate-100 rounded-2xl mb-8 bg-slate-50 font-bold outline-none focus:border-primary transition-all"
                            >
                                <option value="">-- Manual Selection --</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                            </select>
                        </div>
                        <div className="flex gap-4">
                             <button onClick={() => setIsProjectSelectorOpen(false)} className="flex-1 py-4 text-[10px] font-black uppercase text-slate-400">Abort</button>
                             <button onClick={confirmProjectSelection} disabled={!selectedProjectId} className="flex-2 px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] disabled:opacity-30 shadow-xl shadow-blue-900/20">Provision</button>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Generator Modal */}
            {isGeneratorOpen && selectedProjectData && selectedProjectData.project && (
                <InvoiceGeneratorModal 
                    project={selectedProjectData.project}
                    expenses={selectedProjectData.expenses}
                    materials={selectedProjectData.materials}
                    onClose={() => setIsGeneratorOpen(false)}
                />
            )}
        </div>
    );
};

export default InvoicesPage;