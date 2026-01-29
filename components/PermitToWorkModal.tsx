
import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useData } from '../hooks/useDataContext';
import { Project, SafetyPermit } from '../types';
import { XMarkIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI, Type } from '@google/genai';
import { useAuth } from '../hooks/useAuth';

interface PermitToWorkModalProps {
    project: Project;
    onClose: () => void;
}

const PermitToWorkModal: React.FC<PermitToWorkModalProps> = ({ project, onClose }) => {
    const { t } = useLocalization();
    const { createSafetyPermit } = useData();
    const { user } = useAuth();
    
    const [type, setType] = useState<SafetyPermit['type']>('Hot Work');
    const [description, setDescription] = useState('');
    const [validFrom, setValidFrom] = useState('');
    const [validTo, setValidTo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedChecklist, setGeneratedChecklist] = useState<{item: string, checked: boolean}[] | null>(null);

    const handleGenerateChecklist = async () => {
        if (!process.env.API_KEY || !description) return;
        setIsLoading(true);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Generate a specific safety checklist for a Permit to Work.
                
                Permit Type: ${type}
                Task Description: ${description}
                Project: ${project.projectName}
                
                List 5-8 critical safety checks that must be verified before work starts.
                Return a JSON array of strings.
            `;
            
            const responseSchema = {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: 'application/json', responseSchema }
            });
            
            const items: string[] = JSON.parse(response.text);
            setGeneratedChecklist(items.map(item => ({ item, checked: false })));

        } catch (e) {
            console.error(e);
            alert("Failed to generate checklist.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!generatedChecklist || !validFrom || !validTo) {
            alert("Please complete all fields and generate the checklist.");
            return;
        }

        await createSafetyPermit({
            projectId: project.id,
            type,
            description,
            validFrom: new Date(validFrom),
            validTo: new Date(validTo),
            checklist: generatedChecklist,
            authorizedBy: user?.name || 'Unknown'
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[80] p-4 animate-fade-in-scale">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center bg-red-50 rounded-t-xl">
                    <h2 className="text-xl font-bold text-red-700 flex items-center gap-2">
                        <ShieldCheckIcon className="h-6 w-6"/> Issue Permit to Work
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XMarkIcon className="h-6 w-6"/></button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Permit Type</label>
                        <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-2 border rounded-md mt-1 bg-white">
                            <option value="Hot Work">Hot Work (Welding, Cutting)</option>
                            <option value="Height">Working at Height</option>
                            <option value="Confined Space">Confined Space</option>
                            <option value="Electrical">Live Electrical Work</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium">Task Description</label>
                        <textarea 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            rows={3} 
                            className="w-full p-2 border rounded-md mt-1" 
                            placeholder="Describe the work to be done..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Valid From</label>
                            <input type="datetime-local" value={validFrom} onChange={e => setValidFrom(e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium">Valid To</label>
                            <input type="datetime-local" value={validTo} onChange={e => setValidTo(e.target.value)} className="w-full p-2 border rounded-md mt-1" />
                        </div>
                    </div>

                    {!generatedChecklist ? (
                         <button 
                            onClick={handleGenerateChecklist} 
                            disabled={isLoading || !description}
                            className="w-full bg-red-100 text-red-700 font-bold py-3 rounded-lg hover:bg-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Generating...' : <><SparklesIcon className="h-5 w-5"/> Generate Safety Checklist</>}
                        </button>
                    ) : (
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <h4 className="font-bold text-sm mb-2">Required Precautions</h4>
                            <div className="space-y-2">
                                {generatedChecklist.map((item, idx) => (
                                    <label key={idx} className="flex items-start gap-2 text-sm">
                                        <input 
                                            type="checkbox" 
                                            checked={item.checked} 
                                            onChange={e => {
                                                const newList = [...generatedChecklist];
                                                newList[idx].checked = e.target.checked;
                                                setGeneratedChecklist(newList);
                                            }}
                                            className="mt-1 rounded text-red-600 focus:ring-red-500"
                                        />
                                        <span className={item.checked ? 'line-through text-gray-400' : 'text-gray-700'}>{item.item}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg">Cancel</button>
                    <button 
                        onClick={handleSave} 
                        disabled={!generatedChecklist} 
                        className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                        Authorize Permit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PermitToWorkModal;
