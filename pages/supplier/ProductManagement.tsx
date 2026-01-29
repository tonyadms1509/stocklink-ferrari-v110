import React, { useState } from 'react';
import { useData } from '../../hooks/useDataContext.tsx';
import { Product, DeliveryOption, SupplierTab } from '../../types.ts';
import { PlusIcon, PencilIcon, TrashIcon, TagIcon, SparklesIcon, ArrowUpOnSquareIcon, CameraIcon, MagnifyingGlassIcon, ExclamationCircleIcon, CubeIcon, Squares2X2Icon, TableCellsIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';
import { useCurrency } from '../../hooks/useCurrency.tsx';
import { useLocalization } from '../../hooks/useLocalization.tsx';
import { GoogleGenAI, Type, Part } from '@google/genai';
import { useAuth } from '../../hooks/useAuth.tsx';
import { useToast } from '../../hooks/useToast.tsx';
import BulkImportModal from '../../components/BulkImportModal.tsx';
import SmartStocktakeModal from '../../components/SmartStocktakeModal.tsx';
import EmptyState from '../../components/EmptyState.tsx';

const ProductCard: React.FC<{ product: Product; onEdit: (p: Product) => void; onDelete: (id: string) => void; onAnalyze: (id: string) => void; onPriceCheck: (product: Product) => void }> = ({ product, onEdit, onDelete, onAnalyze, onPriceCheck }) => {
    const { formatCurrency } = useCurrency();
    const { t } = useLocalization();
    const isOnSale = product.discountPrice && product.discountPrice < product.price;
    const isLowStock = product.stock < 20;
    const isOutOfStock = product.stock === 0;

    return (
        <div className="bg-slate-900 border border-white/5 rounded-[3rem] shadow-2xl hover:border-blue-600/30 transition-all duration-500 overflow-hidden group relative flex flex-col text-left">
            <div className="absolute inset-0 bg-carbon opacity-5 group-hover:opacity-10 transition-opacity"></div>
            
             {isOnSale && (
                <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full z-10 shadow-[0_0_15px_#DC0000] animate-pulse uppercase tracking-widest italic">
                    Grid Deal
                </div>
            )}

            <div className="relative h-48 overflow-hidden bg-slate-800">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                 {/* Overlay Actions */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                    <button onClick={() => onPriceCheck(product)} className="bg-emerald-600 text-white p-3 rounded-2xl hover:scale-110 transition-transform shadow-2xl border border-white/10" title="Check Market Price">
                        <CurrencyDollarIcon className="h-6 w-6"/>
                    </button>
                    <button onClick={() => onEdit(product)} className="bg-white text-slate-950 p-3 rounded-2xl hover:scale-110 transition-transform shadow-2xl border border-slate-200" title="Edit">
                        <PencilIcon className="h-6 w-6"/>
                    </button>
                    <button onClick={() => onDelete(product.id)} className="bg-red-600 text-white p-3 rounded-2xl hover:scale-110 transition-transform shadow-2xl border border-white/10" title="Delete">
                        <TrashIcon className="h-6 w-6"/>
                    </button>
                </div>
            </div>

            <div className="p-8 flex-grow flex flex-col relative z-10">
                <h4 className="font-black text-white uppercase italic tracking-tighter text-xl mb-1 line-clamp-1 group-hover:text-blue-400 transition-colors text-left" title={product.name}>{product.name}</h4>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 text-left">{product.category}</p>
                
                <div className="mt-auto flex justify-between items-end pt-6 border-t border-white/5">
                    <div className="text-left">
                        {isOnSale ? (
                            <div>
                                <span className="block text-[10px] text-slate-600 font-bold line-through uppercase">{formatCurrency(product.price)}</span>
                                <span className="text-3xl font-black text-white italic tracking-tighter">{formatCurrency(product.discountPrice!)}</span>
                            </div>
                        ) : (
                            <span className="text-3xl font-black text-white italic tracking-tighter">{formatCurrency(product.price)}</span>
                        )}
                    </div>
                    <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl border ${isOutOfStock ? 'bg-red-600/10 text-red-500 border-red-500/20' : isLowStock ? 'bg-amber-600/10 text-amber-500 border-amber-500/20' : 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20'}`}>
                        {product.stock} units
                    </div>
                </div>
            </div>
        </div>
    )
}

const ProductManagement: React.FC<{ onNavigate: (tab: SupplierTab) => void }> = ({ onNavigate }) => {
  const { products = [], updateProduct, deleteProduct, generatePricingAnalysis } = useData();
  const { currentCompany } = useAuth();
  const { showToast } = useToast();
  
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isStocktakeOpen, setIsStocktakeOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const supplierProducts = products
    .filter(p => p.supplierId === currentCompany?.id)
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleUpdateStock = async (product: Product, newQuantity: number) => {
      await updateProduct({ ...product, stock: newQuantity });
      showToast('Registry node synchronized', 'success');
  }

  const handlePriceCheck = async (product: Product) => {
      onNavigate('market-pulse');
      showToast(`Benchmarking ${product.name}...`, 'info');
  }

  return (
    <div className="space-y-12 animate-fade-in pb-20 text-left">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 border-b border-white/5 pb-12 text-left">
        <div className="text-left">
            <div className="flex items-center gap-3 mb-4 text-blue-500">
                <CubeIcon className="h-6 w-6 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500">Unit Ledger Management v80.5</span>
            </div>
            <h2 className="text-7xl font-black text-white italic tracking-tighter uppercase leading-none">GRID <span className="text-blue-500">CATALOG</span></h2>
            <p className="text-slate-500 mt-4 font-mono text-sm tracking-widest uppercase text-left">Node Inventory & Pricing Delta Controller</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
             <button onClick={() => setIsStocktakeOpen(true)} className="flex-1 md:flex-none bg-slate-900 hover:bg-black text-white font-black py-4 px-8 rounded-3xl transition-all border border-white/10 shadow-2xl uppercase tracking-widest text-[10px]">
                <CameraIcon className="h-4 w-4 text-blue-500 mr-2 inline" />
                Neural Stocktake
            </button>
            <button onClick={() => setIsBulkModalOpen(true)} className="flex-1 md:flex-none bg-white text-slate-950 font-black py-4 px-10 rounded-3xl transition-all transform hover:-translate-y-1 active:scale-95 shadow-2xl border-4 border-slate-900 uppercase tracking-widest text-[10px]">
                <ArrowUpOnSquareIcon className="h-4 w-4 text-red-600 mr-2 inline" />
                Bulk Intake
            </button>
            <button className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-10 rounded-3xl shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-[10px] border border-white/10">
                <PlusIcon className="h-5 w-5 mr-2 inline" />
                Provision Unit
            </button>
        </div>
      </div>

      <div className="relative max-w-2xl group text-left">
          <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-500 group-focus-within:text-blue-500 transition-colors"/>
          <input 
            type="text" 
            placeholder="Search local unit registry..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-slate-900 border border-white/5 rounded-[2rem] text-white font-bold italic text-lg outline-none focus:border-blue-600 transition-all placeholder:text-slate-700 shadow-inner"
          />
      </div>

      {supplierProducts.length === 0 ? (
        <EmptyState
            icon={CubeIcon}
            title="GRID EMPTY"
            message="No materialized units identified in local registry buffer."
        />
      ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-12">
                 {supplierProducts.map(product => (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        onEdit={() => {}} 
                        onDelete={deleteProduct} 
                        onAnalyze={() => {}} 
                        onPriceCheck={handlePriceCheck}
                    />
                 ))}
            </div>
      )}
      
      {isBulkModalOpen && <BulkImportModal onSave={() => {}} onClose={() => setIsBulkModalOpen(false)} />}
      {isStocktakeOpen && <SmartStocktakeModal onClose={() => setIsStocktakeOpen(false)} onUpdateStock={handleUpdateStock} />}
    </div>
  );
};

export default ProductManagement;