
import React, { useState, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useData } from '../hooks/useDataContext';
import { Product } from '../types';
import { XMarkIcon, CameraIcon, DocumentTextIcon, CheckCircleIcon, ExclamationCircleIcon, ArrowRightIcon, PlusIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI, Type, Part } from '@google/genai';

interface ScannedItem {
    rawText: string;
    quantity: number;
    matchedProduct?: Product;
}

interface ListScannerModalProps {
    onClose: () => void;
    onAddItems: (items: { product: Product; quantity: number }[]) => void;
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

const ListScannerModal: React.FC<ListScannerModalProps> = ({ onClose, onAddItems }) => {
    const { t } = useLocalization();
    const { products } = useData();
    const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
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

    const processImage = async () => {
        if (!imageFile || !process.env.API_KEY) {
            setError("Please upload an image and ensure API key is configured.");
            return;
        }

        setStep('processing');
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const { mimeType, data } = await fileToBase64(imageFile);
            const imagePart: Part = { inlineData: { mimeType, data } };
            
            // Simplify product catalog for the prompt to save tokens/complexity
            const catalogContext = products.map(p => `${p.id}: ${p.name} (${p.brand})`).join('\n');

            const prompt = `
                You are an AI assistant for a construction app. Your task is to read a HANDWRITTEN list of building materials from an image and match them to our product catalog.

                1. Transcribe the handwritten items and their quantities.
                2. For each item, try to find the closest match in the Provided Catalog.
                3. If a match is found, return the Catalog ID. If not, return null for the ID.
                4. Return a JSON array.

                Provided Catalog:
                ${catalogContext}
                
                Response Format (JSON array):
                [
                    { "rawText": "text read from image", "quantity": number, "matchedProductId": "id from catalog or null" }
                ]
            `;

            const responseSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        rawText: { type: Type.STRING },
                        quantity: { type: Type.NUMBER },
                        matchedProductId: { type: Type.STRING, nullable: true }
                    },
                    required: ['rawText', 'quantity']
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

            const text = response.text || "[]";
            const rawResults = JSON.parse(text);
            
            const processedResults: ScannedItem[] = rawResults.map((item: any) => ({
                rawText: item.rawText,
                quantity: item.quantity || 1,
                matchedProduct: item.matchedProductId ? products.find(p => p.id === item.matchedProductId) : undefined
            }));

            setScannedItems(processedResults);
            setStep('review');

        } catch (err) {
            console.error("Scan error:", err);
            setError("Failed to process the image. Please try again with a clearer photo.");
            setStep('upload');
        }
    };

    const handleAddSelected = () => {
        const itemsToAdd = scannedItems
            .filter(item => item.matchedProduct)
            .map(item => ({
                product: item.matchedProduct!,
                quantity: item.quantity
            }));
        
        onAddItems(itemsToAdd);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[60] p-4 animate-fade-in-scale">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <CameraIcon className="h-6 w-6 text-primary"/>
                        Scan Handwritten List
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6"/></button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto">
                    {step === 'upload' && (
                        <div className="space-y-6 text-center">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors"
                            >
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-md shadow-sm"/>
                                ) : (
                                    <div className="flex flex-col items-center text-gray-500">
                                        <DocumentTextIcon className="h-16 w-16 mb-2 text-gray-300"/>
                                        <p className="font-medium">Click to capture or upload</p>
                                        <p className="text-sm">Supported: JPG, PNG</p>
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </div>
                            
                            {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}

                            <button 
                                onClick={processImage} 
                                disabled={!imageFile}
                                className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                            >
                                Process List
                            </button>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-blue-200 border-t-primary rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <CameraIcon className="h-6 w-6 text-primary animate-pulse"/>
                                </div>
                            </div>
                            <p className="text-lg font-medium text-gray-700">Reading handwriting...</p>
                            <p className="text-sm text-gray-500">Matching items to catalog...</p>
                        </div>
                    )}

                    {step === 'review' && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">Review the items we found. Unmatched items will be ignored.</p>
                            <div className="space-y-2">
                                {scannedItems.map((item, idx) => (
                                    <div key={idx} className={`p-3 rounded-lg border flex items-center justify-between ${item.matchedProduct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200 opacity-75'}`}>
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            {item.matchedProduct ? (
                                                <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0"/>
                                            ) : (
                                                <ExclamationCircleIcon className="h-5 w-5 text-red-400 flex-shrink-0"/>
                                            )}
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm truncate">{item.matchedProduct?.name || item.rawText}</p>
                                                <p className="text-xs text-gray-500">Scanned: "{item.rawText}"</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-sm font-semibold bg-white px-2 py-1 rounded border">x{item.quantity}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {scannedItems.length === 0 && <p className="text-center text-gray-500 italic">No items identified.</p>}
                        </div>
                    )}
                </div>

                {step === 'review' && (
                    <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
                        <button onClick={() => setStep('upload')} className="text-gray-600 hover:text-gray-800 font-semibold px-4 py-2">
                            Scan Again
                        </button>
                        <button 
                            onClick={handleAddSelected}
                            disabled={scannedItems.filter(i => i.matchedProduct).length === 0}
                            className="bg-secondary hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
                        >
                            <PlusIcon className="h-5 w-5"/>
                            Add {scannedItems.filter(i => i.matchedProduct).length} Items
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListScannerModal;
