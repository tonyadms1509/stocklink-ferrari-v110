
import React, { useState, useEffect, useMemo } from 'react';
import { getPublicProjectData, updateVariationOrderInDb } from '../../services/mockApi';
import { Project, User, ClientInvoice, InvoiceStatus, VariationOrder } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
import { 
    BuildingOffice2Icon, 
    MapPinIcon, 
    PhoneIcon, 
    EnvelopeIcon, 
    CheckCircleIcon, 
    ClockIcon, 
    PhotoIcon,
    ChatBubbleLeftRightIcon,
    DocumentTextIcon,
    ArrowLeftIcon,
    ListBulletIcon,
    XCircleIcon,
    ShieldCheckIcon,
    SignalIcon
} from '@heroicons/react/24/solid';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';
// Import missing EmptyState component
import EmptyState from '../../components/EmptyState';

const PublicProjectPage: React.FC<{ projectId: string }> = ({ projectId }) => {
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();
    const [data, setData] = useState<{
        project: Project;
        contractor: User;
        invoices: ClientInvoice[];
        logs: any[];
        photos: string[];
        variations: VariationOrder[];
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'feed' | 'photos' | 'financials' | 'variations'>('feed');

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await getPublicProjectData(projectId);
            setData(result);
        } catch (error) {
            console.error("Failed to load public project data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [projectId]);
    
    const handleVariationAction = async (id: string, status: 'Approved' | 'Declined') => {
        if (!confirm(`Are you sure you want to ${status.toLowerCase()} this variation order?`)) return;
        await updateVariationOrderInDb(id, { status });
        alert(`Variation Order ${status}!`);
        fetchData();
    };

    const financials = useMemo(() => {
        if (!data) return { billed: 0, paid: 0, outstanding: 0 };
        const billed = data.invoices.reduce((sum, i) => sum + i.total, 0);
        const paid = data.invoices.filter(i => i.status === InvoiceStatus.Paid).reduce((sum, i) => sum + i.total, 0);
        return { billed, paid, outstanding: billed - paid };
    }, [data]);

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center"><div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
    if (!data) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-black uppercase tracking-widest italic">Node Access Restricted</div>;

    return (
        <div className="bg-slate-950 min-h-screen font-sans text-slate-100 flex flex-col selection:bg-blue-600/30">
            <div className="absolute inset-0 bg-carbon opacity-10 pointer-events-none"></div>
            <div className="scanline"></div>

            <header className="bg-slate-900/80 backdrop-blur-3xl border-b border-white/5 sticky top-0 z-50">
                <div className="container mx-auto px-10 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                         <div className="p-2 bg-blue-600 rounded-xl shadow-2xl">
                             <Logo className="h-8 w-auto text-white" />
                         </div>
                         <div className="text-left">
                             <h1 className="font-black text-2xl text-white italic tracking-tighter uppercase leading-none">CLIENT <span className="text-blue-500">PORTAL</span></h1>
                             <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2">StockLink Neural Bridge</p>
                         </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 md:px-10 py-12 max-w-6xl relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left: Metadata & Identity */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-slate-900 border border-white/10 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden group text-left">
                            <div className="absolute inset-0 bg-carbon opacity-10"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]"></div>
                                    <span className="text-[10px] font-black uppercase text-blue-400 tracking-[0.6em]">Project Identity</span>
                                </div>
                                <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2 leading-none">{data.project.projectName}</h2>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 mt-4">
                                    <MapPinIcon className="h-4 w-4 text-red-600"/> {data.project.address}
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-white/10 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-left">
                            <h3 className="text-xs font-black uppercase text-slate-500 tracking-[0.4em] mb-10 flex items-center gap-3">
                                <div className="w-6 h-px bg-slate-700"></div>
                                Project Manager
                            </h3>
                            <div className="flex items-center gap-6 mb-10">
                                 <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl border-4 border-slate-800 italic">
                                     {data.contractor.name.charAt(0)}
                                 </div>
                                 <div className="text-left">
                                     <p className="font-black text-white text-xl uppercase italic tracking-tighter leading-none">{data.contractor.name}</p>
                                     <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mt-2">Verified Contractor</p>
                                 </div>
                            </div>
                            <div className="space-y-3">
                                 {data.contractor.contact?.phone && (
                                    <a href={`https://wa.me/${data.contractor.contact.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 uppercase text-[10px] tracking-widest">
                                        <ChatBubbleLeftRightIcon className="h-5 w-5"/> WhatsApp Direct
                                    </a>
                                 )}
                                 <a href={`mailto:${data.contractor.email}`} className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all uppercase text-[10px] tracking-widest">
                                    <EnvelopeIcon className="h-5 w-5 text-blue-500"/> Transmission Node
                                 </a>
                            </div>
                        </div>
                    </div>

                    {/* Right: Mission Content */}
                    <div className="lg:col-span-8 space-y-10">
                         <div className="flex bg-slate-900 p-2 rounded-[2.5rem] border border-white/5 shadow-2xl w-full">
                            <button onClick={() => setActiveTab('feed')} className={`flex-1 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'feed' ? 'bg-red-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}>Timeline</button>
                            <button onClick={() => setActiveTab('photos')} className={`flex-1 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'photos' ? 'bg-red-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}>Gallery</button>
                            <button onClick={() => setActiveTab('variations')} className={`flex-1 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'variations' ? 'bg-red-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}>Variations</button>
                            <button onClick={() => setActiveTab('financials')} className={`flex-1 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'financials' ? 'bg-red-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}>Ledger</button>
                        </div>

                        <div className="min-h-[500px] animate-fade-in-up">
                            {activeTab === 'feed' && (
                                <div className="space-y-8 text-left">
                                    {data.logs.length === 0 ? (
                                        <EmptyState icon={SignalIcon} title="GRID IDLE" message="Awaiting operational data transmissions from site." />
                                    ) : (
                                        <div className="relative space-y-8 text-left border-l-2 border-white/5 pl-8 ml-4">
                                            {data.logs.map(log => (
                                                <div key={log.id} className="bg-slate-900 border border-white/5 p-8 rounded-[3rem] shadow-xl relative group hover:border-blue-500/30 transition-all">
                                                    <div className="absolute -left-[41px] top-10 w-4 h-4 bg-slate-950 rounded-full border-4 border-blue-600 shadow-[0_0_10px_#2563eb]"></div>
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 font-mono">{new Date(log.date).toLocaleString()}</p>
                                                    <p className="text-xl text-slate-200 font-medium italic leading-relaxed whitespace-pre-wrap font-serif">"{log.content}"</p>
                                                    {log.images && log.images.length > 0 && (
                                                        <div className="flex gap-4 mt-8 overflow-x-auto pb-4 custom-scrollbar">
                                                            {log.images.map((img: string, i: number) => (
                                                                <img key={i} src={img} alt="Update" className="h-32 w-32 object-cover rounded-3xl border border-white/5 grayscale group-hover:grayscale-0 transition-all duration-1000"/>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'photos' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {data.photos.map((img, i) => (
                                        <div key={i} className="aspect-square rounded-[2.5rem] overflow-hidden bg-slate-900 border border-white/5 hover:border-red-600/30 transition-all shadow-xl group">
                                            <img src={img} alt={`Ref ${i}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"/>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {activeTab === 'variations' && (
                                <div className="space-y-6">
                                    {data.variations.map(vo => (
                                        <div key={vo.id} className="bg-slate-900 border border-white/5 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group text-left">
                                            <div className="absolute inset-0 bg-carbon opacity-5"></div>
                                            <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-10 text-left">
                                                <div className="flex-grow text-left">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <span className="text-sm font-black text-white italic uppercase tracking-tighter underline decoration-red-600 decoration-4 underline-offset-4">{vo.number}</span>
                                                        <span className={`text-[9px] font-black px-3 py-1 rounded-lg border uppercase tracking-widest ${vo.status === 'Approved' ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-600/10 text-amber-400 border-amber-500/20'}`}>
                                                            {vo.status}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{vo.title}</h4>
                                                    <p className="text-slate-400 mt-6 leading-loose italic font-medium">"{vo.description}"</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Cost Impact</p>
                                                     <p className={`text-4xl font-black italic tracking-tighter ${vo.costImpact > 0 ? 'text-red-500' : 'text-emerald-400'}`}>
                                                        {vo.costImpact > 0 ? '+' : ''}{formatCurrency(vo.costImpact)}
                                                    </p>
                                                </div>
                                            </div>

                                            {(vo.status === 'Sent' || vo.status === 'Draft') && (
                                                <div className="flex gap-4 pt-10 border-t border-white/5">
                                                    <button onClick={() => handleVariationAction(vo.id, 'Declined')} className="flex-1 bg-white/5 hover:bg-red-600 text-slate-500 hover:text-white font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest transition-all">Decline Protocol</button>
                                                    <button onClick={() => handleVariationAction(vo.id, 'Approved')} className="flex-2 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-10 rounded-2xl uppercase text-[10px] tracking-widest shadow-xl transition-all border border-white/10">Authorize Implementation</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'financials' && (
                                <div className="space-y-10">
                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                                        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-xl text-left">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Dossier Value</p>
                                            <p className="text-3xl font-black text-white italic tracking-tighter">{formatCurrency(financials.billed)}</p>
                                        </div>
                                        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-xl text-left">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Settled Capital</p>
                                            <p className="text-3xl font-black text-emerald-400 italic tracking-tighter">{formatCurrency(financials.paid)}</p>
                                        </div>
                                        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-xl text-left">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Outstanding Credit</p>
                                            <p className={`text-3xl font-black italic tracking-tighter ${financials.outstanding > 0 ? 'text-red-500' : 'text-slate-400'}`}>{formatCurrency(financials.outstanding)}</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl text-left">
                                        <div className="p-8 border-b border-white/5 bg-slate-950/50">
                                            <h3 className="font-black text-white uppercase italic tracking-tighter text-xl">Operational Invoices</h3>
                                        </div>
                                        <div className="divide-y divide-white/5">
                                            {data.invoices.map(inv => (
                                                <div key={inv.id} className="p-8 flex justify-between items-center hover:bg-white/5 transition-all group">
                                                    <div className="text-left">
                                                        <p className="font-black text-white italic uppercase tracking-tighter text-lg leading-none">INV-{inv.invoiceNumber}</p>
                                                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-2">{new Date(inv.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="text-right flex items-center gap-10">
                                                        <p className="font-black text-white text-2xl tracking-tighter italic">{formatCurrency(inv.total)}</p>
                                                        <span className={`px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${inv.status === 'Paid' ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-800 text-slate-500 border-white/5'}`}>
                                                            {inv.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            
            <div className="fixed bottom-10 right-10 pointer-events-none opacity-[0.03] -z-10 rotate-90 select-none text-left">
                <span className="text-[180px] font-black tracking-tighter text-white uppercase italic leading-none">PROJECT_HUD</span>
            </div>

            <Footer />
        </div>
    );
};

export default PublicProjectPage;
