
import React, { useState, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { ContractorAsset } from '../types';
import { GoogleGenAI, Part, Type } from '@google/genai';
import { XMarkIcon, CameraIcon, SparklesIcon } from '@heroicons/react/24/solid';

interface AssetFormModalProps {
    asset?: ContractorAsset | null;
    onClose: () => void;
    onSave: (asset: Omit<ContractorAsset, 'id' | 'contractorId'>) => void;
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

const AssetFormModal: React.FC<AssetFormModalProps> = ({ asset, onClose, onSave }) => {
    const { t } = useLocalization();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(asset?.imageUrl || null);
    
    const [formData, setFormData] = useState({
        name: asset?.name || '',
        category: asset?.category || 'Power Tools',
        description: asset?.description || '',
        status: asset?.status || 'Available' as const,
        locationType: asset?.locationType || 'Yard' as const,
        locationId: asset?.locationId || 'yard',
        locationName: asset?.locationName || 'Main Yard',
        imageUrl: asset?.imageUrl || '',
    });

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
            await handleAIIdentify(file);
        }
    };

    const handleAIIdentify = async (file: File) => {
        if (!process.env.API_KEY) return;
        setIsLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const { mimeType, data } = await fileToBase64(file);
            const imagePart: Part = { inlineData: { mimeType, data } };

            const prompt = `Identify this construction tool or equipment. Return a JSON object with:
            - name: Specific name (e.g. 'Makita 18V Cordless Drill')
            - category: General category (e.g. 'Power Tools', 'Hand Tools', 'Generators')
            - description: Brief 1-sentence description.`;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING },
                    description: { type: Type.STRING },
                },
                required: ['name', 'category', 'description']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, { text: prompt }] },
                config: { responseMimeType: 'application/json', responseSchema }
            });

            const result = JSON.parse(response.text);
            setFormData(prev => ({
                ...prev,
                name: result.name,
                category: result.category,
                description: result.description,
                imageUrl: previewUrl || '', // We don't upload, just use blob url for preview in this mock
            }));
        } catch (e) {
            console.error("AI ID Error", e);
            alert(t('assetFormAIError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{asset ? t('assetFormTitleEdit') : t('assetFormTitleNew')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6"/></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Image Upload / AI Scan */}
                    <div className="flex items-center justify-center w-full">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 overflow-hidden relative"
                        >
                            {previewUrl ? (
                                <img src={previewUrl} alt="Asset" className="w-full h-full object-contain" />
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <CameraIcon className="w-10 h-10 text-gray-400 mb-3" />
                                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">{t('assetFormAIIdentify')}</span></p>
                                </div>
                            )}
                            {isLoading && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                    <div className="flex flex-col items-center">
                                        <SparklesIcon className="h-8 w-8 text-accent animate-spin" />
                                        <p className="text-sm font-bold text-accent mt-2">{t('assetFormAIIdentifying')}</p>
                                    </div>
                                </div>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">{t('assetFormName')}</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-md" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">{t('assetFormCategory')}</label>
                            <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('assetFormStatus')}</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded-md bg-white">
                                <option value="Available">Available</option>
                                <option value="In Use">In Use</option>
                                <option value="Maintenance">Maintenance</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">{t('assetFormDescription')}</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded-md" rows={3} />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                        <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg">{t('assetFormSave')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssetFormModal;
