
import React, { useState, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useData } from '../hooks/useDataContext';
import { ExpenseCategory } from '../types';
import { XMarkIcon, CameraIcon, DocumentArrowUpIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI, Type, Part } from '@google/genai';

interface ExpenseScannerModalProps {
    projectId: string;
    onClose: () => void;
    onScanComplete?: (data: any) => void;
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

const ExpenseScannerModal: React.FC<ExpenseScannerModalProps> = ({ projectId, onClose, onScanComplete }) => {
    const { t } = useLocalization();
    const { addExpense, projects } = useData();
    const [step, setStep] = useState<'upload' | 'scanning' | 'review'>('upload');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.Materials);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [confidence, setConfidence] = useState<string>('');

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
            setError("Please upload an image. API key is required.");
            return;
        }

        setStep('scanning');
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const { mimeType, data } = await fileToBase64(imageFile);
            
            const prompt = `
                Analyze this receipt/invoice image for a construction project expense.
                Extract the following information:
                1. Vendor Name (e.g., "BuildIt", "Builders Warehouse").
                2. Short description of items (e.g., "Cement and Sand", "Plumbing fittings").
                3. Total Amount (numeric value only).
                4. Date of transaction (ISO format YYYY-MM-DD).
                5. Best fitting Category from this list: 'Materials', 'Labor', 'Equipment Rental', 'Permits', 'Other'.

                Return a JSON object with keys: "vendor", "itemsSummary", "totalAmount", "date", "category".
            `;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    vendor: { type: Type.STRING },
                    itemsSummary: { type: Type.STRING },
                    totalAmount: { type: Type.NUMBER },
                    date: { type: Type.STRING },
                    category: { type: Type.STRING, enum: ['Materials', 'Labor', 'Equipment Rental', 'Permits', 'Other'] }
                },
                required: ['vendor', 'totalAmount', 'category']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [
                        { inlineData: { mimeType, data } },
                        { text: prompt }
                    ]
                },
                config: {
                    responseMimeType: 'application/json',
                    responseSchema
                }
            });

            const text = response.text || "{}";
            const result = JSON.parse(text);
            
            setDescription(`${result.vendor} - ${result.itemsSummary || 'Expense'}`);
            setAmount(result.totalAmount?.toString() || '');
            setCategory((result.category as ExpenseCategory) || ExpenseCategory.Other);
            if(result.date) setDate(result.date);
            
            setConfidence("High"); 
            setStep('review');

        } catch (err) {
            console.error("Scan Error:", err);
            setError("Could not read the receipt. Please enter details manually.");
            setStep('review'); 
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (projectId && description && amount) {
            const expenseData = {
                projectId,
                description,
                category,
                amount: parseFloat(amount),
                date: new Date(date).toISOString(),
            };
            
            await addExpense(expenseData);
            
            if (onScanComplete) {
                onScanComplete(expenseData);
            } else {
                onClose();
            }
        }
    };

    const project = projects.find(p => p.id === projectId);

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[70] p-4 backdrop-blur-sm animate-fade-in-scale">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                            <CameraIcon className="h-6 w-6"/>
                            {t('expenseScannerTitle')}
                        </h2>
                        <p className="text-xs text-gray-500">Project: {project?.projectName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XMarkIcon className="h-6 w-6"/></button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto">
                    {step === 'upload' && (
                        <div className="space-y-6 text-center">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors h-48 flex flex-col items-center justify-center"
                            >
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Receipt" className="max-h-full object-contain rounded"/>
                                ) : (
                                    <>
                                        <DocumentArrowUpIcon className="h-12 w-12 text-gray-300 mb-2"/>
                                        <p className="text-gray-600 font-medium">{t('expenseScannerUploadPrompt')}</p>
                                        <p className="text-xs text-gray-400">JPG, PNG supported</p>
                                    </>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </div>
                            
                            {error && <p className="text-red-500 bg-red-50 p-2 rounded">{error}</p>}

                            <button 
                                onClick={handleScan} 
                                disabled={!imageFile} 
                                className="w-full bg-secondary hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <SparklesIcon className="h-5 w-5"/>
                                {t('expenseScannerButton')}
                            </button>
                        </div>
                    )}

                    {step === 'scanning' && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-blue-200 border-t-primary rounded-full animate-spin"></div>
                                <SparklesIcon className="h-6 w-6 text-accent absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"/>
                            </div>
                            <p className="text-lg font-medium text-gray-700">{t('expenseScannerProcessing')}</p>
                            <p className="text-sm text-gray-500">Extracting vendor, date, and totals...</p>
                        </div>
                    )}

                    {step === 'review' && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {confidence && (
                                <div className="bg-green-50 text-green-800 text-xs px-3 py-2 rounded flex items-center gap-2 mb-4">
                                    <CheckCircleIcon className="h-4 w-4"/>
                                    {t('expenseScannerSuccess')}
                                </div>
                            )}
                            {error && (
                                <div className="bg-red-50 text-red-800 text-xs px-3 py-2 rounded mb-4">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('formExpenseDescription')}</label>
                                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 p-2 w-full border rounded-md" required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{t('rfsCategory')}</label>
                                    <select value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)} className="mt-1 p-2 w-full border rounded-md bg-white">
                                        {Object.values(ExpenseCategory).map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{t('formExpenseAmount')}</label>
                                    <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 p-2 w-full border rounded-md font-bold text-gray-900" required />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('quoteDate')}</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 p-2 w-full border rounded-md" required />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setStep('upload')} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg text-sm">
                                    Scan Again
                                </button>
                                <button type="submit" className="flex-1 bg-primary hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg text-sm">
                                    {t('projectAddExpense')}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpenseScannerModal;
