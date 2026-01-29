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
    const { costEstimateReport, isAILoading, estimatorError, generateCostEstimate, createProject, addProjectMaterialsInDb } = useData();
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
        if (!jobDescription.trim()) return;

        const newProject = await generateCostEstimate(jobDescription);
        if (newProject) {
            showToast(t('projectNavigatedToast'), 'info');
            onViewProject(newProject);
        }
    };

    const handleRealPhotoSubmit = async () => {
        if (!imageFile || !process.env.API_KEY) {
            setPhotoError("Please upload an image and ensure API key is configured.");
            return;
        }
        
        setIsPhotoAnalyzing(true);
        setPhotoError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const { mimeType, data } = await fileToBase64(imageFile);
            const imagePart: Part = { inlineData: { mimeType, data } };
            
            const systemInstruction = `You are an expert Quantity Surveyor in South Africa. 
            Analyze this construction site/room image. 
            1. Identify the likely renovation or construction task.
            2. List the materials needed using South African naming conventions (e.g., 'Cement Stock Bricks', 'RhinoBoard', 'Tile Adhesive').
            3. Estimate quantities based on visual size.
            4. Estimate costs in South African Rand (ZAR) based on current local market rates.
            
            Return a JSON object matching this schema:
            {
                "estimatedMaterials": [
                    { "itemName": string, "quantity": number, "estimatedCost": number }
                ],
                "assumptions": [string],
                "recommendations": [string],
                "disclaimer": string
            }`;

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
                contents: {
                    parts: [imagePart, { text: "Estimate materials and costs for renovating this space." }]
                },
                config: { systemInstruction, responseMimeType: "application/json", responseSchema }
            });

            const report = JSON.parse(response.text);
            
            // Create Project
            const project = await createProject({
                projectName: `Renovation Estimate from Photo`,
                clientName: "Pending",
                address: "Pending"
            });
            
            if (project) {
                 const materials = report.estimatedMaterials.map((m: any) => ({
                     projectId: project.id,
                     productId: `est-mat-${Math.random()}`,
                     productName: m.itemName,
                     quantity: m.quantity,
                     pricePerUnit: m.quantity > 0 ? m.estimatedCost / m.quantity : 0,
                     status: 'To Order'
                 }));
                 
                 // Add materials
                 await addProjectMaterialsInDb(materials);
                 
                 showToast(t('projectNavigatedToast'), 'info');
                 onViewProject(project);
            }

        } catch (err) {
            console.error("Photo Estimate Error:", err);
            setPhotoError("Failed to analyze photo. Please try again.");
        } finally {
            setIsPhotoAnalyzing(false);
        }
    };

    const totalCost = costEstimateReport?.estimatedMaterials.reduce((sum, item) => sum + item.estimatedCost, 0) || 0;

    return (
        <div>
            {onBack && (
                <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-4">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    {t('backToDashboard')}
                </button>
            )}
            <h2 className="text-3xl font-bold">{t('estimatorTitle')}</h2>
            <p className="text-gray-600 mb-6">{t('estimatorDescription')}</p>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex mb-6 bg-gray-100 p-1 rounded-lg w-fit">
                    <button 
                        onClick={() => setMode('text')} 
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${mode === 'text' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
                    >
                        <DocumentTextIcon className="h-4 w-4 inline mr-2"/>
                        {t('estimatorModeText')}
                    </button>
                    <button 
                        onClick={() => setMode('photo')} 
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${mode === 'photo' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
                    >
                        <CameraIcon className="h-4 w-4 inline mr-2"/>
                        {t('estimatorModePhoto')}
                    </button>
                </div>

                {mode === 'text' ? (
                    <form onSubmit={handleTextSubmit}>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder={t('estimatorPlaceholder')}
                            className="w-full p-3 border-2 border-base-300 rounded-lg focus:ring-primary focus:border-primary transition-colors"
                            rows={4}
                            disabled={isAILoading.estimator}
                        />
                        <button
                            type="submit"
                            disabled={isAILoading.estimator || !jobDescription.trim()}
                            className="w-full sm:w-auto mt-4 flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isAILoading.estimator ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    {t('estimatorSubmitting')}
                                </>
                            ) : (
                                <>
                                    <CalculatorIcon className="h-5 w-5" />
                                    {t('estimatorSubmit')}
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors flex flex-col items-center justify-center h-64 relative"
                        >
                            {previewUrl ? (
                                <>
                                    <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded"/>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                                    >
                                        <XCircleIcon className="h-6 w-6"/>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <DocumentArrowUpIcon className="h-12 w-12 text-gray-300 mb-2"/>
                                    <p className="text-gray-600 font-medium">{t('estimatorPhotoUpload')}</p>
                                    <p className="text-xs text-gray-400">{t('estimatorPhotoPrompt')}</p>
                                </>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </div>
                        
                        {photoError && <p className="text-red-500 text-sm text-center">{photoError}</p>}

                        <button
                            onClick={handleRealPhotoSubmit}
                            disabled={isPhotoAnalyzing || !imageFile}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 mx-auto"
                        >
                            {isPhotoAnalyzing ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <CameraIcon className="h-5 w-5" />
                                    Generate from Photo
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {estimatorError && mode === 'text' && <div className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert"><p>{estimatorError}</p></div>}
            
            {costEstimateReport && mode === 'text' && !isAILoading.estimator && (
                <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-2xl font-bold mb-4 text-primary">{t('estimatorReportTitle')}</h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-bold text-lg mb-2">{t('estimatorEstimatedMaterials')}</h4>
                                <div className="overflow-x-auto border rounded-lg text-left">
                                    <table className="w-full text-sm">
                                        <thead className="bg-base-100">
                                            <tr>
                                                <th className="p-3 text-left font-semibold">{t('estimatorItemName')}</th>
                                                <th className="p-3 text-center font-semibold">{t('estimatorQuantity')}</th>
                                                <th className="p-3 text-right font-semibold">{t('estimatorEstimatedCost')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {costEstimateReport.estimatedMaterials.map((item, index) => (
                                                <tr key={index} className="border-t">
                                                    <td className="p-3">{item.itemName}</td>
                                                    <td className="p-3 text-center">{item.quantity}</td>
                                                    <td className="p-3 text-right">{formatCurrency(item.estimatedCost)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-base-100 font-bold">
                                            <tr>
                                                <td colSpan={2} className="p-3 text-right">{t('estimatorTotalCost')}</td>
                                                <td className="p-3 text-right text-lg text-secondary">{formatCurrency(totalCost)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6 text-left">
                            <div>
                                <h4 className="font-bold text-lg mb-2">{t('estimatorAssumptions')}</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 bg-base-100 p-4 rounded-lg">
                                    {costEstimateReport.assumptions.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg mb-2">{t('estimatorRecommendations')}</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 bg-base-100 p-4 rounded-lg">
                                    {costEstimateReport.recommendations.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm flex items-start gap-3">
                        <InformationCircleIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <p>{costEstimateReport.disclaimer}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CostEstimatorPage;