
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useAuth } from '../../hooks/useAuth';
import { QuoteRequest, QuoteStatus, QuoteItem, UserRole } from '../../types';
import { ArrowLeftIcon, DocumentTextIcon, XMarkIcon, PlusIcon, StarIcon, UserCircleIcon, ClockIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
import SupplierQuoteEditor from './SupplierQuoteEditor';
import EmptyState from '../../components/EmptyState';

// Modal for responding to a quote (Unchanged logic, kept for completeness)
const QuoteResponseModal: React.FC<{ quote: QuoteRequest; onSave: (quoteId: string, updatedItems: QuoteItem[], notes?: string) => void; onClose: () => void; }> = ({ quote, onSave, onClose }) => {
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();
    const [items, setItems] = useState<QuoteItem[]>(JSON.parse(JSON.stringify(quote.items)));
    const [notes, setNotes] = useState('');

    const handlePriceChange = (productId: string, newPrice: string) => {
        setItems(prevItems => prevItems.map(item =>
            item.product.id === productId ? { ...item, quotedPrice: parseFloat(newPrice) || undefined } : item
        ));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(quote.id, items, notes);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-scale backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-0 max-w-3xl w-full overflow-hidden">
                <div className="bg-gray-50 p-6 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{t('quoteResponseModalTitle')}</h2>
                        <p className="text-sm text-gray-500 font-mono mt-1">#{quote.quoteNumber}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-white p-1 rounded-full shadow-sm"><XMarkIcon className="h-6 w-6"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-800 font-semibold flex items-center gap-2">
                            <UserCircleIcon className="h-5 w-5"/>
                            Request from: {quote.contractorName}
                        </p>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto pr-2 mb-6 custom-scrollbar">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 sticky top-0">
                                <tr>
                                    <th className="py-2 px-3 rounded-l-md">{t('quoteDetailsItem')}</th>
                                    <th className="py-2 px-3 text-center">{t('quoteDetailsQty')}</th>
                                    <th className="py-2 px-3 text-right">{t('quoteDetailsOriginalPrice')}</th>
                                    <th className="py-2 px-3 rounded-r-md">{t('quoteResponseNewPrice')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.map(item => (
                                    <tr key={item.product.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-3 font-medium text-gray-800">{item.product.name}</td>
                                        <td className="py-3 px-3 text-center font-bold bg-gray-50 rounded-md">{item.quantity}</td>
                                        <td className="py-3 px-3 text-right text-gray-500">{formatCurrency(item.originalPrice)}</td>
                                        <td className="py-3 px-3">
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                placeholder={item.originalPrice.toFixed(2)}
                                                value={item.quotedPrice || ''}
                                                onChange={(e) => {
                                                    const { value } = e.target;
                                                    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                                                        handlePriceChange(item.product.id, e.target.value)
                                                    }
                                                }}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-right font-semibold"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('quoteResponseNotesLabel')}</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            rows={3}
                            placeholder={t('quoteResponseNotesPlaceholder')}
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="bg-gray-100 text-gray-700 font-bold py-2.5 px-6 rounded-xl hover:bg-gray-200 transition-colors">{t('payoutCancel')}</button>
                        <button type="submit" className="bg-primary hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-transform active:scale-95">{t('quoteResponseSubmit')}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const QuoteRequestsPage: React.FC = () => {
    const { quoteRequests, respondToQuote, draftQuoteForEditing, clearDraftQuote, sendQuoteToContractor } = useData();
    const { user } = useAuth();
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();
    const [modalQuote, setModalQuote] = useState<QuoteRequest | null>(null);
    const [view, setView] = useState<'incoming' | 'sent'>('incoming');
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [quoteToEdit, setQuoteToEdit] = useState<Omit<QuoteRequest, 'id' | 'quoteNumber' | 'createdAt' | 'updatedAt'> | null>(null);

    const { incomingRequests, sentQuotes } = useMemo(() => {
        if (!user) return { incomingRequests: [], sentQuotes: [] };
        const allQuotes = quoteRequests
            .filter(q => q.supplierId === user.id)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        return {
            incomingRequests: allQuotes.filter(q => q.initiatedBy !== UserRole.Supplier),
            sentQuotes: allQuotes.filter(q => q.initiatedBy === UserRole.Supplier),
        }
    }, [quoteRequests, user]);

    const handleSave = async (quoteData: Omit<QuoteRequest, 'id' | 'quoteNumber' | 'createdAt' | 'updatedAt'>) => {
        await sendQuoteToContractor(quoteData);
        setIsEditorOpen(false);
        setQuoteToEdit(null);
    };

    const handleResponseSave = (quoteId: string, updatedItems: QuoteItem[], notes?: string) => {
        respondToQuote(quoteId, updatedItems, notes);
        setModalQuote(null);
    };

    React.useEffect(() => {
        if(draftQuoteForEditing) {
            setQuoteToEdit(draftQuoteForEditing);
            setIsEditorOpen(true);
            clearDraftQuote();
        }
    }, [draftQuoteForEditing, clearDraftQuote]);

    const handleCreateNew = () => {
        setQuoteToEdit(null);
        setIsEditorOpen(true);
    };

    // Mock Customer Tier for visual flair (random for demo)
    const getCustomerTier = (name: string) => {
        const hash = name.length;
        if (hash % 3 === 0) return { label: 'Gold Tier', color: 'bg-yellow-100 text-yellow-800', icon: 'text-yellow-500' };
        if (hash % 3 === 1) return { label: 'Silver Tier', color: 'bg-gray-100 text-gray-800', icon: 'text-gray-400' };
        return { label: 'New Client', color: 'bg-green-100 text-green-800', icon: 'text-green-500' };
    };

    const quotesToShow = view === 'incoming' ? incomingRequests : sentQuotes;

    return (
        <>
            <div className="pb-12">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                            <DocumentTextIcon className="h-8 w-8 text-primary"/> {t('supplierQuotesTitle')}
                        </h2>
                        <p className="text-gray-600 mt-1">{t('supplierQuotesDesc')}</p>
                    </div>
                     <button onClick={handleCreateNew} className="bg-secondary hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-md transition-transform hover:-translate-y-0.5 active:scale-95">
                        <PlusIcon className="h-5 w-5"/>
                        {t('quotesCreateNew')}
                    </button>
                </div>
                
                 {/* Tabs */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit mb-6">
                    <button 
                        onClick={() => setView('incoming')} 
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${view === 'incoming' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {t('quotesIncoming')} <span className="ml-1 bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">{incomingRequests.length}</span>
                    </button>
                    <button 
                        onClick={() => setView('sent')} 
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${view === 'sent' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {t('quotesSent')} <span className="ml-1 bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">{sentQuotes.length}</span>
                    </button>
                </div>

                {quotesToShow.length === 0 ? (
                    <EmptyState
                        icon={DocumentTextIcon}
                        title={t('supplierQuotesNoRequests')}
                        message={view === 'incoming' ? "New requests from contractors will appear here." : "You haven't sent any sales orders yet."}
                    />
                ) : (
                    <div className="space-y-4">
                        {quotesToShow.map(quote => {
                             const tier = getCustomerTier(quote.contractorName);
                             const isPending = quote.status === QuoteStatus.Pending;
                             
                             return (
                                <div key={quote.id} className={`bg-white rounded-xl p-0 shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden group ${isPending ? 'border-l-4 border-l-blue-500' : ''}`}>
                                    <div className="p-6 flex flex-col md:flex-row items-center gap-6">
                                        {/* Icon/Avatar */}
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 border border-gray-200 shadow-inner">
                                                <span className="font-bold text-lg">{quote.contractorName.charAt(0)}</span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-grow min-w-0 w-full md:w-auto text-center md:text-left">
                                            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                                                <h4 className="font-bold text-lg text-gray-900 truncate">{quote.contractorName}</h4>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit mx-auto md:mx-0 ${tier.color}`}>
                                                    <StarIcon className={`h-3 w-3 ${tier.icon}`}/> {tier.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 flex items-center justify-center md:justify-start gap-3">
                                                <span className="font-mono bg-gray-100 px-1.5 rounded text-gray-600">#{quote.quoteNumber}</span>
                                                <span className="flex items-center gap-1"><ClockIcon className="h-3 w-3"/> {new Date(quote.createdAt).toLocaleDateString()}</span>
                                            </p>
                                        </div>

                                        {/* Value & Action */}
                                        <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                             <div>
                                                 <p className="text-xs text-gray-400 uppercase font-bold text-center md:text-right mb-0.5">Value</p>
                                                 <p className="text-xl font-extrabold text-gray-900">{formatCurrency(quote.quotedTotal || quote.total)}</p>
                                             </div>
                                             
                                             {view === 'incoming' && quote.status === QuoteStatus.Pending ? (
                                                 <button 
                                                    onClick={() => setModalQuote(quote)} 
                                                    className="bg-primary hover:bg-blue-700 text-white text-sm font-bold py-2 px-6 rounded-lg shadow-md transition-colors w-full md:w-auto"
                                                >
                                                    Respond
                                                </button>
                                             ) : (
                                                 <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                                     quote.status === QuoteStatus.Accepted ? 'bg-green-50 text-green-700 border-green-200' : 
                                                     quote.status === QuoteStatus.Declined ? 'bg-red-50 text-red-700 border-red-200' :
                                                     'bg-gray-50 text-gray-600 border-gray-200'
                                                 }`}>
                                                     {quote.status}
                                                 </span>
                                             )}
                                        </div>
                                    </div>
                                    
                                    {/* Items Preview (Collapsible idea, but keeping simple for now) */}
                                    <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500 border-t border-gray-100 flex justify-between items-center">
                                        <span>
                                            Includes: <span className="font-medium text-gray-700">{quote.items.length} items</span> ({quote.items[0]?.product.name} {quote.items.length > 1 ? `+ ${quote.items.length - 1} more` : ''})
                                        </span>
                                        <ChevronRightIcon className="h-4 w-4 text-gray-400"/>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {modalQuote && <QuoteResponseModal quote={modalQuote} onSave={handleResponseSave} onClose={() => setModalQuote(null)} />}
            {isEditorOpen && (
                <SupplierQuoteEditor
                    initialQuote={quoteToEdit}
                    onSave={handleSave}
                    onCancel={() => { setIsEditorOpen(false); setQuoteToEdit(null); }}
                />
            )}
        </>
    )
}

export default QuoteRequestsPage;
