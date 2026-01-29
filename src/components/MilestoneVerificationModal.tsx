import React, { useState, useRef } from 'react';
import { ProjectMilestone } from '../types';
import { 
    XMarkIcon, CameraIcon, SparklesIcon, CheckCircleIcon, 
    ShieldCheckIcon, BeakerIcon, ArrowPathIcon
} from '@heroicons/react/24/solid';
import { GoogleGenAI, Type, Part } from '@google/genai';
import { useToast } from '../hooks/useToast';
import { useData } from '../hooks/useDataContext';

const fileToBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [header, data] = result.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1];
            if (mimeType && data) resolve({ mimeType, data });
            else reject(new Error("Dossier intake failed."));
        };
        reader.onerror = error => reject(error);
    });
};

const MilestoneVerificationModal: React.FC<{ milestone: ProjectMilestone; onClose: () => void }> = ({ milestone, onClose }) => {
    const { showToast } = useToast();
    const { submitMilestoneProof } = useData();
    
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'analyzing' | 'success'>('idle');
    const [aiScore, setAiScore] = useState<number | null>(null);
    const [aiVerdict, setAiVerdict] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const executeNeuralVerification = async () => {
        if (!imageFile || !process.env.API_KEY) return;
        setStatus('analyzing');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const { mimeType, data } = await fileToBase64(imageFile);
            const imagePart: Part = { inlineData: { mimeType, data } };
            
            const prompt = `
                Perform a high-precision structural neural audit for construction milestone: "${milestone.title}".
                Required Site Status: "${milestone.description}".
                
                Evaluate visual evidence:
                1. Identify completion probability.
                2. Calculate confidence score (0-100).
                3. Write brief technical audit findings based on SANS standards.
                
                Return JSON.
            `;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.NUMBER },
                    verdict: { type: Type.STRING }
                },
                required: ['score', 'verdict']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: { parts: [imagePart, { text: prompt }] },
                config: { responseMimeType: 'application/json', responseSchema }
            });

            const result = JSON.parse(response.text || '{}');
            setAiScore(result.score);
            setAiVerdict(result.verdict);
            setStatus('success');
            
            if (result.score >= 80) {
                await submitMilestoneProof(milestone.id, previewUrl!, result.score);
                showToast("Visual Handshake Accepted", "success");
            } else {
                showToast("Audit Deviation Detected. High Risk.", "warning");
            }
        } catch (e) {
            showToast("Audit Link Distorted", "error");
            setStatus('idle');
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[130] p-4 backdrop-blur-2xl transition-all duration-700">
            <div className="bg-slate-900 border border-white/10 rounded-[4rem] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col relative group">
                <div className="absolute inset-0 bg-carbon opacity-5"></div>
                <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-500 z-50 transition-colors"><XMarkIcon className="h-6 w-6"/></button>
                
                <div className="p-12 text-white flex-grow relative z-10">
                    <div className="flex items-center gap-6 mb-12">
                        <div className="p-4 bg-blue-600/20 rounded-[2rem] border border-blue-500/30 text-blue-400 shadow-2xl shadow-blue-900/20 animate-pulse">
                            <ShieldCheckIcon className="h-10 w-10" />
                        </div>
                        <div>
                             <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.5em] font-mono mb-2">NEURAL AUDIT CORE v62.1</p>
                             <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Visual <span className="text-blue-600">Handshake</span></h2>
                        </div>
                    </div>

                    {!previewUrl ? (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="h-80 border-4 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center group cursor-pointer hover:border-blue-500/50 transition-all bg-slate-800/30"
                        >
                            <div className="bg-slate-800 p-8 rounded-full mb-6 group-hover:scale-110 transition-transform shadow-inner">
                                <CameraIcon className="h-12 w-12 text-slate-500 group-hover:text-blue-400 transition-colors"/>
                            </div>
                            <p className="font-black text-slate-400 uppercase tracking-[0.3em] text-xs">Awaiting Site Image Uplink</p>
                            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                        </div>
                    ) : (
                        <div className="relative h-80 rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl bg-black">
                            <img src={previewUrl} className={`w-full h-full object-cover transition-all duration-2000 ${status === 'analyzing' ? 'grayscale brightness-50 blur-[2px]' : 'opacity-70'}`} alt="Proof"/>
                            
                            {status === 'analyzing' && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                                    <div className="w-full h-1 bg-blue-500 absolute top-0 shadow-[0_0_40px_#3b82f6] animate-scan"></div>
                                    <SparklesIcon className="h-16 w-16 text-blue-400 animate-pulse"/>
                                    <p className="mt-8 font-black uppercase text-blue-400 tracking-[0.4em] text-xs bg-black/40 px-6 py-2 rounded-full backdrop-blur-xl border border-white/10">Scanning Structural Geometry...</p>
                                </div>
                            )}

                            {status === 'success' && aiScore !== null && (
                                <div className="absolute inset-0 bg-emerald-600/10 backdrop-blur-md flex items-center justify-center animate-fade-in">
                                    <div className="text-center">
                                        <div className="relative inline-block">
                                            <div className={`w-48 h-48 rounded-full border-8 ${aiScore >= 80 ? 'border-emerald-500' : 'border-red-500'} flex items-center justify-center bg-slate-900/80 shadow-[0_0_50px_rgba(16,185,129,0.3)]`}>
                                                <p className={`text-7xl font-black italic tracking-tighter ${aiScore >= 80 ? 'text-emerald-400' : 'text-red-400'}`}>{aiScore}%</p>
                                            </div>
                                            <CheckCircleIcon className={`h-12 w-12 absolute -top-2 -right-2 bg-slate-900 rounded-full border-4 ${aiScore >= 80 ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'}`} />
                                        </div>
                                        <p className={`mt-6 font-black uppercase tracking-[0.5em] text-[10px] ${aiScore >= 80 ? 'text-emerald-400' : 'text-red-400'}`}>Match Probability Score</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {previewUrl && status === 'idle' && (
                        <button 
                            onClick={executeNeuralVerification}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-3xl mt-12 uppercase tracking-[0.3em] text-xs shadow-2xl shadow-blue-900/40 transition-all transform active:scale-95 flex items-center justify-center gap-4 border border-white/10"
                        >
                            <BeakerIcon className="h-5 w-5"/>
                            Execute Neural Audit
                        </button>
                    )}

                    {status === 'success' && (
                        <div className="mt-12 animate-fade-in-up">
                            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 mb-8 shadow-inner text-sm leading-loose italic text-slate-300 font-serif">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 not-italic font-sans">Audit Finding Dossier</p>
                                "{aiVerdict}"
                            </div>
                            <button 
                                onClick={onClose}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-5 rounded-[2rem] uppercase text-[10px] tracking-[0.4em] transition-all transform active:scale-95 border border-white/5"
                            >
                                Close Audit Terminal
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes scan { 0% { top: 0%; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
            `}</style>
        </div>
    );
};

export default MilestoneVerificationModal;