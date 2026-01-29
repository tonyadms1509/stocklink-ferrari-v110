
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
import { ClientQuote, ClientQuoteItem, ClientQuoteStatus, Product, InvoiceStatus } from '../../types';
import { ArrowLeftIcon, PlusIcon, TrashIcon, XMarkIcon, MagnifyingGlassIcon, DocumentTextIcon, BuildingStorefrontIcon, BanknotesIcon, PrinterIcon, PaperAirplaneIcon, CheckCircleIcon, CameraIcon } from '@heroicons/react/24/solid';
import GeneratedQuotePreviewModal from '../../components/GeneratedQuotePreviewModal';
import EmptyState from '../../components/EmptyState';
import AddItemModal from '../../components/AddItemModal';
import QuoteImportModal from '../../components/QuoteImportModal';
import { useToast } from '../../hooks/useToast';

const QuoteEditor: React.FC<{
    quote: ClientQuote | Omit<ClientQuote, 'id' | 'quoteNumber' | 'createdAt'>;
    onSave: (quote: ClientQuote | Omit<ClientQuote, 'id' | 'quoteNumber' | 'createdAt'>, finalize: boolean) => void;
    onCancel: () => void;
}> = ({ quote, onSave, onCancel }) => {
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();
    const { user } = useAuth();
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [editedQuote, setEditedQuote] = useState(quote);

    const handleFieldChange = (field: keyof typeof editedQuote, value: any) => {
        setEditedQuote(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (index: number, field: keyof ClientQuoteItem, value: any) => {
        const newItems = [...editedQuote.items];
        const numValue = field === 'quantity' ? parseInt(value, 10) || 1 : parseFloat(value) || 0;
        newItems[index] = { ...newItems[index], [field]: numValue };
        handleFieldChange('items', newItems);
    };

    const addItem = (item?: Partial<ClientQuoteItem>) => {
        const newItem: ClientQuoteItem = {
            id: `custom_${Date.now()}`,
            description: '',
            quantity: 1,
            unitPrice: 0,
            isStockLinkItem: false,
            ...item
        };
        handleFieldChange('items', [...editedQuote.items, newItem]);
    };

    const removeItem = (index: number) => {
        handleFieldChange('items', editedQuote.items.filter((_, i) => i !== index));
    };

    const subtotal = useMemo(() => editedQuote.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), [editedQuote.items]);
    const vat = subtotal * editedQuote.vatRate;
    const total = subtotal + vat;

    return (
        <div className="flex justify-center min-h-screen bg-gray-100/50 p-4 md:p-8">
            <div className="bg-white shadow-2xl max-w-4xl w-full min-h-[800px] relative animate-fade-in-up flex flex-col rounded-sm">
                <div className="sticky top-0 z-10 bg-gray-800 text-white p-4 flex justify-between items-center rounded-t-sm shadow-md">
                     <div className="flex items-center gap-4">
                        <button onClick={onCancel} className="hover:text-gray-300 transition-colors flex items-center gap-1 text-sm font-medium">
                            <ArrowLeftIcon className="h-4 w-4"/> Cancel
                        </button>
                        <h2 className="text-lg font-bold border-l border-gray-600 pl-4">{ 'id' in editedQuote ? t('clientQuoteEditorTitleEdit') : t('clientQuoteEditorTitleNew')}</h2>
                     </div>
                     <div className="flex gap-2">
                         <button onClick={() => onSave({ ...editedQuote, total }, false)} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm font-bold transition-colors">
                             Save Draft
                         </button>
                         <button onClick={() => onSave({ ...editedQuote, total }, true)} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95">
                             <PaperAirplaneIcon className="h-4 w-4"/> Generate Quote
                         </button>
                     </div>
                </div>

                <div className="p-8 md:p-12 flex-grow font-serif text-gray-800">
                    <div className="flex justify-between items-start border-b-2 border-gray-800 pb-8 mb-8">
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 uppercase mb-2">Quote</h1>
                            <p className="font-bold">{user?.name}</p>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                            <p className="text-sm text-gray-500">{user?.contact?.phone}</p>
                        </div>
                        <div className="text-right">
                            <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bill To:</label>
                                <input 
                                    type="text" 
                                    value={editedQuote.clientName} 
                                    onChange={e => handleFieldChange('clientName', e.target.value)} 
                                    className="w-full bg-transparent border-b border-gray-300 focus:border-primary focus:outline-none font-bold text-lg text-right placeholder-gray-400"
                                    placeholder="Client Name"
                                />
                            </div>
                            <div className="mt-4 text-sm font-sans text-gray-500">
                                <p>Date: {new Date().toLocaleDateString()}</p>
                                <p>Valid Until: <input type="date" value={editedQuote.expiresAt ? new Date(editedQuote.expiresAt).toISOString().split('T')[0] : ''} onChange={e => handleFieldChange('expiresAt', new Date(e.target.value))} className="bg-transparent border-b border-gray-300 focus:border-primary outline-none" /></p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="grid grid-cols-12 gap-4 font-bold text-xs uppercase text-gray-500 border-b border-gray-300 pb-2 mb-2">
                            <div className="col-span-6">Description</div>
                            <div className="col-span-2 text-center">Qty</div>
                            <div className="col-span-2 text-right">Price</div>
                            <div className="col-span-2 text-right">Total</div>
                        </div>
                        
                        <div className="space-y-2 font-sans">
                            {editedQuote.items.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-12 gap-4 items-center group hover:bg-gray-50 p-2 rounded transition-colors relative">
                                    <div className="col-span-6">
                                        <input 
                                            type="text" 
                                            value={item.description} 
                                            onChange={e => handleItemChange(index, 'description', e.target.value)} 
                                            className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none" 
                                            placeholder="Item Description"
                                            disabled={item.isStockLinkItem}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input 
                                            type="number" 
                                            min="1"
                                            value={item.quantity} 
                                            onChange={e => handleItemChange(index, 'quantity', e.target.value)} 
                                            className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none text-center"
                                        />
                                    </div>
                                    <div className="col-span-2 text-right">
                                         <input 
                                            type="number" 
                                            step="0.01"
                                            value={item.unitPrice} 
                                            onChange={e => handleItemChange(index, 'unitPrice', e.target.value)} 
                                            className="w-full bg-transparent border-b border-transparent focus:border-primary outline-none text-right"
                                        />
                                    </div>
                                    <div className="col-span-2 text-right font-medium">
                                        {formatCurrency(item.quantity * item.unitPrice)}
                                    </div>
                                    
                                    <button 
                                        onClick={() => removeItem(index)} 
                                        className="absolute -left-8 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <TrashIcon className="h-4 w-4"/>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button onClick={() => addItem()} className="text-sm font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1 border border-dashed border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">
                                <PlusIcon className="h-4 w-4"/> Add Line Item
                            </button>
                            <button onClick={() => setIsItemModalOpen(true)} className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 border border-dashed border-blue-200 px-3 py-1.5 rounded hover:bg-blue-50 transition-colors">
                                <BuildingStorefrontIcon className="h-4 w-4"/> Add from StockLink
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end border-t-2 border-gray-800 pt-4">
                        <div className="w-64 space-y-2 font-sans">
                             <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>VAT ({(editedQuote.vatRate * 100).toFixed(0)}%)</span>
                                <span>{formatCurrency(vat)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-xl text-gray-900 pt-2 border-t border-gray-200">
                                <span>Total</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12">
                        <h4 className="font-bold text-gray-700 text-sm uppercase mb-2">Terms & Notes</h4>
                        <textarea 
                            value={editedQuote.notes || ''} 
                            onChange={e => handleFieldChange('notes', e.target.value)} 
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-sans focus:ring-2 focus:ring-primary focus:border-transparent"
                            rows={4}
                            placeholder="Payment terms, delivery details, thank you note..."
                        />
                    </div>
                </div>
                
                <div className="absolute bottom-4 left-8 opacity-20 select-none pointer-events-none">
                    <span className="font-black text-6xl text-gray-300">DRAFT</span>
                </div>
            </div>
            
            {isItemModalOpen && <AddItemModal onClose={() => setIsItemModalOpen(false)} onAddItem={addItem} />}
        </div>
    );
};

// Main Page Component
const ClientQuotesPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { t } = useLocalization();
    const { user } = useAuth();
    const { clientQuotes, saveClientQuote, deleteClientQuote, createClientInvoice } = useData();
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();
    const [editingQuote, setEditingQuote] = useState<ClientQuote | Omit<ClientQuote, 'id' | 'quoteNumber' | 'createdAt'> | null>(null);
    const [previewQuote, setPreviewQuote] = useState<ClientQuote | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const handleSave = async (quoteData: ClientQuote | Omit<ClientQuote, 'id' | 'quoteNumber' | 'createdAt'>, finalize: boolean) => {
        const quoteToSave = { ...quoteData, status: finalize ? ClientQuoteStatus.Sent : ClientQuoteStatus.Draft };
        const savedId = await saveClientQuote(quoteToSave as ClientQuote | Omit<ClientQuote, 'id'>);
        setEditingQuote(null);

        if (finalize) {
            setTimeout(() => {
                const savedQuote = clientQuotes.find(q => q.id === savedId);
                if(savedQuote) setPreviewQuote(savedQuote);
            }, 300);
        }
    };

    const handleCreateNew = () => {
        if (!user) return;
        setEditingQuote({
            contractorId: user.id,
            clientName: '',
            items: [],
            vatRate: 0.15,
            total: 0,
            status: ClientQuoteStatus.Draft,
        });
    };
    
    const handleImportQuote = (items: { productName: string; quantity: number; pricePerUnit: number }[]) => {
         if (!user) return;
         
         const mappedItems: ClientQuoteItem[] = items.map((item, idx) => ({
             id: `import_${Date.now()}_${idx}`,
             description: item.productName,
             quantity: item.quantity,
             unitPrice: item.pricePerUnit,
             isStockLinkItem: false
         }));

         const total = mappedItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0) * 1.15;
         
         setEditingQuote({
            contractorId: user.id,
            clientName: '',
            items: mappedItems,
            vatRate: 0.15,
            total,
            status: ClientQuoteStatus.Draft,
        });
        setIsImportModalOpen(false);
        showToast("Quote items imported successfully.", 'success');
    };

    const handleDelete = async (quoteId: string) => {
        if (window.confirm('Are you sure you want to delete this quote?')) {
            await deleteClientQuote(quoteId);
        }
    };
    
    const handleConvertToInvoice = async (quote: ClientQuote) => {
        if (!user) return;
        const subtotal = quote.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
        const total = subtotal * (1 + quote.vatRate);
        
        await createClientInvoice({
            contractorId: user.id,
            clientName: quote.clientName,
            clientEmail: quote.clientEmail,
            items: quote.items,
            subtotal,
            vatRate: quote.vatRate,
            total,
            status: InvoiceStatus.Draft,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
            fromQuoteId: quote.id,
            notes: quote.notes
        });
        showToast("Invoice draft created from quote.", 'success');
    };
    
    const getStatusColor = (status: ClientQuoteStatus) => {
        switch (status) {
            case ClientQuoteStatus.Draft: return 'bg-gray-100 text-gray-600 border-gray-200';
            case ClientQuoteStatus.Sent: return 'bg-blue-50 text-blue-700 border-blue-200';
            case ClientQuoteStatus.Accepted: return 'bg-green-50 text-green-700 border-green-200';
            case ClientQuoteStatus.Declined: return 'bg-red-50 text-red-700 border-red-200';
        }
    };
    
    if (editingQuote) {
        return <QuoteEditor quote={editingQuote} onSave={handleSave} onCancel={() => setEditingQuote(null)} />;
    }

    return (
        <>
            <div className="h-full flex flex-col">
                {onBack && <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-4 font-medium"><ArrowLeftIcon className="h-4 w-4 mr-2" />{t('backToDashboard')}</button>}
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <div>
                        <h2 className="text-3xl font-bold flex items-center gap-3"><DocumentTextIcon className="h-8 w-8 text-primary"/> {t('clientQuotesTitle')}</h2>
                        <p className="text-gray-600 mt-1">{t('clientQuotesDescription')}</p>
                    </div>
                    <div className="flex gap-2">
                         <button onClick={() => setIsImportModalOpen(true)} className="bg-white border border-gray-300 text-gray-700 font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-sm hover:bg-gray-50 transition-colors">
                            <CameraIcon className="h-5 w-5"/>
                            Import Image
                        </button>
                        <button onClick={handleCreateNew} className="bg-secondary hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 shadow-md transition-transform hover:-translate-y-0.5">
                            <PlusIcon className="h-5 w-5"/>
                            {t('clientQuotesCreateNew')}
                        </button>
                    </div>
                </div>

                {clientQuotes.length === 0 ? (
                    <EmptyState
                        icon={DocumentTextIcon}
                        title={t('clientQuotesNoQuotes')}
                        message={t('clientQuotesNoQuotesDesc')}
                    />
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-grow">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="p-4 font-semibold text-gray-600">Quote #</th>
                                        <th className="p-4 font-semibold text-gray-600">Client</th>
                                        <th className="p-4 font-semibold text-gray-600 text-right">Total</th>
                                        <th className="p-4 font-semibold text-gray-600 text-center">Status</th>
                                        <th className="p-4 font-semibold text-gray-600">Date</th>
                                        <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {clientQuotes.map(quote => {
                                        const total = quote.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0) * (1 + quote.vatRate);
                                        return (
                                            <tr key={quote.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="p-4 font-mono font-bold text-primary">{quote.quoteNumber}</td>
                                                <td className="p-4 font-medium text-gray-900">{quote.clientName}</td>
                                                <td className="p-4 text-right font-bold">{formatCurrency(total)}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border flex items-center justify-center w-fit mx-auto gap-1 ${getStatusColor(quote.status)}`}>
                                                        {quote.status === ClientQuoteStatus.Accepted && <CheckCircleIcon className="h-3 w-3"/>}
                                                        {t(`clientQuoteStatus_${quote.status}` as any)}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-500">{new Date(quote.createdAt).toLocaleDateString()}</td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => setEditingQuote(quote)} className="p-1.5 text-gray-500 hover:text-primary bg-gray-100 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                                                            <span className="sr-only">Edit</span>
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" /><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" /></svg>
                                                        </button>
                                                        {quote.status === ClientQuoteStatus.Accepted && (
                                                            <button 
                                                                onClick={() => handleConvertToInvoice(quote)} 
                                                                title="Convert to Invoice"
                                                                className="p-1.5 text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                                                            >
                                                                <BanknotesIcon className="h-4 w-4"/>
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleDelete(quote.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                                                            <TrashIcon className="h-4 w-4"/>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            {previewQuote && <GeneratedQuotePreviewModal quote={previewQuote} onClose={() => setPreviewQuote(null)} />}
            {isImportModalOpen && <QuoteImportModal onClose={() => setIsImportModalOpen(false)} onImport={handleImportQuote} />}
        </>
    );
};

export default ClientQuotesPage;
