
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { CartItem } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { SparklesIcon, ExclamationTriangleIcon, LightBulbIcon, XMarkIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

interface CartAIAnalysisProps {
    items: CartItem[];
}

interface AnalysisResult {
    missingItems: string[];
    warnings: string[];
    suggestions: string[];
}

const CartAIAnalysis: React.FC<CartAIAnalysisProps> = ({ items }) => {
    const { t } = useLocalization();
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    const handleAnalyze = async () => {
        if (items.length === 0 || !process.env.API_KEY) return;
        
        setIsLoading(true);
        setIsVisible(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const itemList = items.map(i => `${i.quantity} x ${i.name} (${i.category})`).join(', ');

            const prompt = `
                You are an expert construction site manager reviewing a shopping list.
                Analyze the following list of materials:
                "${itemList}"

                Identify:
                1. Missing essential complementary items (e.g., if there are "Bricks" but no "Sand" or "Cement").
                2. Potential compatibility warnings (e.g., "Copper pipes" with "Galvanized fittings").
                3. General project suggestions.

                Return a JSON object with keys: "missingItems" (array of strings), "warnings" (array of strings), "suggestions" (array of strings).
                Keep descriptions brief. If list looks complete or empty, return empty arrays.
            `;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    missingItems: { type: Type.ARRAY, items: { type: Type.STRING } },
                    warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
                    suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: 'application/json', responseSchema }
            });

            setAnalysis(JSON.parse(response.text));

        } catch (e) {
            console.error("Cart Analysis Error", e);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-analyze when items change significantly (debounced in real app, simple check here)
    useEffect(() => {
        if (items.length > 0) {
            // Reset previous analysis
            setAnalysis(null);
        }
    }, [items.length]);

    if (items.length === 0) return null;

    if (!analysis && !isLoading) {
        return (
            <button 
                onClick={handleAnalyze}
                className="w-full mb-6 bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 p-4 rounded-xl flex items-center justify-between group hover:shadow-md transition-all"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm text-purple-600">
                        <SparklesIcon className="h-5 w-5"/>
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-purple-900 text-sm">Analyze Cart</p>
                        <p className="text-xs text-purple-700">Check for missing items & compatibility.</p>
                    </div>
                </div>
                <div className="bg-white text-purple-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    Check Now
                </div>
            </button>
        );
    }

    if (!isVisible) return null;

    return (
        <div className="mb-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-fade-in-up">
            <div className="bg-gray-50 p-4 flex justify-between items-center border-b border-gray-100">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                    {isLoading ? <ArrowPathIcon className="h-4 w-4 animate-spin text-primary"/> : <SparklesIcon className="h-4 w-4 text-purple-500"/>}
                    {isLoading ? 'Analyzing List...' : 'AI Cart Insights'}
                </h3>
                <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-5 w-5"/>
                </button>
            </div>
            
            {!isLoading && analysis && (
                <div className="p-4 space-y-4">
                    {analysis.warnings.length > 0 && (
                        <div className="flex gap-3">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0"/>
                            <div>
                                <p className="text-xs font-bold text-red-700 uppercase mb-1">Warnings</p>
                                <ul className="text-sm text-gray-700 list-disc list-inside">
                                    {analysis.warnings.map((w, i) => <li key={i}>{w}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}
                    
                    {analysis.missingItems.length > 0 && (
                        <div className="flex gap-3">
                            <LightBulbIcon className="h-5 w-5 text-yellow-500 flex-shrink-0"/>
                            <div>
                                <p className="text-xs font-bold text-yellow-700 uppercase mb-1">Did you forget?</p>
                                <ul className="text-sm text-gray-700 list-disc list-inside">
                                    {analysis.missingItems.map((m, i) => <li key={i}>{m}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}

                    {analysis.suggestions.length > 0 && analysis.missingItems.length === 0 && analysis.warnings.length === 0 && (
                         <div className="flex gap-3">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0"/>
                            <div>
                                <p className="text-xs font-bold text-green-700 uppercase mb-1">Looking Good</p>
                                <p className="text-sm text-gray-600">Your list looks solid. {analysis.suggestions[0]}</p>
                            </div>
                        </div>
                    )}

                    {analysis.missingItems.length === 0 && analysis.warnings.length === 0 && analysis.suggestions.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-2">No issues found. Great job!</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default CartAIAnalysis;
