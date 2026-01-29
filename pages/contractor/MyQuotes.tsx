import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext.tsx';
import { useAuth } from '../../hooks/useAuth';
import { QuoteRequest, QuoteStatus, UserRole } from '../../types';
import { ArrowLeftIcon, DocumentTextIcon, ChevronDownIcon, CheckCircleIcon, PaperClipIcon, ShieldCheckIcon, BanknotesIcon, ClockIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
import PaymentModal from '../../components/PaymentModal';
import CreateProjectFromQuoteModal from '../../components/CreateProjectFromQuoteModal';
import EmptyState from '../../components/EmptyState';

const getStatusConfig = (status: QuoteStatus) => {
    switch (status) {
        case QuoteStatus.Pending: return { text: 'PENDING', color: 'text-yellow-600 border-yellow-600', rotate: '-rotate-12' };
        case QuoteStatus.Responded: return { text: 'RESPONDED', color: 'text-blue-600 border-blue-600', rotate: 'rotate-6' };
        case QuoteStatus.Accepted: return { text: 'ACCEPTED', color: 'text-emerald-600 border-emerald-600', rotate: '-rotate-6' };
        case QuoteStatus.Declined: return { text: 'DECLINED', color: 'text-red-600 border-red-600', rotate: 'rotate-12' };
        case QuoteStatus.Expired: return { text: 'EXPIRED', color: 'text-gray-500 border-gray-500', rotate: 'rotate-3' };
        default: return { text: 'UNKNOWN', color: 'text-gray-400 border-gray-400', rotate: 'rotate-0' };
    }
}

const QuoteCard: React.FC<{ 
    quote: QuoteRequest; 
    supplierName: string; 
    isExpanded: boolean; 
    toggleExpand: () => void;
    onAccept: () => void;
    onNegotiate: () => void;
    onDecline: () => void;
}> = ({ quote, supplierName, isExpanded, toggleExpand, onAccept, onNegotiate, onDecline }) => {
    const { formatCurrency } = useCurrency();
    const statusConfig = getStatusConfig(quote.status);
    const canTakeAction = quote.status === QuoteStatus.Responded;

    return (
        <div className="relative group perspective-1000">
            {/* Paper stack depth */}
            <div className="absolute top-2 left-2 w-full h-full bg-slate-200 rounded-2xl -z-10 transform translate-z-[-10px] group-hover:translate-x-1 group-hover:translate-y-1 transition-transform"></div>
            
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
                {/* Tactical Header Overlay */}
                <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600"></div>
                
                {/* Paper Clip Visual */}
                <div className="absolute top-0 left-12 text-slate-400 z-10 transform -translate-y-4 group-hover:translate-y-[-10px] transition-transform">
                    <PaperClipIcon className="h-14 w-14 drop-shadow-xl opacity-80" />
                </div>

                <div className="p-8 pt-12 relative">
                    {/* Ink Stamp Status */}
                    <div className={`absolute top-10 right-10 border-[6px] rounded-xl px-4 py-2 font-black text-2xl uppercase opacity-20 mix-blend-multiply transition-all duration-700 group-hover:opacity-40 group-hover:scale-110 pointer-events-none transform ${statusConfig.rotate} ${statusConfig.color}`}>
                        {statusConfig.text}
                    </div>

                    <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.5em] font-mono">Mandate SEQ: {quote.quoteNumber}</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic text-left leading-none">
                                Request from {supplierName}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                                <ClockIcon className="h-3 w-3" /> Grid Timestamp: {new Date(quote.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 flex flex-col sm:flex-row items-end sm:items-center justify-between border-t-2 border-dashed border-slate-100 pt-8 gap-6 relative z-10 text-left">
                        <div className="text-left">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 text-left">Settlement Value</p>
                            <p className="text-5xl font-black text-slate-900 tracking-tighter italic text-left leading-none">
                                {formatCurrency(quote.quotedTotal || quote.total)}
                            </p>
                        </div>
                        
                        <div className="flex gap-4 w-full sm:w-auto">
                             {canTakeAction && (
                                <>
                                    <button 
                                        onClick={onAccept} 
                                        className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-10 rounded-2xl shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3 uppercase text-xs tracking-widest border border-white/10"
                                    >
                                        <ShieldCheckIcon className="h-5 w-5"/> Authorize
                                    </button>
                                    <button 
                                        onClick={onNegotiate} 
                                        className="flex-1 sm:flex-none bg-slate-900 text-white font-black py-4 px-8 rounded-2xl transition-all hover:bg-black uppercase text-xs tracking-widest"
                                    >
                                        Counter
                                    </button>
                                </>
                            )}
                            <button onClick={toggleExpand} className="p-4 text-slate-300 hover:text-slate-900 transition-all rounded-2xl bg-slate-50 border border-slate-100 group-hover:border-blue-500/30">
                                <ChevronDownIcon className={`h-6 w-6 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dossier Detail Area */}
                {isExpanded && (
                    <div className="bg-slate-50 p-10 border-t-2 border-slate-100 animate-fade-in text-left">
                         <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-inner space-y-6 text-left">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] border-b border-slate-100 pb-4 text-left">Material Schematic</h4>
                            <div className="space-y-4 text-left">
                                {quote.items.map(item => (
                                    <div key={item.product.id} className="flex justify-between items-center group/row text-left">
                                        <div className="text-left">
                                            <p className="font-black text-slate-800 text-sm uppercase tracking-tight text-left">{item.product.name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 text-left">Allocation: {item.quantity} Units</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-slate-900 text-base">{formatCurrency(item.quotedPrice || item.originalPrice)}</p>
                                            {item.quotedPrice && item.quotedPrice < item.originalPrice && (
                                                <span className="text-[9px] font-black text-emerald-600 uppercase">Saving: {formatCurrency(item.originalPrice - item.quotedPrice)}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {(quote.supplierNotes || quote.notes) && (
                                <div className="mt-8 pt-8 border-t border-slate-100 relative text-left">
                                    <div className="absolute top-8 left-0 w-1.5 h-12 bg-blue-600 rounded-full"></div>
                                    <div className="pl-6 text-left">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-left">Supplier Protocol Notes</p>
                                        <p className="text-sm text-slate-600 italic leading-loose font-serif text-left">"{quote.supplierNotes || quote.notes}"</p>
                                    </div>
                                </div>
                            )}
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const MyQuotes: React.FC<{ onNavigateToOrders: () => void; onStartNegotiation: (sId: string, qId: string) => void; onBack?: () => void; }> = ({ onNavigateToOrders, onStartNegotiation, onBack }) => {
    const { quoteRequests, getSupplierById, acceptQuoteAndCreateOrder, declineQuote } = useData();
    const { currentCompany } = useAuth();
    const { t } = useLocalization();
    const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [quoteToPay, setQuoteToPay] = useState<QuoteRequest | null>(null);
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
    const [paidQuote, setPaidQuote] = useState<QuoteRequest | null>(null);

    const myQuotes = useMemo(() => {
        if (!currentCompany) return [];
        return quoteRequests
            .filter(q => q.contractorId === currentCompany.id)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [quoteRequests, currentCompany]);

    const handlePaymentSuccess = () => {
        if (quoteToPay) {
            setPaidQuote(quoteToPay);
            setIsCreateProjectModalOpen(true);
        }
        setIsPaymentModalOpen(false);
        setQuoteToPay(null);
    }

    if (myQuotes.length === 0) return <EmptyState icon={DocumentTextIcon} title="No Active Mandates" message="Add items to your sourcing pool to generate quote requests." />;

    return (
        <div className="pb-20 max-w-5xl mx-auto space-y-12 text-left">
            <div className="flex justify-between items-end border-b border-white/5 pb-10 text-left">
                <div className="text-left">
                    <div className="flex items-center gap-3 mb-2 text-left">
                        <BanknotesIcon className="h-6 w-6 text-blue-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Financial Mandate Registry v110</span>
                    </div>
                    <h2 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none text-left">Procurement <span className="text-blue-600">Dossiers</span></h2>
                </div>
            </div>

            <div className="grid gap-10 text-left">
                {myQuotes.map(quote => (
                    <QuoteCard 
                        key={quote.id}
                        quote={quote}
                        supplierName={getSupplierById(quote.supplierId)?.name || 'Grid Wholesaler'}
                        isExpanded={expandedQuoteId === quote.id}
                        toggleExpand={() => setExpandedQuoteId(expandedQuoteId === quote.id ? null : quote.id)}
                        onAccept={() => { setQuoteToPay(quote); setIsPaymentModalOpen(true); }}
                        onNegotiate={() => onStartNegotiation(quote.supplierId, quote.id)}
                        onDecline={() => declineQuote(quote.id)}
                    />
                ))}
            </div>

            {isPaymentModalOpen && quoteToPay && (
                <PaymentModal 
                    quote={quoteToPay} 
                    total={(quoteToPay.quotedTotal || quoteToPay.total) * 1.15} 
                    onClose={() => setIsPaymentModalOpen(false)} 
                    onPaymentSuccess={handlePaymentSuccess} 
                />
            )}
            
            {isCreateProjectModalOpen && paidQuote && (
                <CreateProjectFromQuoteModal
                    quote={paidQuote}
                    onClose={() => { setIsCreateProjectModalOpen(false); onNavigateToOrders(); }}
                    onCreateProject={async (qId, details) => { await acceptQuoteAndCreateOrder(qId, details); onNavigateToOrders(); }}
                    onSkip={async (qId) => { await acceptQuoteAndCreateOrder(qId); onNavigateToOrders(); }}
                />
            )}
        </div>
    )
}

export default MyQuotes;