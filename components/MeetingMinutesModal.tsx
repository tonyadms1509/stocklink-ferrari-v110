
import React, { useState, useRef, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useData } from '../hooks/useDataContext';
import { GoogleGenAI, Type } from '@google/genai';
import { 
    X, Mic, Square, ClipboardList, 
    Sparkles, UserPlus, CheckCircle, 
    RefreshCcw, Play, Activity
} from 'lucide-react';
import { Project } from '../types';
import { useToast } from '../hooks/useToast';

interface MeetingMinutesModalProps {
    project: Project;
    onClose: () => void;
}

const MeetingMinutesModal: React.FC<MeetingMinutesModalProps> = ({ project, onClose }) => {
    const { showToast } = useToast();
    const { createProjectLog, createProjectTask } = useData();
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [minutes, setMinutes] = useState<any | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStream(audioStream);
            const mediaRecorder = new MediaRecorder(audioStream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.start();
            setIsRecording(true);
            showToast("Cockpit Voice Recorder: ACTIVE", "info");
        } catch (err) {
            showToast("Microphone Handshake Failed", "error");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsProcessing(true);
            
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = async () => {
                    const base64Audio = (reader.result as string).split(',')[1];
                    await processAudio(base64Audio);
                };
                if (stream) stream.getTracks().forEach(t => t.stop());
            };
        }
    };

    const processAudio = async (base64Audio: string) => {
        if (!process.env.API_KEY) return;
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Transcribe this construction site meeting. 
                Project: ${project.projectName}.
                1. Identify Attendees.
                2. Summarize Decisions.
                3. Extract "Action Items" (Task, Assignee, Priority).
                Return JSON.
            `;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    attendees: { type: Type.ARRAY, items: { type: Type.STRING } },
                    summary: { type: Type.STRING },
                    actionItems: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                task: { type: Type.STRING },
                                assignee: { type: Type.STRING },
                                priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
                            },
                            required: ['task', 'assignee']
                        }
                    }
                },
                required: ['attendees', 'summary', 'actionItems']
            };

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: [{ inlineData: { mimeType: 'audio/webm', data: base64Audio } }, { text: prompt }] },
                config: { responseMimeType: 'application/json', responseSchema }
            });

            setMinutes(JSON.parse(response.text || '{}'));
            showToast("Minutes Decrypted Successfully", "success");
        } catch (e) {
            showToast("Neural Processing Stall", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCommit = async () => {
        if (!minutes) return;
        await createProjectLog({
            projectId: project.id,
            type: 'Meeting Minutes',
            content: `Summary: ${minutes.summary}\nAttendees: ${minutes.attendees.join(', ')}`
        });
        for (const item of minutes.actionItems) {
            await createProjectTask({
                projectId: project.id,
                description: `[ACTION] ${item.task}`,
                status: 'Pending',
                priority: item.priority,
                assignee: item.assignee
            });
        }
        onClose();
        showToast("Directives Broadcast to Team", "success");
    };

    return (
        <div className="fixed inset-0 bg-slate-950/95 z-[200] flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
            <div className="bg-slate-900 border border-white/10 rounded-[4rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col relative">
                <div className="absolute inset-0 bg-carbon opacity-10"></div>
                <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white z-50 transition-colors"><X size={24}/></button>
                
                <div className="p-12 relative z-10 text-left">
                    <div className="flex items-center gap-4 mb-12">
                         <div className="p-4 bg-red-600 rounded-[1.5rem] shadow-2xl shadow-red-900/30"><Mic size={24} className="text-white"/></div>
                         <div>
                             <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.5em] font-mono">Audio Intelligence Node</p>
                             <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Project <span className="text-red-600 text-glow-red">Dictation</span></h2>
                         </div>
                    </div>

                    {!minutes && !isProcessing && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${isRecording ? 'bg-red-600/20 border-red-500 shadow-[0_0_50px_rgba(220,0,0,0.3)] animate-pulse' : 'bg-white/5 border-white/10'}`}>
                                <button onClick={isRecording ? stopRecording : startRecording} className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-600' : 'bg-slate-800'}`}>
                                    {isRecording ? <Square size={32} className="text-white fill-current"/> : <Play size={32} className="text-white ml-2 fill-current"/>}
                                </button>
                            </div>
                            <p className={`mt-8 font-black uppercase tracking-widest text-xs ${isRecording ? 'text-red-500' : 'text-slate-500'}`}>
                                {isRecording ? "Recording Neural Feed..." : "Ready for Intake"}
                            </p>
                            {isRecording && <div className="mt-4 flex gap-1"><div className="w-1 h-4 bg-red-500 animate-bounce"></div><div className="w-1 h-4 bg-red-500 animate-bounce delay-100"></div><div className="w-1 h-4 bg-red-500 animate-bounce delay-200"></div></div>}
                        </div>
                    )}

                    {isProcessing && (
                        <div className="py-20 text-center flex flex-col items-center">
                            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                            <p className="font-black text-slate-500 uppercase tracking-[0.4em] text-xs">Decrypting Site Dialect...</p>
                        </div>
                    )}

                    {minutes && (
                        <div className="space-y-8 animate-fade-in-up">
                            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
                                <h4 className="text-[10px] font-black uppercase text-blue-500 mb-4 tracking-[0.4em]">Protocol Summary</h4>
                                <p className="text-lg text-slate-300 italic font-serif leading-relaxed">"{minutes.summary}"</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                     <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><UserPlus size={14} className="text-blue-500"/> Present Nodes</h4>
                                     <div className="flex flex-wrap gap-2">
                                         {minutes.attendees.map((a: string, i: number) => <span key={i} className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold text-slate-400">{a}</span>)}
                                     </div>
                                </div>
                                <div className="space-y-4">
                                     <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><ClipboardList size={14} className="text-red-500"/> Directives</h4>
                                     <div className="space-y-2">
                                         {minutes.actionItems.map((item: any, i: number) => (
                                             <div key={i} className="text-[10px] font-bold text-slate-300 bg-black/40 p-2 rounded-lg border border-white/5 flex justify-between">
                                                 <span className="truncate pr-2">{item.task}</span>
                                                 <span className="text-blue-500">@{item.assignee}</span>
                                             </div>
                                         ))}
                                     </div>
                                </div>
                            </div>

                            <button onClick={handleCommit} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-[2rem] shadow-2xl transition-all transform active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-4">
                                <CheckCircle size={20}/>
                                Commit Minutes to Ledger
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MeetingMinutesModal;
