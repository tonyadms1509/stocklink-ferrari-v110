
import React, { useState, useRef, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useData } from '../hooks/useDataContext';
import { ProjectTask, ProjectMaterial, ProjectLog, ProjectMaterialStatus, TaskStatus } from '../types';
import { MicrophoneIcon, StopCircleIcon, XMarkIcon, CheckCircleIcon, ClipboardDocumentCheckIcon, CubeIcon, ExclamationTriangleIcon, LanguageIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI, Type } from '@google/genai';

interface VoiceMemoModalProps {
    projectId: string;
    onClose: () => void;
    onApply: () => void;
}

interface ExtractedActions {
    materials: { name: string; quantity: number }[];
    tasks: { description: string; assignee?: string; dueDate?: string }[];
    issues: { description: string }[];
    transcript: string;
}

const VoiceMemoModal: React.FC<VoiceMemoModalProps> = ({ projectId, onClose, onApply }) => {
    const { t } = useLocalization();
    const { createProjectTask, addMaterialToProject, createProjectLog, products } = useData();
    
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [extractedData, setExtractedData] = useState<ExtractedActions | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<globalThis.Blob[]>([]);

    // Start Recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setError(null);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Could not access microphone.");
        }
    };

    // Stop Recording & Process
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            
            mediaRecorderRef.current.onstop = async () => {
                setIsProcessing(true);
                const audioBlob = new globalThis.Blob(audioChunksRef.current, { type: 'audio/wav' });
                // Convert Blob to Base64
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const result = reader.result as string;
                    const base64Audio = (reader.result as string).split(',')[1];
                    await processAudio(base64Audio);
                };
            };
            
            // Stop all tracks to release mic
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const processAudio = async (base64Audio: string) => {
        if (!process.env.API_KEY) {
            setError("API Key not configured.");
            setIsProcessing(false);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `
                You are a construction site assistant for South Africa. 
                The audio may contain a mix of English, Afrikaans, or Zulu/Xhosa (code-switching).
                
                1. **Transcribe** the audio accurately.
                2. **Translate** any non-English parts into English for the structured data extraction.
                3. **Extract** actionable items:
                    - **Materials**: Items to add to order (name, quantity).
                    - **Tasks**: To-do items (description, assignee, due date).
                    - **Issues**: Risks or problems to log.
                
                Return JSON.
            `;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    transcript: { type: Type.STRING },
                    materials: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                quantity: { type: Type.NUMBER }
                            },
                            required: ['name', 'quantity']
                        }
                    },
                    tasks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                description: { type: Type.STRING },
                                assignee: { type: Type.STRING },
                                dueDate: { type: Type.STRING }
                            },
                            required: ['description']
                        }
                    },
                    issues: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                description: { type: Type.STRING }
                            },
                            required: ['description']
                        }
                    }
                },
                required: ['transcript', 'materials', 'tasks', 'issues']
            };

            // Fix: Updated model name to gemini-3-flash-preview
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: {
                    parts: [
                        { inlineData: { mimeType: 'audio/wav', data: base64Audio } },
                        { text: prompt }
                    ]
                },
                config: { responseMimeType: 'application/json', responseSchema }
            });

            // Fix: Ensure correct property access for text
            setExtractedData(JSON.parse(response.text || '{}'));

        } catch (err) {
            console.error("Voice processing error:", err);
            setError("Failed to process audio. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleApply = async () => {
        if (!extractedData) return;
        
        // 1. Add Materials
        for (const item of extractedData.materials) {
            // Basic matching logic (in real app, use search or exact ID if known)
            const product = products.find(p => p.name.toLowerCase().includes(item.name.toLowerCase())) || {
                 id: `temp-${Date.now()}`,
                 name: item.name,
                 price: 0,
                 brand: 'Generic',
                 category: 'Materials',
                 description: 'Added via voice',
                 stock: 0,
                 supplierId: '',
                 imageUrl: '',
                 deliveryOptions: []
            };
            
            if (product) {
                 await addMaterialToProject(projectId, product, item.quantity);
            }
        }

        // 2. Create Tasks
        for (const task of extractedData.tasks) {
            await createProjectTask({
                projectId,
                description: task.description,
                assignee: task.assignee,
                dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            });
        }

        // 3. Log Issues
        for (const issue of extractedData.issues) {
            await createProjectLog({
                projectId,
                type: 'Issue',
                content: issue.description,
            });
        }

        onApply();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-[80] p-4 animate-fade-in-scale">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full relative overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                                <MicrophoneIcon className="h-6 w-6"/>
                                {t('voiceNoteTitle')}
                            </h2>
                            <span className="text-xs text-green-600 font-bold flex items-center gap-1 mt-1 bg-green-50 px-2 py-0.5 rounded w-fit">
                                <LanguageIcon className="h-3 w-3"/> Multi-lingual Support Active
                            </span>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6"/></button>
                    </div>

                    {!extractedData && !isProcessing && (
                        <div className="flex flex-col items-center py-8">
                             <button
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-primary hover:bg-blue-700'}`}
                            >
                                {isRecording ? <StopCircleIcon className="h-12 w-12 text-white"/> : <MicrophoneIcon className="h-12 w-12 text-white"/>}
                            </button>
                            <p className="mt-4 text-gray-600 font-medium">{isRecording ? t('voiceNoteRecording') : "Tap to Record"}</p>
                        </div>
                    )}

                    {isProcessing && (
                        <div className="text-center py-12">
                             <svg className="animate-spin h-12 w-12 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-gray-600">{t('voiceNoteProcessing')}</p>
                        </div>
                    )}

                    {extractedData && (
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                            <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 italic border border-gray-200">
                                "{extractedData.transcript}"
                            </div>
                            
                            {extractedData.materials.length > 0 && (
                                <div>
                                    <h4 className="font-bold flex items-center gap-2 text-blue-700 mb-2"><CubeIcon className="h-4 w-4"/> Materials</h4>
                                    <ul className="space-y-1">
                                        {extractedData.materials.map((m, i) => (
                                            <li key={i} className="text-sm bg-blue-50 p-2 rounded border border-blue-100 flex justify-between">
                                                <span>{m.name}</span>
                                                <span className="font-bold">x{m.quantity}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                             {extractedData.tasks.length > 0 && (
                                <div>
                                    <h4 className="font-bold flex items-center gap-2 text-green-700 mb-2"><ClipboardDocumentCheckIcon className="h-4 w-4"/> Tasks</h4>
                                    <ul className="space-y-1">
                                        {extractedData.tasks.map((t, i) => (
                                            <li key={i} className="text-sm bg-green-50 p-2 rounded border border-green-100">
                                                <p className="font-medium">{t.description}</p>
                                                <p className="text-xs text-gray-500">
                                                    {t.assignee && `Assign: ${t.assignee}`} {t.dueDate && `| Due: ${t.dueDate}`}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                             {extractedData.issues.length > 0 && (
                                <div>
                                    <h4 className="font-bold flex items-center gap-2 text-red-700 mb-2"><ExclamationTriangleIcon className="h-4 w-4"/> Issues</h4>
                                    <ul className="space-y-1">
                                        {extractedData.issues.map((issue, i) => (
                                            <li key={i} className="text-sm bg-red-50 p-2 rounded border border-red-100">
                                                {issue.description}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {extractedData.materials.length === 0 && extractedData.tasks.length === 0 && extractedData.issues.length === 0 && (
                                <p className="text-center text-gray-500">{t('voiceNoteNoActions')}</p>
                            )}
                        </div>
                    )}
                    
                    {error && <p className="text-red-500 text-center mt-4 text-sm">{error}</p>}

                </div>
                
                {extractedData && (
                    <div className="p-4 bg-gray-100 flex gap-3">
                         <button onClick={() => { setExtractedData(null); setIsRecording(false); }} className="flex-1 bg-white text-gray-700 font-bold py-3 rounded-lg border hover:bg-gray-100 transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleApply} className="flex-1 bg-secondary text-white font-bold py-3 rounded-lg hover:bg-emerald-600">
                            {t('voiceNoteApply')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceMemoModal;
