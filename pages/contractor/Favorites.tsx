
import React from 'react';
import { useData } from '../../hooks/useDataContext';
import { ArrowLeftIcon, HeartIcon } from '@heroicons/react/24/solid';
import { Product, Supplier } from '../../types';
import { useCurrency } from '../../hooks/useCurrency';
import { useLocalization } from '../../hooks/useLocalization';
import EmptyState from '../../components/EmptyState';

const FavoriteProductCard: React.FC<{ product: Product; supplier?: Supplier; onAddToCart: (product: Product) => void; onToggleFavorite: () => void; onViewSupplier: (supplier: Supplier) => void }> = 
({ product, supplier, onAddToCart, onToggleFavorite, onViewSupplier }) => {
    const { formatCurrency } = useCurrency();
    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-100 flex items-center p-4 gap-4 hover:shadow-lg transition-shadow">
            <img src={product.imageUrl} alt={product.name} className="w-24 h-24 object-cover rounded-md border border-gray-200"/>
            <div className="flex-grow">
            <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
            {supplier && (
                <button onClick={() => onViewSupplier(supplier)} className="text-sm text-primary hover:underline flex items-center mb-2">
                    {supplier.name}
                </button>
            )}
            <p className="text-xl font-bold text-primary">{formatCurrency(product.price)}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
                <button onClick={onToggleFavorite} className="p-2 rounded-full text-red-500 bg-red-50 hover:bg-red-100 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
                </button>
                <button onClick={() => onAddToCart(product)} className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                    Add to Cart
                </button>
            </div>
        </div>
    )
};

interface FavoritesProps {
    onViewSupplier: (supplier: Supplier) => void;
    onBack?: () => void;
}

const Favorites: React.FC<FavoritesProps> = ({ onViewSupplier, onBack }) => {
  const { products, favorites, getSupplierById, addToCart, toggleFavorite } = useData();
  const { t } = useLocalization();

  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  if (favoriteProducts.length === 0) {
    return (
      <EmptyState
        icon={HeartIcon}
        title="No Favorites Yet"
        message="Click the heart icon on any product to save it here for later."
      />
    );
  }

  return (
    <div>
        {onBack && (
            <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-4">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                {t('backToDashboard')}
            </button>
        )}
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Your Favorite Items</h2>
        <div className="space-y-4">
            {favoriteProducts.map(product => (
                <FavoriteProductCard
                    key={product.id}
                    product={product}
                    supplier={getSupplierById(product.supplierId)}
                    onAddToCart={() => addToCart(product, 1)}
                    onToggleFavorite={() => toggleFavorite(product.id)}
                    onViewSupplier={onViewSupplier}
                />
            ))}
        </div>
    </div>
  );
};

export default Favorites;
