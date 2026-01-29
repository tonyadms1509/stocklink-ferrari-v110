import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { useData } from '../hooks/useDataContext';
import { useLocalization } from '../hooks/useLocalization';
import { useCurrency } from '../hooks/useCurrency';
import { XMarkIcon, MagnifyingGlassIcon, CubeIcon, CameraIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import VisualIdModal from './VisualIdModal';

interface AddMaterialModalProps {
    projectId: string;
    onClose: () => void;
}

const AddMaterialModal: React.FC<AddMaterialModalProps> = ({ projectId, onClose }) => {
    const { products, addMaterialToProject } = useData();
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState(1);
    
    const [isVisualIdOpen, setIsVisualIdOpen] = useState(false);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return [];
        return products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 10);
    }, [products, searchTerm]);

    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
        setSearchTerm(product.name);
    };
    
    const handleVisualSearch = (term: string) => {
        setSearchTerm(term);
        setIsVisualIdOpen(false);
    };

    const handleAddMaterial = async () => {
        if (selectedProduct && quantity > 0) {
            await addMaterialToProject(projectId, selectedProduct, quantity);
            onClose();
        }
    };

    if (isVisualIdOpen) {
        return <VisualIdModal isOpen={true} onClose={() => setIsVisualIdOpen(false)} onSearch={handleVisualSearch} />;
    }

    return (
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in-scale">
            <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-2xl w-full relative overflow-hidden">
                 <div className="bg-gradient-to-r from-emerald-600/90 to-teal-600/90 p-6 text-white flex justify-between items-center backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                            <CubeIcon className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold">{t('addMaterialModalTitle')}</h2>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <XMarkIcon className="h-6 w-6"/>
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <div className="relative">
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('searchProducts')}</label>
                        <div className="flex gap-2">
                            <div className="relative flex-grow">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        if (selectedProduct) setSelectedProduct(null);
                                    }}
                                    className="w-full p-3 pl-10 border-2 border-gray-200/80 bg-white/50 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition-all backdrop-blur-sm"
                                    placeholder="e.g. Cement 50kg"
                                />
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                            </div>
                            <button 
                                onClick={() => setIsVisualIdOpen(true)}
                                className="bg-blue-50 text-blue-600 border border-blue-200 rounded-lg px-3 hover:bg-blue-100 transition-colors flex items-center justify-center"
                                title="Identify from Photo"
                            >
                                <CameraIcon className="h-6 w-6"/>
                            </button>
                        </div>
                        
                        {searchTerm && !selectedProduct && filteredProducts.length > 0 && (
                            <ul className="absolute z-50 w-full bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl">
                                {filteredProducts.map(p => (
                                    <li key={p.id} onClick={() => handleSelectProduct(p)} className="p-3 hover:bg-gray-100/80 cursor-pointer border-b border-gray-100 last:border-0 flex justify-between items-center transition-colors">
                                        <div>
                                            <span className="font-bold text-gray-800">{p.name}</span>
                                            <span className="text-xs text-gray-500 block">{p.brand}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-primary">{formatCurrency(p.price)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {selectedProduct && (
                        <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-100 flex items-center gap-4 animate-fade-in-up backdrop-blur-sm">
                             <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="w-16 h-16 object-cover rounded-lg bg-white border"/>
                             <div className="flex-grow">
                                <p className="font-bold text-gray-900">{selectedProduct.name}</p>
                                <p className="text-sm text-gray-600">{formatCurrency(selectedProduct.price)}</p>
                             </div>
                             <div className="flex flex-col items-end">
                                <label htmlFor="quantity" className="text-xs font-bold text-gray-500 mb-1 uppercase">{t('quantity')}</label>
                                <input
                                    type="number"
                                    id="quantity"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                                    className="w-20 p-2 border-2 border-emerald-200 bg-white/80 rounded-lg text-center font-bold text-lg focus:ring-secondary focus:border-secondary"
                                />
                             </div>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors">
                           {t('payoutCancel')}
                        </button>
                        <button
                            type="button"
                            onClick={handleAddMaterial}
                            disabled={!selectedProduct || quantity <= 0}
                            className="px-6 py-2.5 bg-secondary hover:bg-emerald-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('addToProject')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddMaterialModal;
