
import React, { useRef, useState, useEffect } from 'react';
import { 
    X, Pencil, Eraser, Stamp, 
    Save, RotateCcw, AlertTriangle, 
    Check, MousePointer2, Zap, Layers 
} from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface PlanAnnotatorModalProps {
    imageUrl: string;
    fileName: string;
    onClose: () => void;
    onSave: (annotatedImageBase64: string, newName: string) => void;
}

const PlanAnnotatorModal: React.FC<PlanAnnotatorModalProps> = ({ imageUrl, fileName, onClose, onSave }) => {
    const { showToast } = useToast();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<'pen' | 'eraser' | 'stamp'>('pen');
    const [color, setColor] = useState('#DC0000'); // Ferrari Red
    const [history, setHistory] = useState<ImageData[]>([]);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.src = imageUrl;
        img.crossOrigin = "Anonymous"; 
        img.onload = () => {
            const maxWidth = window.innerWidth * 0.8;
            const maxHeight = window.innerHeight * 0.7;
            let width = img.width;
            let height = img.height;
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            saveState();
        };
    }, [imageUrl]);

    const saveState = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) setHistory(prev => [...prev, ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height)]);
    };

    const undo = () => {
        if (history.length <= 1) return;
        const newHistory = [...history];
        newHistory.pop();
        setHistory(newHistory);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) ctx.putImageData(newHistory[newHistory.length - 1], 0, 0);
    };

    const getPos = (e: any) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        return {
            x: (e.clientX || e.touches?.[0]?.clientX) - rect.left,
            y: (e.clientY || e.touches?.[0]?.clientY) - rect.top
        };
    };

    const start = (e: any) => {
        if (tool === 'stamp') {
            const { x, y } = getPos(e);
            const ctx = canvasRef.current!.getContext('2d')!;
            ctx.font = "bold 24px Inter";
            ctx.fillStyle = color;
            ctx.fillText("⚠️ HAZARD", x, y);
            saveState();
            return;
        }
        setIsDrawing(true);
        const { x, y } = getPos(e);
        const ctx = canvasRef.current!.getContext('2d')!;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
        ctx.lineWidth = tool === 'eraser' ? 20 : 3;
        ctx.lineCap = 'round';
    };

    const draw = (e: any) => {
        if (!isDrawing || tool === 'stamp') return;
        const { x, y } = getPos(e);
        const ctx = canvasRef.current!.getContext('2d')!;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const finish = () => {
        if (isDrawing) {
            setIsDrawing(false);
            saveState();
        }
    };

    const handleSave = () => {
        const base64 = canvasRef.current!.toDataURL('image/png').split(',')[1];
        onSave(base64, `Marked_${fileName}`);
        showToast("Annotation Dossier Saved", "success");
    };

    return (
        <div className="fixed inset-0 bg-slate-950/98 z-[200] flex flex-col items-center justify-center p-8 backdrop-blur-3xl animate-fade-in">
            <div className="absolute top-8 left-8 flex items-center gap-4 text-left">
                <div className="p-3 bg-red-600 rounded-2xl shadow-2xl"><Layers size={20} className="text-white"/></div>
                <div>
                     <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">Visual Markup Protocol</p>
                     <h3 className="text-white font-black italic uppercase tracking-tighter text-xl">{fileName}</h3>
                </div>
            </div>

            <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white p-3 bg-white/5 rounded-2xl transition-all"><X size={24}/></button>

            <div className="bg-slate-900 rounded-[3rem] p-4 border-4 border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden relative group">
                <canvas 
                    ref={canvasRef} 
                    onMouseDown={start} onMouseMove={draw} onMouseUp={finish} onMouseLeave={finish}
                    onTouchStart={start} onTouchMove={draw} onTouchEnd={finish}
                    className={`block bg-white rounded-[2rem] touch-none ${tool === 'pen' ? 'cursor-crosshair' : 'cursor-default'}`}
                />
            </div>

            {/* Tactical Command Bar */}
            <div className="mt-12 bg-slate-900 border border-white/10 rounded-[2.5rem] p-3 flex items-center gap-6 shadow-2xl">
                 <div className="flex gap-2 border-r border-white/5 pr-6">
                     <button onClick={() => setTool('pen')} className={`p-4 rounded-2xl transition-all ${tool === 'pen' ? 'bg-red-600 text-white shadow-xl shadow-red-900/40' : 'text-slate-500 hover:bg-white/5'}`}><Pencil size={20}/></button>
                     <button onClick={() => setTool('eraser')} className={`p-4 rounded-2xl transition-all ${tool === 'eraser' ? 'bg-red-600 text-white shadow-xl shadow-red-900/40' : 'text-slate-500 hover:bg-white/5'}`}><Eraser size={20}/></button>
                     <button onClick={() => setTool('stamp')} className={`p-4 rounded-2xl transition-all ${tool === 'stamp' ? 'bg-red-600 text-white shadow-xl shadow-red-900/40' : 'text-slate-500 hover:bg-white/5'}`}><Stamp size={20}/></button>
                 </div>
                 <div className="flex gap-3">
                     {['#DC0000', '#2563eb', '#10b981', '#000000'].map(c => (
                         <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'border-white scale-125' : 'border-transparent'}`} style={{backgroundColor: c}}></button>
                     ))}
                 </div>
                 <div className="flex gap-2 border-l border-white/5 pl-6">
                     <button onClick={undo} className="p-4 text-slate-500 hover:text-white transition-all"><RotateCcw size={20}/></button>
                     <button onClick={handleSave} className="bg-white text-slate-950 font-black px-10 py-4 rounded-2xl flex items-center gap-3 uppercase text-[10px] tracking-widest transform active:scale-95 shadow-xl border-4 border-slate-950">
                        <Save size={16} className="text-red-600"/> Commit Markup
                     </button>
                 </div>
            </div>
        </div>
    );
};

export default PlanAnnotatorModal;
