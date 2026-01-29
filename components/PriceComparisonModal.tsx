
import React, { useState, useEffect } from 'react';
import { Product, Supplier } from '../types';
import { useData } from '../hooks/useDataContext';
import { useCurrency } from '../hooks/useCurrency';
import { useLocalization } from '../hooks/useLocalization';
import { GoogleGenAI, Type } from '@google/genai';
import { XMarkIcon, SparklesIcon, BuildingStorefrontIcon, StarIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';

interface ComparisonItemProps {
    product: Product;
    supplier: Supplier | undefined;
    isBaseProduct?: boolean;
    reason?: string;
    onViewSupplier: (supplier: Supplier) => void;
}

const ComparisonItem: React.FC<ComparisonItemProps> = ({ product, supplier, isBaseProduct = false, reason, onViewSupplier }) => {
    const { formatCurrency } = useCurrency();
    const { t } = useLocalization();
    const { addToCart } = useData();

    if (!supplier) return null;

    const price = product.discountPrice || product.price;

    return (
        <div className={`p-3 rounded-lg flex items-center gap-4 ${isBaseProduct ? 'bg-blue-50 border-2 border-primary' : 'bg-white border'}`}>
            <img src={supplier.logoUrl} alt={supplier.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
            <div className="flex-grow">
                <button onClick={() => onViewSupplier(supplier)} className="font-bold hover:underline">{supplier.name}</button>
                {reason && <p className="text-xs text-gray-600 italic mt-0.5">"{reason}"</p>}
                 <div className="flex items-center text-xs text-gray-500 mt-1">
                    <StarIcon className="h-3 w-3 text-yellow-400 mr-1"/>
                    <span>{supplier.rating} ({supplier.reviews})</span>
                </div>
            </div>
            <div className="text-right flex-shrink-0">
                <p className="text-lg font-extrabold text-primary">{formatCurrency(price)}</p>
                <button onClick={() => addToCart(product, 1)} className="mt-1 bg-secondary text-white text-xs font-bold py-1 px-2 rounded-md hover:bg-emerald-600 flex items-center gap-1">
                    <ShoppingCartIcon className="h-3 w-3" />
                    {t('comparisonAddToCart')}
                </button>
            </div>
        </div>
    );
};


interface PriceComparisonModalProps {
  product: Product;
  onClose: () => void;
  onViewSupplier: (supplier: Supplier) => void;
}

const PriceComparisonModal: React.FC<PriceComparisonModalProps> = ({ product, onClose, onViewSupplier }) => {
    const { t } = useLocalization();
    const { products: allProducts, getSupplierById } = useData();

    const [identicalProducts, setIdenticalProducts] = useState<Product[]>([]);
    const [similarProducts, setSimilarProducts] = useState<{product: Product, reason: string}[]>([]);
    const [isLoadingAI, setIsLoadingAI] = useState(true);
    const [error, setError] = useState('');
    
    const baseSupplier = getSupplierById(product.supplierId);

    useEffect(() => {
        const fetchComparisons = async () => {
            // 1. Find identical products from other suppliers
            const identical = allProducts.filter(p => 
                p.supplierId !== product.supplierId &&
                p.name.toLowerCase() === product.name.toLowerCase() &&
                p.brand.toLowerCase() === product.brand.toLowerCase()
            );
            setIdenticalProducts(identical);

            // 2. Find similar products using AI
            if (!process.env.API_KEY) {
                setError("AI suggestions are unavailable. API key not configured.");
                setIsLoadingAI(false);
                return;
            }

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const otherProducts = allProducts
                    .filter(p => p.id !== product.id && !identical.some(ip => ip.id === p.id))
                    .map(p => ({ id: p.id, name: p.name, description: p.description, price: p.discountPrice || p.price }));

                const prompt = `You are a product matching expert for a building supply store. A contractor is looking at a product and wants to see similar alternatives.
    
                Base Product:
                - Name: ${product.name}
                - Description: ${product.description}
                - Category: ${product.category}
                - Price: ${product.discountPrice || product.price}

                Available Alternative Products (JSON array, limited list):
                ${JSON.stringify(otherProducts.slice(0, 50))}

                Task:
                From the list of alternatives, identify up to 3 products that are good alternatives. These could be cheaper versions, higher-quality versions, or products for the same purpose from a different brand. 
                
                Respond with ONLY a valid JSON array of objects. Each object must have a "productId" (string) matching an ID from the list and a "reason" (string, max 10 words) explaining why it's a good alternative.`;

                // Fix: Updated model name to gemini-3-flash-preview
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    productId: { type: Type.STRING },
                                    reason: { type: Type.STRING }
                                },
                                required: ["productId", "reason"]
                            }
                        }
                    }
                });

                // Fix: Ensure correct property access for text
                const aiSuggestions = JSON.parse(response.text || '[]');
                const resolvedSuggestions = aiSuggestions.map((suggestion: {productId: string, reason: string}) => {
                    const foundProduct = allProducts.find(p => p.id === suggestion.productId);
                    return foundProduct ? { product: foundProduct, reason: suggestion.reason } : null;
                }).filter(Boolean);

                setSimilarProducts(resolvedSuggestions as {product: Product, reason: string}[]);

            } catch (e) {
                console.error("AI comparison error:", e);
                setError("Could not fetch AI suggestions at this time.");
            } finally {
                setIsLoadingAI(false);
            }
        };

        fetchComparisons();
    }, [product, allProducts]);

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-6 w-6"/>
                </button>
                <h2 className="text-2xl font-bold text-primary mb-1">{t('comparisonTitle')}</h2>
                <p className="text-gray-500 mb-4">{t('comparisonFor')} <span className="font-semibold">{product.name}</span></p>

                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                    {/* Identical Products */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">{t('comparisonIdentical')}</h3>
                        <div className="space-y-2">
                            <ComparisonItem product={product} supplier={baseSupplier} isBaseProduct={true} onViewSupplier={onViewSupplier} />
                            {identicalProducts.length > 0 ? (
                                identicalProducts.map(p => (
                                    <ComparisonItem key={p.id} product={p} supplier={getSupplierById(p.supplierId)} onViewSupplier={onViewSupplier} />
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-2">{t('comparisonNoIdentical')}</p>
                            )}
                        </div>
                    </div>

                    {/* AI Suggestions */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <SparklesIcon className="h-5 w-5 text-accent" />
                            {t('comparisonAISuggestions')}
                        </h3>
                        {isLoadingAI ? (
                             <div className="flex justify-center items-center p-8">
                                <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        ) : error ? (
                            <p className="text-sm text-red-600 text-center py-2">{error}</p>
                        ) : (
                            similarProducts.length > 0 ? (
                                <div className="space-y-2">
                                     {similarProducts.map(item => (
                                        <ComparisonItem 
                                            key={item.product.id} 
                                            product={item.product} 
                                            supplier={getSupplierById(item.product.supplierId)} 
                                            reason={item.reason}
                                            onViewSupplier={onViewSupplier}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-2">{t('comparisonNoAISuggestions')}</p>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PriceComparisonModal;
