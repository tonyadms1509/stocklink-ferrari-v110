

import React, { useState } from 'react';
import { useData } from '../../hooks/useDataContext';
import { Product } from '../../types';
import { TagIcon, XMarkIcon, PlusIcon, FireIcon, ReceiptPercentIcon } from '@heroicons/react/24/solid';
import { useCurrency } from '../../hooks/useCurrency';
import { useLocalization } from '../../hooks/useLocalization';
import { useAuth } from '../../hooks/useAuth';
import EmptyState from '../../components/EmptyState';

// --- Promotion Card Component ---
const PromotionCard: React.FC<{ product: Product; onEdit: () => void }> = ({ product, onEdit }) => {
    const { formatCurrency } = useCurrency();
    const discount = product.discountPrice ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

    return (
        <div className="relative bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 group hover:shadow-md transition-all duration-300">
            {/* Visual "Punch Hole" effects for voucher look */}
            <div className="absolute -left-3 top-1/2 w-6 h-6 bg-gray-50 rounded-full z-10"></div>
            <div className="absolute -right-3 top-1/2 w-6 h-6 bg-gray-50 rounded-full z-10"></div>
            <div className="absolute left-8 top-1/2 w-0.5 h-16 -mt-8 border-l-2 border-dashed border-gray-200"></div>

            <div className="p-4 pl-12 flex items-center justify-between">
                <div className="flex items-center gap-4 text-left">
                    <img src={product.imageUrl} alt={product.name} className="w-16 h-16 rounded-md object-cover border border-gray-100"/>
                    <div className="text-left">
                        <h4 className="font-bold text-gray-900 line-clamp-1">{product.name}</h4>
                        <div className="flex items-center gap-2 text-sm mt-1">
                            <span className="text-gray-400 line-through">{formatCurrency(product.price)}</span>
                            <span className="font-extrabold text-red-600 text-lg">{formatCurrency(product.discountPrice || 0)}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col items-end justify-center h-full">
                     <div className="bg-red-100 text-red-600 font-black text-xl px-3 py-1 rounded-lg transform rotate-3 border-2 border-red-200 shadow-sm mb-2">
                        -{discount}%
                    </div>
                    <button 
                        onClick={onEdit}
                        className="text-xs font-bold text-gray-500 hover:text-primary underline"
                    >
                        Manage
                    </button>
                </div>
            </div>
        </div>
    );
};

const PromotionModal: React.FC<{ product: Product; onSave: (product: Product, newDiscountPrice?: number) => void; onCancel: () => void }> = ({ product, onSave, onCancel }) => {
    /* Fix: formatCurrency destructured from useCurrency() which returns CurrencyContextState */
    const { formatCurrency } = useCurrency();
    const { t } = useLocalization();
    const [discountPrice, setDiscountPrice] = useState<string>(product.discountPrice?.toString() || '');

    const handleSave = () => {
        const newDiscountPrice = parseFloat(discountPrice) || undefined;
        if (newDiscountPrice !== undefined && (newDiscountPrice <= 0 || newDiscountPrice >= product.price)) {
            onSave(product, undefined);
        } else {
            onSave(product, newDiscountPrice);
        }
    }

    const handleRemove = () => {
        onSave(product, undefined);
    }

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-scale">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{t('modalTitleManageSale')}</h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6"/></button>
                </div>
                
                <div className="flex gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100 text-left">
                    <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded-lg bg-white shadow-sm"/>
                    <div className="text-left">
                        <h3 className="font-bold text-gray-800 text-sm line-clamp-2">{product.name}</h3>
                        <p className="text-gray-500 text-xs mt-1 uppercase font-bold">Original Price</p>
                        <p className="font-bold text-lg text-gray-900">{formatCurrency(product.price)}</p>
                    </div>
                </div>

                <div className="text-left">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Discount Price (ZAR)</label>
                    <div className="relative">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R</span>
                        <input 
                            type="number" 
                            inputMode="decimal"
                            placeholder="e.g. 149.99"
                            value={discountPrice} 
                            onChange={(e) => setDiscountPrice(e.target.value)}
                            className="p-3 pl-8 border-2 border-gray-200 rounded-xl w-full text-xl font-bold text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-red-500" 
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Enter a price lower than {formatCurrency(product.price)} to activate sale tag.</p>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                    {product.discountPrice && (
                        <button onClick={handleRemove} className="mr-auto text-red-500 font-bold text-sm hover:underline">
                            End Sale
                        </button>
                    )}
                    <button onClick={onCancel} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-xl transition-colors">{t('payoutCancel')}</button>
                    <button onClick={handleSave} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-transform active:scale-95">{t('buttonSaveChanges')}</button>
                </div>
            </div>
        </div>
    );
}

