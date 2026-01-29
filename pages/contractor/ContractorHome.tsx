
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../hooks/useDataContext';
import { Product, Supplier } from '../../types';
import { MagnifyingGlassIcon, BuildingStorefrontIcon, UserCircleIcon, ChatBubbleLeftRightIcon, AdjustmentsHorizontalIcon, XCircleIcon, StarIcon, CameraIcon, SparklesIcon, WrenchScrewdriverIcon, BoltIcon, PaintBrushIcon, HomeIcon, CubeIcon, FireIcon, ClockIcon, ArrowRightIcon, GiftIcon } from '@heroicons/react/24/solid';
import { useCurrency } from '../../hooks/useCurrency';
import { useLocalization } from '../../hooks/useLocalization';
import { useToast } from '../../hooks/useToast';
import PriceComparisonModal from '../../components/PriceComparisonModal';
import VisualIdModal from '../../components/VisualIdModal';
import AIAssistantModal from '../../components/AIAssistantModal';
import EmptyState from '../../components/EmptyState';
import AnimatedNumber from '../../components/AnimatedNumber';

const CategoryPill: React.FC<{ title: string; icon: React.ElementType; onClick: () => void; isSelected: boolean }> = ({ title, icon: Icon, onClick, isSelected }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 whitespace-nowrap ${isSelected ? 'bg-white text-primary border-white shadow-lg scale-105' : 'bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md'}`}
    >
        <Icon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-white'}`} />
        <span className="text-sm font-bold">{title}</span>
    </button>
);

const FlashDealCard: React.FC<{ product: Product; onClick: () => void }> = ({ product, onClick }) => {
    const { formatCurrency } = useCurrency();
    const discountPercent = product.discountPrice ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

    return (
        <div onClick={onClick} className="min-w-[280px] w-[280px] bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 relative">
            <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm z-10 flex items-center gap-1 animate-pulse">
                <FireIcon className="h-3 w-3"/> -{discountPercent}%
            </div>
            <div className="h-40 overflow-hidden relative">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                     <p className="text-xs font-bold opacity-90 flex items-center gap-1"><ClockIcon className="h-3 w-3"/> Ends in 04:22:15</p>
                </div>
            </div>
            <div className="p-4 text-left">
                <h4 className="font-bold text-gray-900 line-clamp-1 mb-1">{product.name}</h4>
                <div className="flex items-end gap-2 mb-3">
                    <span className="text-xl font-extrabold text-red-600">{formatCurrency(product.discountPrice || product.price)}</span>
                    <span className="text-sm text-gray-400 line-through mb-0.5">{formatCurrency(product.price)}</span>
                </div>
                {/* Stock Bar */}
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1 overflow-hidden">
                    <div className="bg-red-500 h-1.5 rounded-full w-3/4"></div>
                </div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Almost Gone: {product.stock} left</p>
            </div>
        </div>
    );
}

const ProductCard: React.FC<{ 
    product: Product; 
    supplier?: Supplier; 
    onAddToCart: (product: Product) => void; 
    onToggleFavorite: () => void; 
    isFavorite: boolean; 
    onViewSupplier?: (supplier: Supplier) => void;
    onStartChat?: (supplierId: string, context: { productId: string }) => void;
    onCompare: (product: Product) => void;
}> = ({ product, supplier, onAddToCart, onToggleFavorite, isFavorite, onViewSupplier, onStartChat, onCompare }) => {
    const { formatCurrency } = useCurrency();
    const { t } = useLocalization();
    const isOnSale = product.discountPrice && product.discountPrice < product.price;

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col relative border border-gray-200 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            {isOnSale && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-sm">
                    {t('productCardSale')}
                </div>
            )}
            <div className="overflow-hidden h-48 relative bg-gray-50">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} className="absolute top-2 left-2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-yellow-400 shadow-sm transition-colors opacity-0 group-hover:opacity-100">
                    <StarIcon className={`h-5 w-5 ${isFavorite ? 'text-yellow-400' : ''}`}/>
                </button>
            </div>
            <div className="p-4 flex flex-col flex-grow text-left">
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 h-14 group-hover:text-primary transition-colors">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{product.brand} - {product.category}</p>
                
                <div className="flex-grow"></div>

                <div className="mt-4">
                    {supplier && onViewSupplier ? (
                        <button onClick={() => onViewSupplier(supplier)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-2 transition-colors">
                            {product.isContractorListing ? <UserCircleIcon className="h-4 w-4" /> : <BuildingStorefrontIcon className="h-4 w-4" />}
                            <span className="truncate font-medium">{supplier.name}</span>
                        </button>
                    ) : product.sellerName ? (
                         <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <UserCircleIcon className="h-4 w-4" />
                            <span className="truncate font-medium">{product.sellerName}</span>
                        </div>
                    ) : null}
                    <div className="flex justify-between items-center">
                        {isOnSale ? (
                            <div>
                                <p className="text-lg font-bold text-red-600">{formatCurrency(product.discountPrice!)}</p>
                                <p className="text-xs text-gray-400 line-through">{formatCurrency(product.price)}</p>
                            </div>
                        ) : (
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(product.price)}</p>
                        )}
                        <div className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                             {product.stock} left
                        </div>
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => onAddToCart(product)} className="w-full bg-primary text-white text-sm font-bold py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm active:shadow-inner">
                        {t('productCardAddToCart')}
                    </button>
                    <button onClick={() => onCompare(product)} className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-bold py-2 px-3 rounded-lg transition-colors">
                        {t('productCardCompare')}
                    </button>
                </div>
                {onStartChat && supplier && !product.isContractorListing && (
                    <button 
                        onClick={() => onStartChat(supplier.id, { productId: product.id })}
                        className="mt-2 w-full flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-bold py-2 px-3 rounded-lg transition-colors"
                    >
                        <ChatBubbleLeftRightIcon className="h-4 w-4"/>
                        {t('productCardChat')}
                    </button>
                )}
            </div>
        </div>
    );
};

