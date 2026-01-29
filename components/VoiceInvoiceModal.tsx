import React, { useState, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { GoogleGenAI, Type } from '@google/genai';
import { XMarkIcon, MicrophoneIcon, StopCircleIcon, SparklesIcon, ExclamationTriangleIcon, BoltIcon } from '@heroicons/react/24/solid';

interface VoiceInvoiceModalProps {
    onClose: () => void;
    onInvoiceGenerated: (data: any) => void;
}

const VoiceInvoiceModal: React.FC<VoiceInvoiceModalProps> = ({ onClose, onInvoiceGenerated }) => {
    const { t } = useLocalization();
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

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
            console.error("Mic Error:", err);
            setError("Mission Aborted: Microphone Handshake Failed.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsProcessing(true);
            
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const result = reader.result as string;
                    const base64Audio = result.split(',')[1];
                    const mimeType = result.split(',')[0].split(':')[1].split(';')[0];
                    await processAudio(base64Audio, mimeType);
                };
                
                // Stop all tracks to release mic
                mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
            };
        }
    };

    const processAudio = async (base64Audio: string, mimeType: string) => {
        if (!process.env.API_KEY) {
            setError("Neural Core Offline: API Key Missing.");
            setIsProcessing(false);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `
                Analyze this construction operative's voice memo. 
                Extract structured invoice data for a South African contractor.
                The audio may contain English, Afrikaans, or Zulu. 
                
                Identify:
                1. Client Name (Entity being billed).
                2. Line items (Description, Quantity, Unit Price in ZAR).
                3. Any specific notes or payment terms mentioned.
                
                Return a JSON object.
            `;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    clientName: { type: Type.STRING },
                    items: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                description: { type: Type.STRING },
                                quantity: { type: Type.NUMBER },
                                unitPrice: { type: Type.NUMBER }
                            },
                            required: ['description', 'quantity', 'unitPrice']
                        }
                    },
                    notes: { type: Type.STRING },
                    dueDate: { type: Type.STRING, description: "ISO date if mentioned" }
                },
                required: ['clientName', 'items']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: {
                    parts: [
                        { inlineData: { mimeType: mimeType, data: base64Audio } },
                        { text: prompt }
                    ]
                },
                config: { responseMimeType: 'application/json', responseSchema }
            });

            if (response.text) {
                onInvoiceGenerated(JSON.parse(response.text));
                onClose();
            } else {
                throw new Error("Empty neural response");
            }

        } catch (err) {
            console.error("Voice Processing Error:", err);
            setError("Neural Link Failure: Could not decrypt audio payload.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[200] p-4 backdrop-blur-xl animate-fade-in">
            <div className="bg-slate-900 border border-white/10 rounded-[4rem] shadow-2xl max-w-md w-full relative overflow-hidden flex flex-col group">
                <div className="absolute inset-0 bg-carbon opacity-10 pointer-events-none"></div>
                
                <div className="bg-slate-800 p-8 flex justify-between items-center border-b border-white/5 relative z-10">
                    <div className="flex items-center gap-4 text-left">
                        <div className="p-3 bg-red-600 rounded-2xl shadow-xl shadow-red-900/40 animate-pulse">
                            <MicrophoneIcon className="h-6 w-6 text-white"/>
                        </div>
                        <div className="text-left">
                             <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] leading-none mb-2">Voice Intake Node</p>
                             <h2 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none">Dictate <span className="text-red-600">Dossier</span></h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-red-600 transition-all rounded-xl text-slate-500 hover:text-white"><XMarkIcon className="h-6 w-6"/></button>
                </div>

                <div className="p-10 flex flex-col items-center justify-center min-h-[400px] relative z-10">
                    {isProcessing ? (
                        <div className="text-center animate-fade-in">
                            <div className="relative w-32 h-32 mx-auto mb-10">
                                <div className="absolute inset-0 border-8 border-red-900/20 rounded-full"></div>
                                <div className="absolute inset-0 border-8 border-red-600 rounded-full border-t-transparent animate-spin"></div>
                                <SparklesIcon className="absolute inset-0 m-auto h-12 w-12 text-red-600 animate-pulse"/>
                            </div>
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">DE-CRYPTING...</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-4">Synchronizing Neural Buffer</p>
                        </div>
                    ) : error ? (
                        <div className="text-center animate-fade-in px-6">
                            <ExclamationTriangleIcon className="h-20 w-20 text-red-600 mx-auto mb-6 shadow-2xl rounded-full"/>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">GRID_ERROR</h3>
                            <p className="text-sm text-slate-400 font-medium italic mt-2 leading-relaxed">"{error}"</p>
                            <button 
                                onClick={() => setError(null)}
                                className="mt-10 bg-white text-slate-950 font-black py-4 px-10 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl transform active:scale-95 transition-all border-4 border-slate-900"
                            >
                                Restart Link
                            </button>
                        </div>
                    ) : (
                        <div className="text-center w-full animate-fade-in">
                             <div className="mb-10 text-slate-400 text-sm font-medium italic leading-relaxed max-w-xs mx-auto">
                                "State client name, materials used, and labor units. Code-switching (English/Afrikaans/Zulu) supported."
                             </div>
                             
                             <button
                                onMouseDown={startRecording}
                                onMouseUp={stopRecording}
                                onTouchStart={startRecording}
                                onTouchEnd={stopRecording}
                                className={`relative w-48 h-48 rounded-full border-[12px] transition-all duration-500 flex flex-col items-center justify-center mx-auto shadow-[0_0_80px_rgba(0,0,0,0.8)] ${isRecording ? 'bg-red-600 border-red-400 shadow-red-900/40 scale-110' : 'bg-slate-800 border-slate-950 hover:border-red-600 hover:scale-105 active:scale-95'}`}
                            >
                                <div className="absolute inset-[-4px] rounded-full border-2 border-dashed border-white/10 animate-[spin_10s_linear_infinite]"></div>
                                {isRecording ? (
                                    <StopCircleIcon className="h-16 w-16 text-white animate-pulse" />
                                ) : (
                                    <MicrophoneIcon className="h-16 w-16 text-white" />
                                )}
                            </button>

                            <p className={`mt-10 font-black uppercase tracking-[0.6em] text-[10px] ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-600'}`}>
                                {isRecording ? 'TRANSFORMING_ANALOG_WAVE' : 'HOLD TO INTAKE'}
                            </p>
                        </div>
                    )}
                </div>
                
                <div className="bg-slate-950 p-6 border-t border-white/5 text-center relative z-10">
                    <div className="flex items-center justify-center gap-2 opacity-30">
                        <BoltIcon className="h-3 w-3 text-blue-500"/>
                        <span className="text-[8px] font-black uppercase tracking-widest text-white">REDLINE_VOICE_SYNC_PROTOCOL v1.2</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceInvoiceModal;