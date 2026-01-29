
import React, { useState } from 'react';
import { XMarkIcon, ScissorsIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI, Type } from '@google/genai';
import { useLocalization } from '../../hooks/useLocalization';

interface CuttingListModalProps {
    onClose: () => void;
}

interface CutItem {
    length: number;
    quantity: number;
}

interface StockResult {
    stockLength: number;
    parts: number[]; // lengths of parts cut from this stock
    waste: number;
}

const CuttingListModal: React.FC<CuttingListModalProps> = ({ onClose }) => {
    const { t } = useLocalization();
    const [stockLength, setStockLength] = useState(6000); // mm
    const [bladeWidth, setBladeWidth] = useState(3); // mm
    const [cuts, setCuts] = useState<CutItem[]>([{ length: 0, quantity: 1 }]);
    const [results, setResults] = useState<StockResult[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const addCutRow = () => setCuts([...cuts, { length: 0, quantity: 1 }]);
    const removeCutRow = (index: number) => setCuts(cuts.filter((_, i) => i !== index));
    
    const updateCut = (index: number, field: keyof CutItem, value: number) => {
        const newCuts = [...cuts];
        newCuts[index] = { ...newCuts[index], [field]: value };
        setCuts(newCuts);
    };

    const handleOptimize = async () => {
        if (!process.env.API_KEY) {
            alert("API Key required.");
            return;
        }
        
        const validCuts = cuts.filter(c => c.length > 0 && c.quantity > 0);
        if (validCuts.length === 0) {
            alert("Please add at least one valid cut.");
            return;
        }

        setIsLoading(true);
        setResults(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Solve the 1D Cutting Stock Problem.
                Stock Length: ${stockLength}mm.
                Kerf (Blade Width): ${bladeWidth}mm (must be subtracted for each cut).
                
                Required Cuts:
                ${validCuts.map(c => `- ${c.quantity} pieces of ${c.length}mm`).join('\n')}

                Optimize to minimize the number of stock lengths used and minimize waste.
                Return a JSON object with a "layout" array. Each item in "layout" represents one stock bar and contains an array "cuts" (list of lengths cut from it) and "waste" (remaining length).
            `;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    layout: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                cuts: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                                waste: { type: Type.NUMBER }
                            },
                            required: ['cuts', 'waste']
                        }
                    }
                },
                required: ['layout']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: 'application/json', responseSchema }
            });

            const data = JSON.parse(response.text || "{}");
            setResults(data.layout.map((l: any) => ({
                stockLength,
                parts: l.cuts,
                waste: l.waste
            })));

        } catch (e) {
            console.error(e);
            alert("Optimization failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[70] p-4 animate-fade-in-scale">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                        <ScissorsIcon className="h-6 w-6"/> Cutting List Optimizer
                    </h2>
                    <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-gray-500 hover:text-gray-800"/></button>
                </div>

                <div className="flex flex-grow overflow-hidden">
                    {/* Inputs */}
                    <div className="w-1/3 p-6 border-r bg-white overflow-y-auto">
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Stock Length (mm)</label>
                                <input type="number" value={stockLength} onChange={e => setStockLength(parseInt(e.target.value) || 0)} className="w-full p-2 border rounded font-mono" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Blade Width (mm)</label>
                                <input type="number" value={bladeWidth} onChange={e => setBladeWidth(parseInt(e.target.value) || 0)} className="w-full p-2 border rounded font-mono" />
                            </div>
                        </div>

                        <h4 className="font-bold mb-2 text-sm text-gray-700">Required Cuts</h4>
                        <div className="space-y-2 mb-4">
                            {cuts.map((cut, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <input 
                                        type="number" 
                                        placeholder="Len" 
                                        value={cut.length || ''} 
                                        onChange={e => updateCut(i, 'length', parseInt(e.target.value))}
                                        className="w-24 p-2 border rounded font-mono text-sm"
                                    />
                                    <span className="text-gray-400">x</span>
                                    <input 
                                        type="number" 
                                        placeholder="Qty" 
                                        value={cut.quantity} 
                                        onChange={e => updateCut(i, 'quantity', parseInt(e.target.value))}
                                        className="w-16 p-2 border rounded font-mono text-sm text-center"
                                    />
                                    <button onClick={() => removeCutRow(i)} className="text-red-400 hover:text-red-600"><XMarkIcon className="h-4 w-4"/></button>
                                </div>
                            ))}
                            <button onClick={addCutRow} className="text-sm text-primary font-semibold hover:underline">+ Add Row</button>
                        </div>

                        <button 
                            onClick={handleOptimize} 
                            disabled={isLoading}
                            className="w-full bg-secondary text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-emerald-600 disabled:opacity-50"
                        >
                            {isLoading ? <SparklesIcon className="h-5 w-5 animate-spin"/> : <SparklesIcon className="h-5 w-5"/>}
                            Optimize Layout
                        </button>
                    </div>

                    {/* Visualization */}
                    <div className="w-2/3 p-8 bg-gray-100 overflow-y-auto">
                        {results ? (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold">Optimization Result</h3>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                                        Total Stock Required: {results.length} lengths
                                    </span>
                                </div>

                                {results.map((bar, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                        <p className="text-xs font-bold text-gray-500 mb-2">Bar {idx + 1}</p>
                                        <div className="relative h-12 w-full bg-gray-200 rounded overflow-hidden flex border border-gray-300">
                                            {bar.parts.map((part, pIdx) => {
                                                const widthPercent = (part / stockLength) * 100;
                                                return (
                                                    <div 
                                                        key={pIdx} 
                                                        style={{ width: `${widthPercent}%` }}
                                                        className="h-full bg-blue-500 border-r border-white flex items-center justify-center text-white text-xs font-mono overflow-hidden whitespace-nowrap hover:bg-blue-600 transition-colors"
                                                        title={`${part}mm`}
                                                    >
                                                        {part}
                                                    </div>
                                                );
                                            })}
                                            {/* Waste */}
                                            <div className="flex-grow bg-red-100 flex items-center justify-center text-red-800 text-xs font-mono border-l border-dashed border-red-300" title={`Waste: ${bar.waste}mm`}>
                                                {bar.waste > 0 && `Waste: ${bar.waste}mm`}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <ScissorsIcon className="h-16 w-16 mb-4 opacity-20"/>
                                <p>Enter your cutting list and click Optimize to see the layout.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CuttingListModal;