interface ContractorHomeProps {
  onViewSupplier: (supplier: Supplier) => void;
  onStartChat: (supplierId: string, context?: { productId?: string }) => void;
  initialSearchTerm?: string;
  onClearInitialSearch?: () => void;
  showOnlyDeals?: boolean;
}

export const ContractorHome: React.FC<ContractorHomeProps> = ({ onViewSupplier, onStartChat, initialSearchTerm, onClearInitialSearch, showOnlyDeals = false }) => {
    const { products, suppliers, addToCart, favorites, toggleFavorite, getSupplierById, isLoading, isAILoading } = useData();
    const { t } = useLocalization();
    const { showToast } = useToast();

    const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
    const [source, setSource] = useState<'all' | 'suppliers' | 'contractors'>('all');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    
    // Modals
    const [comparingProduct, setComparingProduct] = useState<Product | null>(null);
    const [isVisualIdOpen, setIsVisualIdOpen] = useState(false);
    const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

    useEffect(() => {
        if (initialSearchTerm && onClearInitialSearch) {
            setSearchTerm(initialSearchTerm);
            onClearInitialSearch();
        }
    }, [initialSearchTerm, onClearInitialSearch]);

    const filteredProducts = useMemo(() => {
        let items = showOnlyDeals 
            ? products.filter(p => p.discountPrice && p.discountPrice < p.price) 
            : (products || []);

        if (source === 'suppliers') items = items.filter(p => !p.isContractorListing);
        if (source === 'contractors') items = items.filter(p => p.isContractorListing);
        
        if (selectedCategory) {
            items = items.filter(p => p.category === selectedCategory);
        }

        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            items = items.filter(p => 
                (p.name?.toLowerCase() || '').includes(lowercasedTerm) ||
                (p.brand?.toLowerCase() || '').includes(lowercasedTerm) ||
                (p.category?.toLowerCase() || '').includes(lowercasedTerm)
            );
        }
        return items;
    }, [products, searchTerm, source, showOnlyDeals, selectedCategory]);

    const dealProducts = useMemo(() => (products || []).filter(p => p.discountPrice && p.discountPrice < p.price).slice(0, 10), [products]);

    const handleAddToCart = (product: Product) => {
        addToCart(product, 1);
        showToast('Added to quote builder', 'success');
    };
    
    const handleAISearch = (term: string) => {
        setSearchTerm(term);
        showToast(`AI Refinement: "${term}" applied`, 'info');
    };
    
    const categories = [
        { name: 'Building Materials', icon: CubeIcon },
        { name: 'Plumbing Supplies', icon: WrenchScrewdriverIcon },
        { name: 'Electrical', icon: BoltIcon },
        { name: 'Finishes', icon: PaintBrushIcon },
        { name: 'Tools', icon: WrenchScrewdriverIcon },
        { name: 'Hardware', icon: HomeIcon },
    ];

    return (
        <div className="pb-24 space-y-10">

            {/* Expansion Protocol Header */}
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/10 group">
                <div className="absolute inset-0 bg-carbon opacity-10"></div>
                <div className="absolute top-0 right-0 p-8 opacity-10 transform rotate-12 group-hover:rotate-0 transition-transform duration-1000"><GiftIcon className="h-48 w-48 text-blue-500"/></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="text-left max-w-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <SparklesIcon className="h-6 w-6 text-red-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500">R50 Handshake Active</span>
                        </div>
                        <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none mb-4">GRID <span className="text-blue-600">EXPANSION</span></h2>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed italic">"Sync a new node to the grid. Secure R50.00 in project procurement credits for every successful partner synchronization."</p>
                    </div>
                    <button 
                        onClick={() => window.location.hash = '#/referrals'}
                        className="bg-white text-slate-950 font-black py-5 px-12 rounded-[2rem] text-xs uppercase tracking-[0.4em] shadow-2xl transform active:scale-95 transition-all border-4 border-slate-900 flex items-center justify-center gap-4"
                    >
                        Provision Partner <ArrowRightIcon className="h-4 w-4"/>
                    </button>
                </div>
            </div>
            
            {/* Immersive Hero Section */}
            {!showOnlyDeals && (
                <div className="relative rounded-[3rem] overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-800 shadow-2xl text-white mb-8 border border-white/10">
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                     <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                     <div className="relative z-10 px-10 py-16 md:px-20 flex flex-col items-center text-center">
                         <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 drop-shadow-md uppercase italic leading-none">
                             FIND MATERIALS. <span className="text-yellow-400">BUILD FASTER.</span>
                         </h1>
                         <p className="text-blue-100 text-xl mb-12 max-w-2xl font-medium italic">"Query thousands of regional and international supply nodes via neural search."</p>
                         
                         <div className="w-full max-w-3xl bg-white/10 backdrop-blur-xl border-2 border-white/20 p-3 rounded-[2.5rem] flex flex-col md:flex-row gap-3 shadow-2xl">
                             <div className="relative flex-grow">
                                <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-blue-200" />
                                <input
                                    type="text"
                                    placeholder={t('homeSearchPlaceholder')}
                                    className="w-full p-5 pl-16 bg-white/10 border-none rounded-3xl text-white font-black italic placeholder-blue-300/50 focus:ring-0 focus:bg-white/20 transition-all text-lg"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white"><XCircleIcon className="h-5 w-5"/></button>}
                             </div>
                             <div className="flex gap-3">
                                <button onClick={() => setIsVisualIdOpen(true)} className="flex-1 md:flex-none bg-blue-600/50 hover:bg-blue-600 text-white p-5 rounded-[1.5rem] transition-all border border-white/10 shadow-xl" title="Vision Scan">
                                    <CameraIcon className="h-6 w-6" />
                                </button>
                                <button onClick={() => setIsAIAssistantOpen(true)} className="flex-1 md:flex-none bg-yellow-500 hover:bg-yellow-400 text-slate-900 px-8 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl group">
                                    <SparklesIcon className="h-5 w-5 group-hover:animate-pulse" />
                                    <span>AI Refine</span>
                                </button>
                             </div>
                         </div>

                         <div className="mt-12 flex flex-wrap justify-center gap-4">
                            {categories.map(cat => (
                                <CategoryPill 
                                    key={cat.name} 
                                    title={cat.name} 
                                    icon={cat.icon} 
                                    isSelected={selectedCategory === cat.name}
                                    onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)} 
                                />
                            ))}
                         </div>
                     </div>
                </div>
            )}
            
            {/* Flash Deals Carousel */}
            {!searchTerm && dealProducts.length > 0 && (
                <div className="space-y-6">
                    <div className="flex justify-between items-end px-4">
                         <div className="text-left">
                            <div className="flex items-center gap-2 mb-2">
                                <FireIcon className="h-6 w-6 text-red-600 animate-pulse"/>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600">Flash Payload Intercept</span>
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 italic uppercase tracking-tighter">Active <span className="text-red-600">Discounts</span></h3>
                         </div>
                         <button className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 hover:underline">Full Catalog <ArrowRightIcon className="h-4 w-4"/></button>
                    </div>
                    
                    <div className="flex gap-8 overflow-x-auto pb-8 pt-2 px-4 no-scrollbar snap-x">
                        {dealProducts.map(product => (
                            <div key={product.id} className="snap-start">
                                <FlashDealCard product={product} onClick={() => handleAddToCart(product)} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Main Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4">
                {filteredProducts.map(product => (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        supplier={getSupplierById(product.supplierId)}
                        onAddToCart={handleAddToCart}
                        onToggleFavorite={() => toggleFavorite(product.id)}
                        isFavorite={(favorites || []).includes(product.id)}
                        onViewSupplier={onViewSupplier}
                        onStartChat={onStartChat}
                        onCompare={(p) => setComparingProduct(p)}
                    />
                ))}
            </div>

            {comparingProduct && (
                <PriceComparisonModal 
                    product={comparingProduct} 
                    onClose={() => setComparingProduct(null)} 
                    onViewSupplier={onViewSupplier}
                />
            )}
            
            <VisualIdModal 
                isOpen={isVisualIdOpen} 
                onClose={() => setIsVisualIdOpen(false)} 
                onSearch={setSearchTerm} 
            />
            
            <AIAssistantModal 
                isOpen={isAIAssistantOpen} 
                onClose={() => setIsAIAssistantOpen(false)} 
                onSearch={handleAISearch} 
                initialQuery={searchTerm}
            />
        </div>
    );
};
