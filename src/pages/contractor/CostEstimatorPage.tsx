import React, { useState, useRef } from 'react';
import { Project } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { useData } from '../../hooks/useDataContext';
import { useCurrency } from '../../hooks/useCurrency';
import { CalculatorIcon, InformationCircleIcon, ArrowLeftIcon, CameraIcon, DocumentTextIcon, DocumentArrowUpIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useToast } from '../../hooks/useToast';
import { GoogleGenAI, Type, Part } from '@google/genai';

interface CostEstimatorPageProps {
    onBack?: () => void;
    onViewProject: (project: Project) => void;
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

const CostEstimatorPage: React.FC<CostEstimatorPageProps> = ({ onBack, onViewProject }) => {
    const { t } = useLocalization();
    const { costEstimateReport, isAILoading, generateCostEstimate, createProject, addProjectMaterialsInDb } = useData();
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();
    
    const [mode, setMode] = useState<'text' | 'photo'>('text');
    const [jobDescription, setJobDescription] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [isPhotoAnalyzing, setIsPhotoAnalyzing] = useState(false);
    const [photoError, setPhotoError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setPhotoError(null);
        }
    };
    
    const removeImage = () => {
        setImageFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    const handleTextSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!process.env.API_KEY) {
            if (window.aistudio) {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                if (!hasKey) {
                    await window.aistudio.openSelectKey();
                }
            }
        }
        if (!jobDescription.trim()) return;

        const newProject = await generateCostEstimate(jobDescription);
        if (newProject) {
            showToast(t('projectNavigatedToast'), 'info');
            onViewProject(newProject);
        }
    };

    const handleRealPhotoSubmit = async () => {
        if (!process.env.API_KEY) {
            if (window.aistudio) {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                if (!hasKey) {
                    await window.aistudio.openSelectKey();
                }
            }
        }

        if (!imageFile) {
            setPhotoError("Please upload an image.");
            return;
        }
        
        setIsPhotoAnalyzing(true);
        setPhotoError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const { mimeType, data } = await fileToBase64(imageFile);
            const imagePart: Part = { inlineData: { mimeType, data } };
            
            const prompt = `You are an expert Quantity Surveyor in South Africa. Analyze this room/site image. Identify renovation tasks and materials needed. Return JSON.`;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    estimatedMaterials: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { itemName: { type: Type.STRING }, quantity: { type: Type.NUMBER }, estimatedCost: { type: Type.NUMBER } } } },
                    assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                    disclaimer: { type: Type.STRING }
                },
                required: ["estimatedMaterials", "assumptions", "recommendations", "disclaimer"]
            };

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: [imagePart, { text: "Estimate materials and costs for renovating this space." }] },
                config: { responseMimeType: "application/json", responseSchema }
            });

            const report = JSON.parse(response.text);
            const project = await createProject({ projectName: `Photo Estimate`, clientName: "Pending", address: "Pending" });
            if (project) {
                 const materials = report.estimatedMaterials.map((m: any) => ({ projectId: project.id, productName: m.itemName, quantity: m.quantity, pricePerUnit: m.quantity > 0 ? m.estimatedCost / m.quantity : 0, status: 'To Order' }));
                 await addProjectMaterialsInDb(materials);
                 showToast(t('projectNavigatedToast'), 'info');
                 onViewProject(project);
            }
        } catch (err) {
            console.error("Photo Estimate Error:", err);
            setPhotoError("Failed to analyze photo.");
        } finally {
            setIsPhotoAnalyzing(false);
        }
    };

    const totalCost = costEstimateReport?.estimatedMaterials.reduce((sum, item) => sum + item.estimatedCost, 0) || 0;

    return (
        <div className="pb-12 h-full flex flex-col">
            {onBack && (
                <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-4">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    {t('backToDashboard')}
                </button>
            )}
            <h2 className="text-3xl font-bold">{t('estimatorTitle')}</h2>
            <p className="text-gray-600 mb-6">{t('estimatorDescription')}</p>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex mb-6 bg-gray-100 p-1 rounded-lg w-fit">
                    <button onClick={() => setMode('text')} className={`px-4 py-2 rounded-md text-sm font-bold ${mode === 'text' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>{t('estimatorModeText')}</button>
                    <button onClick={() => setMode('photo')} className={`px-4 py-2 rounded-md text-sm font-bold ${mode === 'photo' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>{t('estimatorModePhoto')}</button>
                </div>

                {mode === 'text' ? (
                    <form onSubmit={handleTextSubmit}>
                        <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder={t('estimatorPlaceholder')} className="w-full p-3 border rounded-lg focus:ring-primary h-32" disabled={isAILoading.estimator} />
                        <button type="submit" disabled={isAILoading.estimator || !jobDescription.trim()} className="mt-4 w-full bg-primary text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50">
                            {isAILoading.estimator ? "Estimating..." : t('estimatorSubmit')}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-lg p-8 cursor-pointer hover:bg-blue-50 flex flex-col items-center justify-center h-64 relative">
                            {previewUrl ? <img src={previewUrl} className="max-h-full object-contain" /> : <DocumentArrowUpIcon className="h-12 w-12 text-gray-300"/>}
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </div>
                        <button onClick={handleRealPhotoSubmit} disabled={isPhotoAnalyzing || !imageFile} className="w-full bg-primary text-white font-bold py-3 rounded-lg disabled:opacity-50">
                            {isPhotoAnalyzing ? "Analyzing Photo..." : "Generate from Photo"}
                        </button>
                    </div>
                )}
            </div>
            {photoError && <p className="text-red-500 mt-4 text-center">{photoError}</p>}
        </div>
    );
};

export default CostEstimatorPage;