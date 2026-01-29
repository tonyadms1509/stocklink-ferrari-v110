
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
import { Product, QuoteItem, User, QuoteRequest, UserRole, QuoteStatus } from '../../types';
import { ArrowLeftIcon, PlusIcon, TrashIcon, MagnifyingGlassIcon, XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../hooks/useAuth';

interface SupplierQuoteEditorProps {
    initialQuote?: Omit<QuoteRequest, 'id' | 'quoteNumber' | 'createdAt' | 'updatedAt'> | null;
    onSave: (quoteData: Omit<QuoteRequest, 'id' | 'quoteNumber' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
}

const SupplierQuoteEditor: React.FC<SupplierQuoteEditorProps> = ({ initialQuote, onSave, onCancel }) => {
    const { t } = useLocalization();
    const { users, products } = useData();
    const { user } = useAuth();
    const { formatCurrency } = useCurrency();

    const [selectedContractorId, setSelectedContractorId] = useState(initialQuote?.contractorId || '');
    const [items, setItems] = useState<QuoteItem[]>(initialQuote?.items || []);
    const [notes, setNotes] = useState(initialQuote?.notes || '');
    const [searchTerm, setSearchTerm] = useState('');

    const contractors = useMemo(() => users.filter(u => u.role === UserRole.Contractor), [users]);
    
    const filteredProducts = useMemo(() =>
        searchTerm
            ? products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5)
            : [],
        [searchTerm, products]
    );

    const handleAddProduct = (product: Product) => {
        setItems(prev => {
            const existingItem = prev.find(i => i.product.id === product.id);
            if (existingItem) {
                return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [
                ...prev,
                {
                    product,
                    quantity: 1,
                    originalPrice: product.price,
                    quotedPrice: product.discountPrice || product.price,
                }
            ]
        });
        setSearchTerm('');
    };

    const handleItemChange = (productId: string, field: 'quantity' | 'quotedPrice', value: number) => {
        setItems(prev => prev.map(item =>
            item.product.id === productId ? { ...item, [field]: value } : item
        ));
    };

    const removeItem = (productId: string) => {
        setItems(prev => prev.filter(item => item.product.id !== productId));
    };

    const total = useMemo(() => items.reduce((sum, item) => sum + (item.quotedPrice || item.originalPrice) * item.quantity, 0), [items]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const contractor = contractors.find(c => c.id === selectedContractorId);
        if (!user || !contractor || items.length === 0) {
            alert("Please select a contractor and add at least one item.");
            return;
        }

        onSave({
            contractorId: contractor.id,
            contractorName: contractor.name,
            participantIds: [user.id, contractor.id],
            supplierId: user.id,
            items,
            notes,
            total,
            quotedTotal: total,
            status: QuoteStatus.Pending,
            initiatedBy: UserRole.Supplier,
        });
    };

    return (
         <div className="fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50 p-4 animate-fade-in-scale backdrop-blur-sm">
            <div className="bg-white shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col rounded-md overflow-hidden border border-gray-300 relative">
                {/* Top Toolbar */}
                <div className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-md z-10">
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={onCancel} className="hover:bg-gray-700 p-2 rounded-full transition-colors">
                            <ArrowLeftIcon className="h-5 w-5"/>
                        </button>
                        <h2 className="text-lg font-bold tracking-wide">{initialQuote ? 'Review AI Draft' : 'New Sales Order'}</h2>
                    </div>
                    <div className="text-sm opacity-70 font-mono">{new Date().toLocaleDateString()}</div>
                </div>

                <div className="flex-grow bg-[#f3f4f6] flex flex-col md:flex-row overflow-hidden">
                    {/* Left: Invoice Pad */}
                    <div className="flex-grow p-8 overflow-y-auto bg-white shadow-lg m-4 rounded-sm border border-gray-200 flex flex-col relative">
                         {/* Watermark */}
                         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                             <DocumentTextIcon className="h-96 w-96"/>
                         </div>

                        {/* Header Info */}
                        <div className="flex justify-between mb-8 border-b-2 border-gray-800 pb-4 z-10">
                            <div>
                                <h3 className="text-2xl font-extrabold text-gray-900 mb-1">INVOICE</h3>
                                <p className="text-gray-500 text-sm font-bold">{user?.name}</p>
                            </div>
                            <div className="w-64">
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Bill To:</label>
                                <select 
                                    value={selectedContractorId} 
                                    onChange={e => setSelectedContractorId(e.target.value)} 
                                    className="w-full p-2 border-b-2 border-gray-200 focus:border-primary bg-transparent font-bold text-gray-800 outline-none transition-colors" 
                                    required
                                >
                                    <option value="" disabled>Select Customer...</option>
                                    {contractors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="flex-grow z-10">
                             <div className="grid grid-cols-12 gap-4 border-b border-gray-300 pb-2 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <div className="col-span-5">Item Description</div>
                                <div className="col-span-2 text-center">Qty</div>
                                <div className="col-span-2 text-right">Price</div>
                                <div className="col-span-3 text-right">Total</div>
                             </div>
                             
                             <div className="space-y-1">
                                {items.map(item => (
                                    <div key={item.product.id} className="grid grid-cols-12 gap-4 items-center py-2 border-b border-dashed border-gray-200 group hover:bg-gray-50 px-1 rounded">
                                        <div className="col-span-5 font-medium text-gray-800 truncate">{item.product.name}</div>
                                        <div className="col-span-2">
                                            <input 
                                                type="number" 
                                                value={item.quantity} 
                                                onChange={e => handleItemChange(item.product.id, 'quantity', parseInt(e.target.value, 10))} 
                                                className="w-full text-center bg-transparent border-b border-transparent focus:border-primary outline-none font-mono"
                                            />
                                        </div>
                                        <div className="col-span-2 text-right">
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                value={item.quotedPrice} 
                                                onChange={e => handleItemChange(item.product.id, 'quotedPrice', parseFloat(e.target.value))} 
                                                className="w-full text-right bg-transparent border-b border-transparent focus:border-primary outline-none font-mono"
                                            />
                                        </div>
                                        <div className="col-span-3 text-right font-bold text-gray-900 relative">
                                            {formatCurrency(item.quantity * (item.quotedPrice || item.originalPrice))}
                                            <button onClick={() => removeItem(item.product.id)} className="absolute right-[-20px] top-0 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <TrashIcon className="h-4 w-4"/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>

                        {/* Footer / Totals */}
                        <div className="mt-8 flex justify-end z-10">
                            <div className="w-64 border-t-2 border-gray-800 pt-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-gray-600 uppercase">Total Due</span>
                                    <span className="text-3xl font-extrabold text-primary">{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>
                        
                         {/* Notes Area */}
                        <div className="mt-8 z-10">
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Notes / Terms</label>
                            <textarea 
                                value={notes} 
                                onChange={e => setNotes(e.target.value)} 
                                rows={3} 
                                className="w-full p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-gray-700 font-medium focus:ring-2 focus:ring-yellow-400 outline-none resize-none"
                                placeholder="Add delivery instructions or terms..."
                            ></textarea>
                        </div>
                    </div>

                    {/* Right: Product Search Panel */}
                    <div className="w-full md:w-80 bg-white border-l border-gray-200 p-6 flex flex-col shadow-inner z-20">
                        <h4 className="font-bold text-gray-700 mb-4">Add Products</h4>
                        <div className="relative mb-4">
                            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search catalog..."
                                className="w-full pl-10 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                        <div className="flex-grow overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {filteredProducts.map(p => (
                                <button 
                                    key={p.id} 
                                    onClick={() => handleAddProduct(p)} 
                                    className="w-full text-left p-3 rounded-lg border border-gray-100 hover:border-primary hover:bg-blue-50 transition-all group"
                                >
                                    <div className="font-bold text-sm text-gray-800 group-hover:text-primary">{p.name}</div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>{p.brand}</span>
                                        <span className="font-mono">{formatCurrency(p.price)}</span>
                                    </div>
                                </button>
                            ))}
                            {searchTerm && filteredProducts.length === 0 && (
                                <p className="text-center text-sm text-gray-400 mt-4">No products found.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white border-t border-gray-200 flex justify-end gap-4 z-20">
                    <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                    <button type="submit" className="px-8 py-2 bg-secondary text-white font-bold rounded-lg hover:bg-emerald-600 shadow-md transition-transform active:scale-95">Send Quote</button>
                </div>
            </form>
        </div>
    );
};

export default SupplierQuoteEditor;
