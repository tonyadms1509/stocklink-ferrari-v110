
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
import { Client, InvoiceStatus } from '../../types';
import { ArrowLeftIcon, PlusIcon, MagnifyingGlassIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, BriefcaseIcon, BanknotesIcon, SparklesIcon, ChatBubbleLeftEllipsisIcon, PencilIcon, TrashIcon, UsersIcon, DocumentTextIcon } from '@heroicons/react/24/solid';
import ClientFormModal from '../../components/ClientFormModal';
import EmptyState from '../../components/EmptyState';
import { GoogleGenAI } from '@google/genai';

const ClientCard: React.FC<{ client: Client; onSelect: () => void }> = ({ client, onSelect }) => (
    <div onClick={onSelect} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600 font-bold w-10 h-10 flex items-center justify-center">
                    {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                    <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{client.name}</h4>
                    <p className="text-xs text-gray-500">{client.email || client.phone}</p>
                </div>
            </div>
            {client.tags && client.tags.length > 0 && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{client.tags[0]}</span>
            )}
        </div>
    </div>
);

const ClientDetailView: React.FC<{ client: Client; onBack: () => void; onEdit: () => void; onDelete: () => void }> = ({ client, onBack, onEdit, onDelete }) => {
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();
    const { projects = [], clientInvoices = [] } = useData();
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Defensive filtering
    const safeProjects = Array.isArray(projects) ? projects : [];
    const safeInvoices = Array.isArray(clientInvoices) ? clientInvoices : [];

    const clientProjects = useMemo(() => safeProjects.filter(p => p.clientName.toLowerCase() === client.name.toLowerCase()), [safeProjects, client]);
    const clientInvoicesList = useMemo(() => safeInvoices.filter(i => i.clientName.toLowerCase() === client.name.toLowerCase()), [safeInvoices, client]);
    
    const financials = useMemo(() => {
        const totalBilled = clientInvoicesList.reduce((sum, i) => sum + i.total, 0);
        const totalPaid = clientInvoicesList.filter(i => i.status === InvoiceStatus.Paid).reduce((sum, i) => sum + i.total, 0);
        const outstanding = totalBilled - totalPaid;
        return { totalBilled, totalPaid, outstanding };
    }, [clientInvoicesList]);

    const handleGenerateInsight = async () => {
        if (!process.env.API_KEY) return;
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Analyze this client relationship for a contractor.
                Client: ${client.name}
                Projects: ${clientProjects.length} (${clientProjects.map(p => p.status).join(', ')})
                Financials: Billed ${financials.totalBilled}, Paid ${financials.totalPaid}, Outstanding ${financials.outstanding}.
                Invoices: ${clientInvoicesList.length} total.
                
                Provide a brief (2-3 sentences) insight or recommendation. E.g., "Loyal client, pays on time." or "Outstanding balance is high, follow up."
            `;
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });
            setAiInsight(response.text);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="animate-fade-in-right text-left">
            <button onClick={onBack} className="flex items-center text-sm text-gray-500 hover:text-primary mb-4">
                <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to List
            </button>

            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary text-white text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center shadow-sm">
                            {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
                            <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-500">
                                {client.email && <span className="flex items-center gap-1"><EnvelopeIcon className="h-4 w-4"/>{client.email}</span>}
                                {client.phone && <span className="flex items-center gap-1"><PhoneIcon className="h-4 w-4"/>{client.phone}</span>}
                                {client.address && <span className="flex items-center gap-1"><MapPinIcon className="h-4 w-4"/>{client.address}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onEdit} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><PencilIcon className="h-5 w-5"/></button>
                        <button onClick={onDelete} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><TrashIcon className="h-5 w-5"/></button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-6">
                     <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800"><BanknotesIcon className="h-5 w-5 text-primary"/> Financial Snapshot</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total Billed</span>
                                <span className="font-semibold">{formatCurrency(financials.totalBilled)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total Paid</span>
                                <span className="font-semibold text-green-600">{formatCurrency(financials.totalPaid)}</span>
                            </div>
                             <div className="flex justify-between text-sm pt-2 border-t">
                                <span className="text-gray-500">Outstanding</span>
                                <span className={`font-bold ${financials.outstanding > 0 ? 'text-red-600' : 'text-gray-800'}`}>{formatCurrency(financials.outstanding)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                        <h3 className="font-bold text-indigo-900 flex items-center gap-2 mb-3">
                            <SparklesIcon className="h-5 w-5 text-amber-500"/> AI Relations Insight
                        </h3>
                        {aiInsight ? (
                            <p className="text-indigo-800 text-sm italic leading-relaxed">"{aiInsight}"</p>
                        ) : (
                            <button onClick={handleGenerateInsight} disabled={isGenerating} className="text-xs font-bold text-indigo-600 bg-white px-3 py-2 rounded-lg shadow-sm hover:bg-indigo-100 flex items-center gap-2 disabled:opacity-50">
                                {isGenerating ? 'Processing...' : 'Generate Profile Intelligence'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                         <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800"><BriefcaseIcon className="h-5 w-5 text-primary"/> Associated Projects ({clientProjects.length})</h3>
                         {clientProjects.length > 0 ? (
                             <div className="space-y-3">
                                 {clientProjects.map(p => (
                                     <div key={p.id} className="p-3 border rounded-lg flex justify-between items-center hover:bg-gray-50">
                                         <span className="font-medium text-gray-800">{p.projectName}</span>
                                         <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${p.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{p.status}</span>
                                     </div>
                                 ))}
                             </div>
                         ) : <p className="text-gray-500 text-sm italic">No project history found.</p>}
                    </div>

                     <div className="bg-white p-6 rounded-xl shadow-sm">
                         <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800"><DocumentTextIcon className="h-5 w-5 text-primary"/> Ledger Events</h3>
                         {clientInvoicesList.length > 0 ? (
                             <div className="space-y-3">
                                 {clientInvoicesList.map(inv => (
                                     <div key={inv.id} className="p-3 border rounded-lg flex justify-between items-center hover:bg-gray-50">
                                         <div className="text-left">
                                             <p className="font-medium text-gray-800">{inv.invoiceNumber}</p>
                                             <p className="text-xs text-gray-500">{new Date(inv.createdAt).toLocaleDateString()}</p>
                                         </div>
                                         <div className="text-right">
                                             <p className="font-bold text-gray-900">{formatCurrency(inv.total)}</p>
                                             <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${inv.status === 'Paid' ? 'bg-green-100 text-green-800' : inv.status === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>{inv.status}</span>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         ) : <p className="text-gray-500 text-sm italic">No transactional events recorded.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ClientsPageProps {
    onBack?: () => void;
}

const ClientsPage: React.FC<ClientsPageProps> = ({ onBack }) => {
    const { t } = useLocalization();
    const { clients = [], addClient, updateClient, deleteClient } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    const filteredClients = useMemo(() => {
        // Defensive check for array to prevent .filter on undefined
        const safeClients = Array.isArray(clients) ? clients : [];
        return safeClients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [clients, searchTerm]);

    const handleSaveClient = async (clientData: any) => {
        if (editingClient) {
            await updateClient(editingClient.id, clientData);
        } else {
            await addClient(clientData);
        }
        setIsFormOpen(false);
        setEditingClient(null);
    };

    const handleDeleteClient = async () => {
        if (selectedClient && confirm('Are you sure you want to purge this client node?')) {
            await deleteClient(selectedClient.id);
            setSelectedClient(null);
        }
    };
    
    const handleOpenEdit = () => {
        setEditingClient(selectedClient);
        setIsFormOpen(true);
    }

    if (selectedClient) {
        return (
            <ClientDetailView 
                client={selectedClient} 
                onBack={() => setSelectedClient(null)}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteClient}
            />
        );
    }

    return (
        <div className="h-full flex flex-col text-left">
             {onBack && (
                <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-4">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back
                </button>
            )}
            
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <div>
                    <h2 className="text-3xl font-extrabold flex items-center gap-3"><UsersIcon className="h-8 w-8 text-primary"/> Project Stakeholders</h2>
                    <p className="text-gray-600 mt-1 font-medium">Manage and monitor client relationships across the grid.</p>
                </div>
                <button onClick={() => { setEditingClient(null); setIsFormOpen(true); }} className="bg-secondary hover:bg-emerald-600 text-white font-black py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg transition-all transform active:scale-95 text-sm uppercase tracking-widest">
                    <PlusIcon className="h-5 w-5"/>
                    Provision Node
                </button>
            </div>

            <div className="mb-6 relative">
                <input 
                    type="text" 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    placeholder="Search regional client nodes..." 
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
                />
                <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"/>
            </div>

            {filteredClients.length === 0 ? (
                <EmptyState
                    icon={UsersIcon}
                    title="Grid Search Empty"
                    message="No matching client nodes located. Provision a new node to begin tracking."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map(client => (
                        <ClientCard key={client.id} client={client} onSelect={() => setSelectedClient(client)} />
                    ))}
                </div>
            )}
            
            {isFormOpen && (
                <ClientFormModal 
                    client={editingClient} 
                    onClose={() => setIsFormOpen(false)} 
                    onSave={handleSaveClient} 
                />
            )}
        </div>
    );
};

export default ClientsPage;