const PromotionsManagement: React.FC = () => {
    const { products, updateProduct } = useData();
    /* Fix: Destructure currentCompany from useAuth() */
    const { currentCompany } = useAuth();
    const { t } = useLocalization();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [viewMode, setViewMode] = useState<'active' | 'all'>('active');

    const supplierProducts = products.filter(p => p.supplierId === currentCompany?.id);
    const activePromotions = supplierProducts.filter(p => p.discountPrice && p.discountPrice < p.price);
    const displayProducts = viewMode === 'active' ? activePromotions : supplierProducts;

    const handleOpenModal = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    }

    const handleCloseModal = () => {
        setSelectedProduct(null);
        setIsModalOpen(false);
    }

    const handleSave = (product: Product, newDiscountPrice?: number) => {
        updateProduct({ ...product, discountPrice: newDiscountPrice });
        handleCloseModal();
    }

    return (
        <div className="pb-12 text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 text-left">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <TagIcon className="h-8 w-8 text-red-500"/> {t('promotionsTitle')}
                    </h2>
                    <p className="text-gray-600 mt-1">{t('promotionsDescription')}</p>
                </div>
                
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setViewMode('active')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'active' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <FireIcon className="h-4 w-4"/> Active Deals
                    </button>
                    <button 
                        onClick={() => setViewMode('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        All Products
                    </button>
                </div>
            </div>

            {displayProducts.length === 0 ? (
                <EmptyState
                    icon={ReceiptPercentIcon}
                    title={viewMode === 'active' ? "No Active Promotions" : "No Products Found"}
                    message={viewMode === 'active' ? "Start a sale to attract more contractors." : "Add products to your catalog to create promotions."}
                    action={viewMode === 'active' ? (
                        <button onClick={() => setViewMode('all')} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
                            Browse Inventory
                        </button>
                    ) : undefined}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayProducts.map(product => {
                         const hasPromo = product.discountPrice && product.discountPrice < product.price;
                         
                         if (viewMode === 'all' && !hasPromo) {
                             return (
                                <div key={product.id} className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center hover:border-primary transition-colors group text-left">
                                    <div className="flex items-center gap-3 text-left">
                                        <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-md object-cover bg-gray-50"/>
                                        <div className="text-left">
                                            <p className="font-bold text-gray-800 text-sm line-clamp-1">{product.name}</p>
                                            <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleOpenModal(product)} className="bg-gray-100 hover:bg-primary hover:text-white text-gray-600 p-2 rounded-lg transition-colors">
                                        <PlusIcon className="h-5 w-5"/>
                                    </button>
                                </div>
                             )
                         }

                         return (
                             <div key={product.id} className="animate-fade-in-up">
                                <PromotionCard product={product} onEdit={() => handleOpenModal(product)} />
                             </div>
                         );
                    })}
                </div>
            )}

            {isModalOpen && selectedProduct && (
                <PromotionModal 
                    product={selectedProduct}
                    onSave={handleSave}
                    onCancel={handleCloseModal}
                />
            )}
        </div>
    );
};

export default PromotionsManagement;
