import React, { useState, useRef } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { useData } from '../../hooks/useDataContext';
import { GoogleGenAI, Part, Type } from '@google/genai';
import { 
    Upload, Sparkles, ArrowLeft, 
    X, Briefcase, FileText, CircleCheck,
    Map, Box, FlaskConical, BarChart, Layers, 
    ShieldAlert, Activity
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import CreateProjectModal from '../../components/CreateProjectModal';
import { Project, ProjectMaterialStatus } from '../../types';

interface RoomAnalysis {
    name: string;
    floorArea: number;
    materials: {
        name: string;
        quantity: number;
        unit: string;
    }[];
}

const fileToBase64 = (file: File): Promise<{ mimeType: string; data: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const [header, data] = result.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1];
            if (mimeType && data) resolve({ mimeType, data });
            else reject(new Error("Could not parse file data."));
        };
        reader.onerror = error => reject(error);
    });
};

const BlueprintAnalyzerPage: React.FC<{ onBack?: () => void, onNavigate: (tab: any) => void }> = ({ onBack, onNavigate }) => {
    const { showToast } = useToast();
    const { addProjectMaterialsInDb } = useData();

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<RoomAnalysis[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResults(null);
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!imageFile || !process.env.API_KEY) return;
        setIsAnalyzing(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const { mimeType, data: base64Data } = await fileToBase64(imageFile);
            const filePart: Part = { inlineData: { mimeType, data: base64Data } };
            
            const prompt = `Perform a high-precision structural audit of this floor plan for a building project in South Africa. Identify distinct zones/rooms, estimate floor area (m2) based on visual scale cues, and list required finishing materials (Tiles, Paint, Skirting). Return JSON.`;

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    rooms: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                floorArea: { type: Type.NUMBER },
                                materials: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            name: { type: Type.STRING },
                                            quantity: { type: Type.NUMBER },
                                            unit: { type: Type.STRING }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: { parts: [filePart, { text: prompt }] },
                config: { responseMimeType: 'application/json', responseSchema }
            });

            setResults(JSON.parse(response.text || '{}').rooms || []);
            showToast("Schematic Decrypted Successfully", "success");
        } catch (err) {
            setError("Neural scan failure. Re-capture blueprint with higher clarity.");
            showToast("Uplink Error", "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleProjectCreated = async (newProject: Project) => {
        if (!results) return;
        const materialsToAdd = results.flatMap(room => 
            room.materials.map(m => ({
                projectId: newProject.id,
                productName: `${m.name} (${room.name})`,
                quantity: m.quantity,
                pricePerUnit: 0, 
                status: ProjectMaterialStatus.ToOrder
            }))
        );
        await addProjectMaterialsInDb(materialsToAdd);
        showToast("Project Initialized with Neural BOM", 'success');
        onNavigate('projects');
    };

    return (
        <div className="pb-12 h-full flex flex-col font-sans text-slate-200">
            <div className="flex-shrink-0 flex justify-between items-center mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-slate-900 border border-white/10 p-2 rounded-lg text-red-600 shadow-xl">
                            <Layers className="h-6 w-6" />
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                            Neural <span className="text-red-600">Audit</span>
                        </h2>
                    </div>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Digital Twin Telemetry v80.0</p>
                </div>
                {onBack && (
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/5 transition-colors text-slate-500 hover:text-white">
                        <ArrowLeft className="h-6 w-6"/>
                    </button>
                )}
            </div>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden min-h-[600px]">
                <div className="lg:col-span-7 bg-slate-900 p-6 rounded-[3rem] shadow-2xl border border-white/5 flex flex-col h-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-carbon opacity-10"></div>
                    {!imageFile ? (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-grow border-4 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-red-600/30 transition-all group z-10"
                        >
                            <div className="bg-slate-800 p-6 rounded-[2rem] mb-6 group-hover:bg-red-600 transition-all shadow-xl">
                                <Upload className="h-12 w-12 text-slate-400 group-hover:text-white"/>
                            </div>
                            <p className="text-xl font-black text-white uppercase italic tracking-tighter">Initialize Visual Feed</p>
                            <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">JPG, PNG or Site PDF Required</p>
                            <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
                        </div>
                    ) : (
                        <div className="relative flex-grow bg-black rounded-[2.5rem] overflow-hidden flex items-center justify-center border border-white/10 shadow-inner z-10">
                            <img src={previewUrl!} className={`max-w-full max-h-full object-contain ${isAnalyzing ? 'opacity-40 grayscale blur-[2px]' : 'opacity-80'}`} alt="Blueprint" />
                            
                            {isAnalyzing && (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
                                     <div className="w-full h-1 bg-red-600 absolute top-0 shadow-[0_0_20px_#DC0000] animate-scan"></div>
                                     <Sparkles className="h-16 w-16 text-red-600 animate-pulse"/>
                                     <p className="mt-8 font-black uppercase text-red-600 tracking-[0.4em] text-xs">Decrypting Structural Geometry...</p>
                                </div>
                            )}
                            
                            {!isAnalyzing && (
                                <button onClick={() => { setPreviewUrl(null); setImageFile(null); setResults(null); }} className="absolute bottom-6 right-6 p-3 bg-white text-slate-950 rounded-2xl shadow-2xl hover:text-red-600 transition-colors"><X className="h-6 w-6"/></button>
                            )}
                        </div>
                    )}
                    
                    {imageFile && !results && (
                        <button 
                            onClick={handleAnalyze} 
                            disabled={isAnalyzing}
                            className="mt-6 w-full bg-red-600 text-white font-black py-5 rounded-3xl hover:bg-red-500 transition-all transform active:scale-95 disabled:opacity-50 shadow-2xl flex items-center justify-center gap-3 uppercase tracking-widest text-xs z-10 border border-white/10"
                        >
                            <Sparkles className="h-5 w-5 text-yellow-400"/>
                            Execute Neural Audit
                        </button>
                    )}
                </div>

                <div className="lg:col-span-5 bg-slate-900 rounded-[3rem] p-10 border border-white/5 shadow-2xl flex flex-col overflow-hidden relative group">
                    <div className="absolute inset-0 bg-carbon opacity-10"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-600/5 to-transparent opacity-50"></div>
                    
                    <div className="flex justify-between items-center mb-10 shrink-0 relative z-10">
                         <h3 className="text-xl font-black italic uppercase tracking-tighter text-white flex items-center gap-4">
                             <div className="w-1.5 h-8 bg-red-600 rounded-full"></div>
                             Audit <span className="text-red-600">Log</span>
                         </h3>
                         {results && (
                            <button onClick={() => setShowCreateProjectModal(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-2 rounded-xl text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95">
                                Deploy Project
                            </button>
                         )}
                    </div>
                    
                    <div className="flex-grow overflow-y-auto space-y-6 custom-scrollbar pr-2 relative z-10">
                        {results ? (
                            results.map((room, index) => (
                                <div key={index} className="bg-white/5 border border-white/5 p-6 rounded-[2rem] group hover:bg-white/10 transition-all duration-300">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-black text-white text-lg tracking-tight italic uppercase">{room.name}</h4>
                                        <span className="text-[10px] font-black text-red-400 bg-red-600/10 px-3 py-1 rounded-lg border border-red-600/20">{room.floorArea} m²</span>
                                    </div>
                                    <div className="space-y-2">
                                        {room.materials.map((mat, i) => (
                                            <div key={i} className="flex justify-between items-center text-xs p-3 bg-black/40 rounded-xl border border-white/5 group-hover:border-red-600/30 transition-colors">
                                                <span className="text-slate-400 font-bold uppercase tracking-tight">{mat.name}</span>
                                                <span className="text-white font-black">{mat.quantity} {mat.unit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                                <Box className="h-20 w-20 text-slate-500 mb-6"/>
                                <p className="text-sm font-black uppercase tracking-widest text-slate-500 max-w-xs">Initialize visual sensor feed to generate digital twin material telemetry</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showCreateProjectModal && (
                <CreateProjectModal 
                    onClose={() => setShowCreateProjectModal(false)}
                    onProjectCreated={handleProjectCreated}
                    initialData={{ projectName: "Schematic Import" }}
                />
            )}
        </div>
    );
};

export default BlueprintAnalyzerPage;