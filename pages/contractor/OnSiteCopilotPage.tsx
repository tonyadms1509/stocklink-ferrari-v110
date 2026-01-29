
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, FunctionDeclaration, Type } from '@google/genai';
import { useData } from '../../hooks/useDataContext.tsx';
import { useLocalization } from '../../hooks/useLocalization';
import { XMarkIcon, SparklesIcon, MicrophoneIcon, CameraIcon, StopCircleIcon, CheckCircleIcon, ExclamationTriangleIcon, SpeakerWaveIcon, ArrowPathIcon, BoltIcon } from '@heroicons/react/24/solid';
import { ExpenseCategory } from '../../types.ts';

// --- Tactical Utility Functions ---
const blobToBase64 = (blob: globalThis.Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
    });
};

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const FRAME_RATE = 1; 
const JPEG_QUALITY = 0.6;

const OnSiteCopilotPage: React.FC<{ onExit: () => void; onSearch: (term: string) => void }> = ({ onExit, onSearch }) => {
    const { t } = useLocalization();
    const { projects, addExpense } = useData();
    
    const [assistantState, setAssistantState] = useState<'idle' | 'listening' | 'speaking' | 'processing' | 'error'>('idle');
    const [transcript, setTranscript] = useState<{ speaker: 'user' | 'model', text: string }[]>([]);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [activeAlert, setActiveAlert] = useState<{ title: string, content: string, type: 'info' | 'success' | 'warning' } | null>(null);
    
    const audioRefs = useRef<{ 
        inputCtx?: AudioContext; 
        outputCtx?: AudioContext; 
        stream?: MediaStream; 
        processor?: ScriptProcessorNode;
        source?: MediaStreamAudioSourceNode;
        sources: Set<AudioBufferSourceNode>;
        session?: any;
    }>({ sources: new Set() }).current;

    const nextStartTimeRef = useRef(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        let isEffectActive = true;
        let sessionPromise: Promise<any> | null = null;
        const abortController = new AbortController();

        const initializeNeuralLink = async () => {
            if (!process.env.API_KEY) {
                if (window.aistudio) await window.aistudio.openSelectKey();
                else return;
            }

            if (!isEffectActive) return;
            setAssistantState('listening');

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const tools = [{
                functionDeclarations: [
                    { name: 'findProduct', description: "Search the national grid for a specific product.", parameters: { type: Type.OBJECT, properties: { productName: { type: Type.STRING } }, required: ['productName'] } },
                    { name: 'logSiteExpense', description: "Log a project expense to the ledger.", parameters: { type: Type.OBJECT, properties: { amount: { type: Type.NUMBER }, description: { type: Type.STRING } }, required: ['amount', 'description'] } }
                ]
            }];

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                if (!isEffectActive) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }
                audioRefs.stream = stream;
                audioRefs.inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                audioRefs.outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

                sessionPromise = ai.live.connect({
                    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                    config: {
                        responseModalities: [Modality.AUDIO],
                        tools,
                        systemInstruction: `You are Leo, the high-fidelity AI On-Site Copilot for StockLink Ferrari. 
                        You are technical, professional, and helpful. You speak to South African contractors.
                        Available Projects: ${projects.map(p => p.projectName).join(', ')}.`
                    },
                    requestOptions: { signal: abortController.signal },
                    callbacks: {
                        onopen: () => {
                            if (!isEffectActive || !audioRefs.inputCtx) return;
                            const source = audioRefs.inputCtx.createMediaStreamSource(stream);
                            const processor = audioRefs.inputCtx.createScriptProcessor(4096, 1, 1);
                            processor.onaudioprocess = (e) => {
                                if (!isEffectActive) return;
                                const pcm = e.inputBuffer.getChannelData(0);
                                const pcmBlob = createBlob(pcm);
                                sessionPromise?.then(session => {
                                    if (session && !abortController.signal.aborted) {
                                        session.sendRealtimeInput({ media: pcmBlob });
                                    }
                                }).catch(() => {});
                            };
                            source.connect(processor);
                            processor.connect(audioRefs.inputCtx.destination);
                            audioRefs.processor = processor;
                            audioRefs.source = source;
                        },
                        onmessage: async (msg: LiveServerMessage) => {
                            if (!isEffectActive) return;
                            
                            const turnText = msg.serverContent?.modelTurn?.parts[0]?.text;
                            if (turnText) setTranscript(prev => [...prev, { speaker: 'model', text: turnText }]);

                            if (msg.toolCall?.functionCalls) {
                                for (const fc of msg.toolCall.functionCalls) {
                                    const args = fc.args as any;
                                    if (fc.name === 'findProduct') {
                                        onSearch(args.productName);
                                        setActiveAlert({ title: 'Grid Search', content: `Locating ${args.productName}...`, type: 'info' });
                                    } else if (fc.name === 'logSiteExpense') {
                                        if(projects[0]) await addExpense({ projectId: projects[0].id, amount: args.amount, description: args.description, category: ExpenseCategory.Other, date: new Date().toISOString() });
                                        setActiveAlert({ title: 'Ledger Updated', content: `R${args.amount} debited`, type: 'success' });
                                    }
                                    sessionPromise?.then(s => {
                                        if (s && !abortController.signal.aborted) {
                                            s.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { status: 'ok' } } });
                                        }
                                    }).catch(() => {});
                                }
                            }

                            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                            if (audioData && audioRefs.outputCtx) {
                                setAssistantState('speaking');
                                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioRefs.outputCtx.currentTime);
                                const buffer = await decodeAudioData(decode(audioData), audioRefs.outputCtx, 24000, 1);
                                const source = audioRefs.outputCtx.createBufferSource();
                                source.buffer = buffer;
                                source.connect(audioRefs.outputCtx.destination);
                                source.onended = () => {
                                    audioRefs.sources.delete(source);
                                    if (audioRefs.sources.size === 0) setAssistantState('listening');
                                };
                                source.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += buffer.duration;
                                audioRefs.sources.add(source);
                            }
                        },
                        onerror: (e) => {
                            if (!isEffectActive || abortController.signal.aborted) return;
                            console.error("Neural Link Error", e);
                            setAssistantState('error');
                        },
                        onclose: () => {
                            if (!isEffectActive) return;
                            console.debug("Neural Link Closed");
                        }
                    }
                });

                sessionPromise.then(s => {
                    audioRefs.session = s;
                }).catch(() => {});

            } catch (e) {
                if (isEffectActive && !abortController.signal.aborted) setAssistantState('error');
            }
        };

        initializeNeuralLink();

        return () => {
            isEffectActive = false;
            abortController.abort("Component Cleanup");
            if (audioRefs.session) {
                audioRefs.session.close();
            } else if (sessionPromise) {
                sessionPromise.then(s => s.close()).catch(() => {});
            }
            if (audioRefs.stream) audioRefs.stream.getTracks().forEach(t => t.stop());
            if (audioRefs.processor) audioRefs.processor.disconnect();
            if (audioRefs.source) audioRefs.source.disconnect();
            audioRefs.sources.forEach(s => s.stop());
            audioRefs.sources.clear();
            if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
        };
    }, []);

    const toggleCamera = async () => {
        if (!isCameraOn) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                if (videoRef.current) videoRef.current.srcObject = stream;
                setIsCameraOn(true);
                frameIntervalRef.current = window.setInterval(() => {
                    if (videoRef.current && canvasRef.current && audioRefs.session) {
                        const ctx = canvasRef.current.getContext('2d');
                        canvasRef.current.width = videoRef.current.videoWidth;
                        canvasRef.current.height = videoRef.current.videoHeight;
                        ctx?.drawImage(videoRef.current, 0, 0);
                        canvasRef.current.toBlob(async blob => {
                            if (blob && audioRefs.session) {
                                const base64 = await blobToBase64(blob);
                                audioRefs.session.sendRealtimeInput({ media: { data: base64, mimeType: 'image/jpeg' } });
                            }
                        }, 'image/jpeg', JPEG_QUALITY);
                    }
                }, 1000 / FRAME_RATE);
            } catch (e) { console.error(e); }
        } else {
            const stream = videoRef.current?.srcObject as MediaStream;
            stream?.getTracks().forEach(t => t.stop());
            setIsCameraOn(false);
            if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950 z-[200] flex flex-col font-sans text-white overflow-hidden">
            {isCameraOn && (
                <div className="absolute inset-0 z-0">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-60"></video>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    <div className="absolute inset-0 pointer-events-none border-[40px] border-black/20">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-blue-500/20 rounded-3xl">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
                            <div className="w-full h-0.5 bg-blue-400/30 absolute top-1/2 animate-pulse"></div>
                         </div>
                    </div>
                </div>
            )}

            <div className="relative z-10 p-6 flex justify-between items-center bg-slate-900/40 backdrop-blur-2xl border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-2xl animate-pulse">
                        <SparklesIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                        <h2 className="text-xl font-black italic uppercase tracking-tighter">LEO <span className="text-blue-500">COPILOT</span></h2>
                        <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${assistantState === 'error' ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'} shadow-lg`}></div>
                             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{assistantState}</span>
                        </div>
                    </div>
                </div>
                <button onClick={onExit} className="p-3 bg-white/5 hover:bg-red-600 transition-all rounded-2xl border border-white/10 group">
                    <XMarkIcon className="h-6 w-6 text-slate-400 group-hover:text-white" />
                </button>
            </div>

            <div className="relative z-10 flex-grow flex flex-col items-center justify-end p-8 gap-8">
                {activeAlert && (
                    <div className={`p-6 rounded-[2.5rem] border backdrop-blur-2xl shadow-2xl animate-fade-in-up w-full max-w-sm ${activeAlert.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100' : 'bg-blue-600/10 border-blue-500/30 text-blue-100'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-black uppercase tracking-widest text-xs">{activeAlert.title}</h4>
                            <button onClick={() => setActiveAlert(null)}><XMarkIcon className="h-4 w-4 opacity-50"/></button>
                        </div>
                        <p className="font-bold text-lg italic tracking-tight leading-tight text-left">"{activeAlert.content}"</p>
                    </div>
                )}

                <div className="relative">
                    <div className={`w-40 h-40 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${assistantState === 'listening' ? 'bg-blue-600/20 border-blue-400 shadow-[0_0_80px_rgba(59,130,246,0.5)] scale-110' : assistantState === 'speaking' ? 'bg-purple-600/20 border-purple-400 shadow-[0_0_80px_rgba(168,85,247,0.5)]' : 'bg-white/5 border-white/10'}`}>
                        {assistantState === 'speaking' ? (
                            <SpeakerWaveIcon className="h-16 w-16 text-purple-400 animate-pulse" />
                        ) : (
                            <MicrophoneIcon className={`h-16 w-16 transition-colors ${assistantState === 'listening' ? 'text-blue-400' : 'text-slate-700'}`} />
                        )}
                        <div className={`absolute inset-[-15px] rounded-full border border-dashed border-white/10 animate-[spin_10s_linear_infinite] ${assistantState === 'listening' ? 'opacity-100' : 'opacity-0'}`}></div>
                    </div>
                </div>

                <div className="w-full max-w-2xl text-center min-h-[3rem]">
                     <p className="text-2xl font-medium text-slate-100 italic tracking-tight drop-shadow-lg leading-relaxed px-4">
                        {transcript.length > 0 ? `"${transcript[transcript.length-1].text}"` : 'Handshake Synchronized. Awaiting Command.'}
                     </p>
                </div>
            </div>

            <div className="relative z-10 p-10 pb-16 flex justify-center gap-10 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                <button 
                    onClick={toggleCamera}
                    className={`flex flex-col items-center gap-3 transition-all transform active:scale-90 ${isCameraOn ? 'text-blue-400' : 'text-slate-500 hover:text-white'}`}
                >
                    <div className={`p-6 rounded-3xl border-2 transition-all ${isCameraOn ? 'bg-blue-600/20 border-blue-500 shadow-2xl' : 'bg-white/5 border-white/10'}`}>
                        <CameraIcon className="h-8 w-8" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Neural Vision</span>
                </button>

                <button 
                    onClick={() => setTranscript([])}
                    className="flex flex-col items-center gap-3 text-slate-500 hover:text-white transition-all transform active:scale-90"
                >
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 transition-all">
                        <ArrowPathIcon className="h-8 w-8" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Reset History</span>
                </button>
            </div>
            
            <div className="fixed bottom-10 left-10 pointer-events-none opacity-5 -z-10 rotate-90">
                <span className="text-[140px] font-black tracking-tighter text-white uppercase italic">TACTICAL HUD</span>
            </div>
        </div>
    );
};

export default OnSiteCopilotPage;
