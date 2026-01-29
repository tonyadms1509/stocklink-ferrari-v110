
import React, { useState, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useData } from '../hooks/useDataContext';
import { GoogleGenAI, Type, Part } from '@google/genai';
import { XMarkIcon, CameraIcon, SparklesIcon, CheckCircleIcon, ExclamationCircleIcon, ArchiveBoxIcon } from '@heroicons/react/24/solid';
import { Product } from '../types';

interface SmartStocktakeModalProps {
    onClose: () => void;
    onUpdateStock: (product: Product, newQuantity: number) => void;
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

const SmartStocktakeModal: React.FC<SmartStocktakeModalProps> = ({ onClose, onUpdateStock }) => {
    const { t } = useLocalization();
    const { products } = useData(); 
    const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Analysis Results
    const [identifiedName, setIdentifiedName] = useState('');
    const [estimatedCount, setEstimatedCount] = useState(0);
    const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
    const [manualCount, setManualCount] = useState<string>('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!imageFile || !process.env.API_KEY) {
            setError("Please upload an image and ensure API key is configured.");
            return;
        }

        setStep('processing');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const { mimeType, data } = await fileToBase64(imageFile);
            const imagePart: Part = { inlineData: { mimeType, data } };
            
            // Create context string of existing products for matching
            const productCatalog = products.map(p => `${p.id}: ${p.name} (${p.brand})`).join('\n');

            const prompt = `
                Analyze this inventory image.
                1. Identify the main product visible (e.g. "Cement Bags", "Copper Pipes", "Paint Cans").
                2. Count the visible quantity. If it's a pallet/stack, estimate the total.
                3. Try to match it against the provided Product Catalog.
                
                Product Catalog:
                ${productCatalog}

                Return JSON:
                {
                    "identifiedName": "string",
                    "visibleCount": number,
                    "matchedProductId": "string" (id from catalog, or null if no match found)
                }
            `;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    identifiedName: { type: Type.STRING },
                    visibleCount: { type: Type.NUMBER },
                    matchedProductId: { type: Type.STRING, nullable: true }
                },
                required: ['identifiedName', 'visibleCount']
            };

            // Fix: Updated model name to gemini-3-flash-preview
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: {
                    parts: [imagePart, { text: prompt }]
                },
                config: { responseMimeType: 'application/json', responseSchema }
            });

            // Fix: Ensure correct property access for text
            const result = JSON.parse(response.text || "{}");
            
            setIdentifiedName(result.identifiedName);
            setEstimatedCount(result.visibleCount);
            setManualCount(result.visibleCount?.toString() || '0');

            if (result.matchedProductId) {
                const product = products.find(p => p.id === result.matchedProductId);
                setMatchedProduct(product || null);
            } else {
                setMatchedProduct(null);
            }

            setStep('review');

        } catch (err) {
            console.error("Stocktake Error:", err);
            setError("Failed to analyze image. Please try again.");
            setStep('upload');
        }
    };

    const handleConfirm = () => {
        if (matchedProduct) {
            const count = parseInt(manualCount, 10);
            if (!isNaN(count)) {
                onUpdateStock(matchedProduct, count);
                onClose();
            }
        } else {
            alert("Please match a product from your catalog manually.");
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[80] p-4 animate-fade-in-scale">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                        <ArchiveBoxIcon className="h-6 w-6"/> Smart Stocktake
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6"/></button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto">
                    {step === 'upload' && (
                        <div className="space-y-6 text-center">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors flex flex-col items-center justify-center h-64"
                            >
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="max-h-full object-contain rounded shadow-sm"/>
                                ) : (
                                    <>
                                        <CameraIcon className="h-16 w-16 text-gray-300 mb-4"/>
                                        <p className="font-medium text-gray-700">Take a photo of shelf or pallet</p>
                                        <p className="text-sm text-gray-500">AI will count items for you</p>
                                    </>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </div>
                            
                            {error && <p className="text-red-500 bg-red-50 p-2 rounded text-sm">{error}</p>}

                            <button 
                                onClick={handleAnalyze} 
                                disabled={!imageFile} 
                                className="w-full bg-secondary hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-md"
                            >
                                <SparklesIcon className="h-5 w-5"/>
                                Analyze Stock
                            </button>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-blue-200 border-t-primary rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ArchiveBoxIcon className="h-6 w-6 text-primary"/>
                                </div>
                            </div>
                            <p className="text-lg font-medium text-gray-700">Counting items...</p>
                        </div>
                    )}

                    {step === 'review' && (
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-4 rounded-lg flex gap-4 items-start border border-gray-200">
                                <div className="w-20 h-20 bg-white rounded-md border overflow-hidden flex-shrink-0">
                                    <img src={previewUrl || ''} alt="Snapshot" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">AI Identified</p>
                                    <p className="font-bold text-lg text-gray-900">{identifiedName}</p>
                                    <p className="text-sm text-blue-600">Est. Count: {estimatedCount}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Matched Product</label>
                                {matchedProduct ? (
                                    <div className="p-3 border-2 border-green-500 bg-green-50 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-green-900">{matchedProduct.name}</p>
                                            <p className="text-xs text-green-700">Current System Stock: {matchedProduct.stock}</p>
                                        </div>
                                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                                    </div>
                                ) : (
                                    <div className="p-3 border-2 border-yellow-400 bg-yellow-50 rounded-lg flex items-center gap-3">
                                        <ExclamationCircleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                                        <div>
                                            <p className="font-bold text-yellow-900">No exact match found</p>
                                            <p className="text-xs text-yellow-700">Please update manually.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirm Quantity</label>
                                <input 
                                    type="number" 
                                    value={manualCount} 
                                    onChange={e => setManualCount(e.target.value)} 
                                    className="mt-1 w-full p-3 border rounded-lg text-lg font-bold"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setStep('upload')} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200">
                                    Retake
                                </button>
                                <button 
                                    onClick={handleConfirm} 
                                    disabled={!matchedProduct}
                                    className="flex-1 bg-primary text-white font-bold py-3 rounded-lg hover:bg-blue-800 disabled:opacity-50"
                                >
                                    Update Stock
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SmartStocktakeModal;
