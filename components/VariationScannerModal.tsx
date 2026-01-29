
import React, { useState, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { GoogleGenAI, Type, Part } from '@google/genai';
import { XMarkIcon, CameraIcon, DocumentTextIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { VariationOrder } from '../types';

interface VariationScannerModalProps {
    onClose: () => void;
    onScanComplete: (data: Partial<VariationOrder>) => void;
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

const VariationScannerModal: React.FC<VariationScannerModalProps> = ({ onClose, onScanComplete }) => {
    const { t } = useLocalization();
    const [step, setStep] = useState<'upload' | 'processing'>('upload');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

    const handleScan = async () => {
        if (!imageFile || !process.env.API_KEY) {
            setError("Please upload an image and ensure API key is configured.");
            return;
        }

        setStep('processing');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const { mimeType, data } = await fileToBase64(imageFile);

            const prompt = `
                Analyze this document (handwritten note, email, or sketch) regarding a construction project change request.
                Extract the following information to populate a Variation Order (VO):
                1. "title": A short summary of the change (e.g. "Move Partition Wall").
                2. "description": Detailed description of what needs to change.
                3. "costImpact": Numeric estimate of cost increase/decrease (0 if unknown).
                4. "timeImpactDays": Estimated delay in days (0 if none).
                5. "justification": Why is this change happening? (e.g. "Client Request", "Site Condition").

                Return a JSON object.
            `;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    costImpact: { type: Type.NUMBER },
                    timeImpactDays: { type: Type.NUMBER },
                    justification: { type: Type.STRING }
                },
                required: ['title', 'description']
            };

            // Fix: Updated model name to gemini-3-flash-preview
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: {
                    parts: [
                        { inlineData: { mimeType: data } }, // Data already base64 string from helper
                        { text: prompt }
                    ]
                },
                config: { responseMimeType: 'application/json', responseSchema }
            });

            // Fix: Ensure correct property access for text
            const result = JSON.parse(response.text || "{}");
            onScanComplete(result);
            onClose();

        } catch (err) {
            console.error("VO Scan Error:", err);
            setError("Failed to scan document. Please try again.");
            setStep('upload');
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[80] p-4 animate-fade-in-scale">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <DocumentTextIcon className="h-6 w-6 text-primary"/> Scan Request
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6"/></button>
                </div>

                <div className="p-6">
                    {step === 'upload' && (
                        <div className="space-y-6 text-center">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors h-48 flex flex-col items-center justify-center relative"
                            >
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="max-h-full object-contain rounded"/>
                                ) : (
                                    <>
                                        <CameraIcon className="h-12 w-12 text-gray-300 mb-3"/>
                                        <p className="text-gray-600 font-medium">Take photo of note/sketch</p>
                                    </>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </div>
                            
                            {error && <p className="text-red-500 bg-red-50 p-2 rounded text-sm">{error}</p>}

                            <button 
                                onClick={handleScan} 
                                disabled={!imageFile} 
                                className="w-full bg-secondary hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                            >
                                <SparklesIcon className="h-5 w-5"/>
                                Scan & Extract
                            </button>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <svg className="animate-spin h-12 w-12 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-lg font-medium text-gray-700">Digitizing Request...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VariationScannerModal;
