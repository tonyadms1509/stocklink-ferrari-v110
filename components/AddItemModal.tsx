import React, { useState, useMemo } from 'react';
import { Product, ClientQuoteItem } from '../types';
import { useData } from '../hooks/useDataContext';
import { useLocalization } from '../hooks/useLocalization';
import { useCurrency } from '../hooks/useCurrency';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface AddItemModalProps {
    onClose: () => void;
    onAddItem: (item: ClientQuoteItem) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ onClose, onAddItem }) => {
    const { t } = useLocalization();
    const { products } = useData();
    const { formatCurrency } = useCurrency();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [markup, setMarkup] = useState('20'); // Default 20% markup
    const [quantity, setQuantity] = useState(1);

    const filteredProducts = useMemo(() =>
        searchTerm
            ? products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5)
            : [],
        [searchTerm, products]
    );

    const finalPrice = useMemo(() => {
        if (!selectedProduct) return 0;
        const cost = selectedProduct.discountPrice || selectedProduct.price;
        const markupPercent = parseFloat(markup) || 0;
        return cost * (1 + markupPercent / 100);
    }, [selectedProduct, markup]);

    const handleAddItem = () => {
        if (!selectedProduct || quantity <= 0) return;
        onAddItem({
            id: `sl_${selectedProduct.id}_${Date.now()}`,
            description: selectedProduct.name,
            quantity,
            unitPrice: finalPrice,
            isStockLinkItem: true,
            costPrice: selectedProduct.discountPrice || selectedProduct.price,
            stockLinkProductId: selectedProduct.id,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold mb-4">{t('addItemModalTitle')}</h3>
                    <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-500 hover:text-gray-800"/></button>
                </div>
                <div className="relative">
                    <input type="text" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setSelectedProduct(null); }} placeholder={t('addItemModalSearch')} className="w-full p-2 border rounded-md" />
                    {filteredProducts.length > 0 && !selectedProduct && (
                        <ul className="absolute z-10 w-full bg-white border mt-1 rounded-md shadow-lg">
                            {filteredProducts.map(p => <li key={p.id} onClick={() => setSelectedProduct(p)} className="p-2 hover:bg-gray-100 cursor-pointer">{p.name}</li>)}
                        </ul>
                    )}
                </div>
                {selectedProduct && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="font-bold">{selectedProduct.name}</p>
                        <p className="text-sm">Cost Price: {formatCurrency(selectedProduct.discountPrice || selectedProduct.price)}</p>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                            <div><label className="text-sm">Quantity</label><input type="number" min="1" value={quantity} onChange={e => setQuantity(parseInt(e.target.value, 10) || 1)} className="w-full p-1 border rounded" /></div>
                            <div><label className="text-sm">{t('addItemModalMarkup')}</label><input type="number" value={markup} onChange={e => setMarkup(e.target.value)} className="w-full p-1 border rounded" /></div>
                            <div><label className="text-sm">{t('addItemModalFinalPrice')}</label><input type="text" value={formatCurrency(finalPrice)} readOnly className="w-full p-1 border rounded bg-gray-200" /></div>
                        </div>
                    </div>
                )}
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">{t('payoutCancel')}</button>
                    <button onClick={handleAddItem} disabled={!selectedProduct} className="bg-primary text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">{t('addToProject')}</button>
                </div>
            </div>
        </div>
    );
};

export default AddItemModal;
