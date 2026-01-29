
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { ArrowLeftIcon, TrashIcon, ShoppingCartIcon, CheckCircleIcon, BriefcaseIcon, CameraIcon, MinusIcon, PlusIcon, TruckIcon, BuildingStorefrontIcon } from '@heroicons/react/24/solid';
import { useCurrency } from '../../hooks/useCurrency';
import { useLocalization } from '../../hooks/useLocalization';
import EmptyState from '../../components/EmptyState';
import ListScannerModal from '../../components/ListScannerModal';
import { Product, CartItem } from '../../types';
import AnimatedNumber from '../../components/AnimatedNumber';
import CartAIAnalysis from '../../components/CartAIAnalysis';

interface QuoteBuilderPageProps {
    onQuoteSubmitted: () => void;
    onNavigateToProjects: () => void;
}

const QuoteBuilderPage: React.FC<QuoteBuilderPageProps> = ({ onQuoteSubmitted, onNavigateToProjects }) => {
  const { cart, updateCartQuantity, removeFromCart, clearCart, getSupplierById, submitQuoteRequest, projects, addToCart } = useData();
  const { t } = useLocalization();
  const { formatCurrency } = useCurrency();
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const subtotal = cart.reduce((sum, item) => sum + (item.discountPrice || item.price) * item.quantity, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  // Group items by Supplier
  const groupedCart = useMemo(() => {
      const groups = new Map<string, CartItem[]>();
      cart.forEach(item => {
          const list = groups.get(item.supplierId) || [];
          list.push(item);
          groups.set(item.supplierId, list);
      });
      return groups;
  }, [cart]);

  const handleSubmitQuote = async () => {
    if (!selectedProjectId) {
      alert("Please select a project for this quote.");
      return;
    }
    setIsSubmitting(true);
    const { success } = await submitQuoteRequest(selectedProjectId);
    if (success) {
        setQuoteSubmitted(true);
    }
    setIsSubmitting(false);
  }

  const handleAddScannedItems = (items: { product: Product; quantity: number }[]) => {
      items.forEach(item => {
          addToCart(item.product, item.quantity);
      });
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Mock Free Delivery Threshold (R5000)
  const DELIVERY_THRESHOLD = 5000;

  if (quoteSubmitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-2xl shadow-xl max-w-lg w-full animate-fade-in-scale">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{t('quoteSubmittedTitle')}</h2>
            <p className="text-gray-500 mb-8">{t('quoteSubmittedDesc')}</p>
            <button onClick={onQuoteSubmitted} className="w-full bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-transform transform active:scale-95 shadow-md">
                {t('quoteSubmittedBtn')}
            </button>
        </div>
      </div>
    )
  }
  
  return (
      <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">{t('quoteBuilderTitle')}</h2>
            <p className="text-gray-500 mt-1">Review items and request quotes from suppliers.</p>
          </div>
          <button 
                onClick={() => setIsScannerOpen(true)}
                className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-5 rounded-xl transition-colors border border-gray-200 shadow-sm"
            >
                <CameraIcon className="h-5 w-5 text-gray-500" />
                Scan List
            </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-2 space-y-6">
            {projects.length === 0 ? (
                <EmptyState
                    icon={BriefcaseIcon}
                    title="Create a Project First"
                    message="You need to create a project before you can build a quote. This helps keep your materials organized."
                    action={
                        <button onClick={onNavigateToProjects} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
                            Go to My Projects
                        </button>
                    }
                />
            ) : cart.length === 0 ? (
                 <EmptyState
                    icon={ShoppingCartIcon}
                    title={t('quoteCartEmptyTitle')}
                    message={t('quoteCartEmptyDesc')}
                    action={
                        <button onClick={() => window.location.hash = '#/home'} className="text-primary hover:underline font-semibold mt-2">
                            Browse Products
                        </button>
                    }
                />
            ) : (
                <>
                    <CartAIAnalysis items={cart} />

                    {Array.from(groupedCart.entries()).map(([supplierId, items]) => {
                        const supplier = getSupplierById(supplierId);
                        const supplierTotal = items.reduce((sum, item) => sum + (item.discountPrice || item.price) * item.quantity, 0);
                        const progress = Math.min((supplierTotal / DELIVERY_THRESHOLD) * 100, 100);
                        const toFree = Math.max(0, DELIVERY_THRESHOLD - supplierTotal);

                        return (
                            <div key={supplierId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {/* Supplier Header */}
                                <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-400">
                                            {supplier?.logoUrl ? <img src={supplier.logoUrl} className="w-full h-full object-cover rounded-lg" alt=""/> : <BuildingStorefrontIcon className="h-6 w-6"/>}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{supplier?.name || 'Unknown Supplier'}</h3>
                                            <p className="text-xs text-gray-500">{items.length} items</p>
                                        </div>
                                    </div>
                                    {toFree > 0 ? (
                                        <div className="w-full sm:w-48">
                                            <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500 mb-1">
                                                <span>Free Delivery</span>
                                                <span>Add {formatCurrency(toFree)}</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-orange-400 rounded-full" style={{ width: `${progress}%` }}></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                            <TruckIcon className="h-3 w-3"/> Free Delivery Qualified
                                        </div>
                                    )}
                                </div>

                                {/* Items List */}
                                <div className="divide-y divide-gray-100">
                                    {items.map(item => {
                                        const price = item.discountPrice || item.price;
                                        return (
                                            <div key={item.id} className="p-4 flex gap-4 hover:bg-gray-50 transition-colors group">
                                                <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-lg border border-gray-100 bg-white"/>
                                                
                                                <div className="flex-grow flex flex-col justify-between">
                                                    <div>
                                                        <h4 className="font-bold text-gray-800 text-sm line-clamp-2">{item.name}</h4>
                                                        <p className="text-xs text-gray-500 mt-0.5">{item.brand} • {item.category}</p>
                                                    </div>
                                                    <div className="flex justify-between items-end mt-2">
                                                        <div className="font-bold text-gray-900">
                                                            {formatCurrency(price)} 
                                                            <span className="text-xs text-gray-400 font-normal ml-1">/ unit</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end justify-between">
                                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 p-1">
                                                        <TrashIcon className="h-4 w-4"/>
                                                    </button>
                                                    <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                                                        <button 
                                                            onClick={() => updateCartQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-l-lg"
                                                        >
                                                            <MinusIcon className="h-3 w-3"/>
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => updateCartQuantity(item.id, parseInt(e.target.value, 10) || 1)}
                                                            className="w-10 text-center text-sm font-bold border-none focus:ring-0 p-0 text-gray-800"
                                                        />
                                                        <button 
                                                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-r-lg"
                                                        >
                                                            <PlusIcon className="h-3 w-3"/>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </>
            )}
        </div>

        {/* Right Column: Sticky Summary */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 sticky top-24">
                <h3 className="text-lg font-extrabold text-gray-900 mb-4">{t('quoteSummaryTitle')}</h3>
                
                <div className="mb-6">
                    <label htmlFor="project-select" className="block text-xs font-bold text-gray-500 uppercase mb-2">Assign to Project</label>
                    <select
                        id="project-select"
                        value={selectedProjectId}
                        onChange={e => setSelectedProjectId(e.target.value)}
                        className="block w-full p-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-primary focus:border-primary bg-gray-50 font-medium"
                    >
                        <option value="" disabled>-- Select Project --</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                    </select>
                </div>

                <div className="space-y-3 text-sm text-gray-600 mb-6 pb-6 border-b border-dashed border-gray-200">
                    <div className="flex justify-between">
                        <span>Items Subtotal</span>
                        <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Estimated VAT (15%)</span>
                        <span className="font-medium text-gray-900">{formatCurrency(vat)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-gray-800 text-base">{t('quoteTotalEstimate')}</span>
                        <span className="font-black text-2xl text-primary">
                            <AnimatedNumber value={total} format={formatCurrency} />
                        </span>
                    </div>
                </div>

                <button 
                    onClick={handleSubmitQuote} 
                    disabled={!selectedProjectId || cart.length === 0 || isSubmitting}
                    className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                        <>Request Quotes <ArrowLeftIcon className="h-4 w-4 rotate-180"/></>
                    )}
                </button>
                
                <button 
                    onClick={clearCart} 
                    disabled={cart.length === 0} 
                    className="w-full mt-3 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider"
                >
                    {t('quoteClearCart')}
                </button>

                <div className="mt-6 bg-blue-50 p-3 rounded-lg flex gap-3 items-start">
                    <CheckCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5"/>
                    <p className="text-xs text-blue-800 leading-relaxed">
                        Submitting this request is free. You will receive official quotes from suppliers shortly, which you can accept or negotiate.
                    </p>
                </div>
            </div>
        </div>
      </div>
      
      {isScannerOpen && (
          <ListScannerModal 
            onClose={() => setIsScannerOpen(false)} 
            onAddItems={handleAddScannedItems}
          />
      )}
      </>
  );
};

export default QuoteBuilderPage;
