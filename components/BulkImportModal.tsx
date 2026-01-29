
import React, { useState, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { GoogleGenAI, Type, Part } from '@google/genai';
import { XMarkIcon, DocumentArrowUpIcon, SparklesIcon, CheckCircleIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import { Product } from '../types';

interface BulkImportModalProps {
    onClose: () => void;
    onSave: (products: Omit<Product, 'id' | 'supplierId'>[]) => void;
}

const fileToBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [header, data] = result.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1];
            if (mimeType && data) {
                resolve({ mimeType, data });
            } else {
                reject(new Error("Could not parse file data."));
            }
        };
        reader.onerror = error => reject(error);
    });
};

const BulkImportModal: React.FC<BulkImportModalProps> = ({ onClose, onSave }) => {
    const { t } = useLocalization();
    const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [extractedProducts, setExtractedProducts] = useState<Omit<Product, 'id' | 'supplierId'>[]>([]);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError(null);
        }
    };

    const handleProcess = async () => {
        if (!imageFile || !process.env.API_KEY) {
            setError("Please upload an image and ensure API key is configured.");
            return;
        }

        setStep('processing');
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const { mimeType, data } = await fileToBase64(imageFile);
            const imagePart: Part = { inlineData: { mimeType, data } };
            
            const prompt = `
                Analyze this image of a product list or invoice. Extract product details.
                For each item, identify:
                1. "name": Product Name
                2. "brand": Brand Name (guess based on name if missing)
                3. "category": Best fitting category (e.g. Building Materials, Plumbing, Electrical, Tools, Finishes)
                4. "price": Numeric price
                5. "stock": Set to 10 by default.
                6. "description": Short description based on name.
                7. "imageUrl": Use "https://picsum.photos/200" as placeholder.
                8. "deliveryOptions": Array containing "Pickup Only".

                Return a JSON array of objects.
            `;

            const responseSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        brand: { type: Type.STRING },
                        category: { type: Type.STRING },
                        price: { type: Type.NUMBER },
                        stock: { type: Type.NUMBER },
                        description: { type: Type.STRING },
                        imageUrl: { type: Type.STRING },
                        deliveryOptions: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['name', 'price']
                }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [imagePart, { text: prompt }]
                },
                config: {
                    responseMimeType: 'application/json',
                    responseSchema
                }
            });

            const results = JSON.parse(response.text || '[]');
            
            if (results && results.length > 0) {
                setExtractedProducts(results.map((p: any) => ({
                    ...p,
                    stock: p.stock || 10,
                    brand: p.brand || 'Generic',
                    category: p.category || 'Building Materials',
                    description: p.description || p.name,
                    imageUrl: p.imageUrl || 'https://picsum.photos/200',
                    deliveryOptions: p.deliveryOptions || ['Pickup Only']
                })));
                setStep('review');
            } else {
                setError(t('quoteImportNoItems'));
                setStep('upload');
            }

        } catch (err) {
            console.error("Import Error:", err);
            setError(t('bulkImportError'));
            setStep('upload');
        }
    };

    const handleItemChange = (index: number, field: keyof Omit<Product, 'id' | 'supplierId'>, value: any) => {
        const newItems = [...extractedProducts];
        newItems[index] = { ...newItems[index], [field]: value };
        setExtractedProducts(newItems);
    };

    const handleDeleteItem = (index: number) => {
        setExtractedProducts(prev => prev.filter((_, i) => i !== index));
    };

    const handleFinalImport = () => {
        onSave(extractedProducts);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[60] p-4 animate-fade-in-scale">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                        <DocumentArrowUpIcon className="h-6 w-6"/>
                        {t('bulkImportTitle')}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XMarkIcon className="h-6 w-6"/></button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto">
                    {step === 'upload' && (
                        <div className="space-y-6 text-center">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-12 cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors flex flex-col items-center justify-center"
                            >
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="max-h-64 object-contain rounded shadow-sm" />
                                ) : (
                                    <>
                                        <DocumentArrowUpIcon className="h-16 w-16 text-gray-300 mb-4"/>
                                        <p className="font-medium text-gray-700">{t('bulkImportUpload')}</p>
                                        <p className="text-sm text-gray-500">{t('quoteImportOrDrag')}</p>
                                    </>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </div>
                            
                            {error && <p className="text-red-500 bg-red-50 p-2 rounded">{error}</p>}

                            <button 
                                onClick={handleProcess} 
                                disabled={!imageFile} 
                                className="w-full bg-secondary hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                            >
                                <SparklesIcon className="h-5 w-5"/>
                                {t('quoteImportProcessing')}
                            </button>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <svg className="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-lg font-medium text-gray-700">{t('bulkImportProcessing')}</p>
                        </div>
                    )}

                    {step === 'review' && (
                        <div>
                            <h3 className="font-bold mb-4">{t('bulkImportReview')}</h3>
                            <div className="space-y-2">
                                {extractedProducts.map((item, index) => (
                                    <div key={index} className="flex gap-2 items-center p-2 border rounded bg-gray-50">
                                        <input 
                                            type="text" 
                                            value={item.name} 
                                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                            className="flex-grow p-1 border rounded text-sm"
                                            placeholder="Name"
                                        />
                                        <input 
                                            type="text" 
                                            value={item.brand} 
                                            onChange={(e) => handleItemChange(index, 'brand', e.target.value)}
                                            className="w-24 p-1 border rounded text-sm"
                                            placeholder="Brand"
                                        />
                                        <input 
                                            type="number" 
                                            value={item.price} 
                                            onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                                            className="w-20 p-1 border rounded text-sm text-right"
                                            placeholder="Price"
                                        />
                                        <button onClick={() => handleDeleteItem(index)} className="text-red-500 hover:text-red-700 p-1">
                                            <TrashIcon className="h-5 w-5"/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-6 flex justify-end gap-4 border-t pt-4">
                                <button onClick={() => setStep('upload')} className="bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-200">
                                    Back
                                </button>
                                <button onClick={handleFinalImport} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-800 flex items-center gap-2">
                                    <PlusIcon className="h-5 w-5"/>
                                    {t('bulkImportAdd')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkImportModal;
