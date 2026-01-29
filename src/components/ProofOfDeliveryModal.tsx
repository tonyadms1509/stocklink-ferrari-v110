import React, { useState, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { XMarkIcon, CameraIcon, PencilSquareIcon, CheckCircleIcon, ShieldCheckIcon, PhotoIcon } from '@heroicons/react/24/solid';
import { Order } from '../types';

interface ProofOfDeliveryModalProps {
    order: Order;
    onClose: () => void;
    onComplete: (orderId: string, proofOfDelivery: { imageUrl: string, signatureUrl: string, timestamp: Date }) => void;
}

const ProofOfDeliveryModal: React.FC<ProofOfDeliveryModalProps> = ({ order, onClose, onComplete }) => {
    const { t } = useLocalization();
    const [step, setStep] = useState<'photo' | 'signature' | 'review'>('photo');
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) setPhotoUrl(URL.createObjectURL(file));
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        setIsDrawing(true);
        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
        ctx.beginPath(); ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;
        ctx.lineTo(x, y); ctx.stroke();
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    };

    const handleNext = () => {
        if (step === 'photo' && photoUrl) setStep('signature');
        else if (step === 'signature' && canvasRef.current) {
            setSignatureUrl(canvasRef.current.toDataURL());
            setStep('review');
        }
    };
    
    const handleSubmit = () => {
        if (photoUrl && signatureUrl) {
            onComplete(order.id, { imageUrl: photoUrl, signatureUrl: signatureUrl, timestamp: new Date() });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[100] p-4 backdrop-blur-xl animate-fade-in">
            <div className="bg-slate-900 border border-white/10 rounded-[3.5rem] shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden">
                <div className="p-8 border-b border-white/5 bg-slate-800/30 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Mission <span className="text-red-600">Closeout</span></h2>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Payload: #{order.orderNumber}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors"><XMarkIcon className="h-6 w-6"/></button>
                </div>

                <div className="p-10 flex-grow overflow-y-auto custom-scrollbar">
                    {step === 'photo' && (
                        <div className="space-y-8">
                            <p className="text-slate-400 text-sm font-medium italic text-center leading-relaxed">Capture high-fidelity visual evidence of the payload at the designated node coordinates.</p>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-4 border-dashed border-white/5 rounded-[3rem] p-12 cursor-pointer hover:border-red-500/30 transition-all flex flex-col items-center justify-center h-72 bg-slate-950/50 group"
                            >
                                {photoUrl ? (
                                    <img src={photoUrl} alt="Proof" className="max-h-full object-contain rounded-2xl shadow-2xl" />
                                ) : (
                                    <>
                                        <div className="p-6 bg-slate-800 rounded-full mb-6 group-hover:scale-110 transition-transform shadow-xl"><CameraIcon className="h-12 w-12 text-slate-500 group-hover:text-red-600 transition-colors"/></div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Initialize Visual Sensor</p>
                                    </>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                            </div>
                            <button onClick={handleNext} disabled={!photoUrl} className="w-full bg-white text-slate-950 font-black py-5 rounded-3xl disabled:opacity-30 uppercase tracking-[0.3em] text-[10px] shadow-2xl border-4 border-slate-900 transition-all active:scale-95">Next Protocol</button>
                        </div>
                    )}

                    {step === 'signature' && (
                        <div className="space-y-8">
                            <p className="text-slate-400 text-sm font-medium italic text-center">Execute recipient identity handshake. Manual signature required for settlement lock.</p>
                            <div className="border-4 border-white/5 rounded-[2.5rem] bg-slate-950/80 touch-none shadow-inner p-2 relative overflow-hidden">
                                <canvas
                                    ref={canvasRef} width={400} height={250} className="w-full h-56"
                                    onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)}
                                    onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={() => setIsDrawing(false)}
                                />
                                <div className="absolute top-4 left-4 pointer-events-none opacity-20"><ShieldCheckIcon className="h-12 w-12 text-blue-500"/></div>
                            </div>
                            <button onClick={clearSignature} className="w-full text-[10px] font-black uppercase text-red-600 tracking-widest hover:text-red-500 transition-colors">Clear Grid</button>
                             <div className="flex gap-4">
                                <button onClick={() => setStep('photo')} className="flex-1 bg-white/5 text-slate-500 font-black py-4 rounded-3xl text-[10px] uppercase tracking-widest">Back</button>
                                <button onClick={handleNext} className="flex-1 bg-white text-slate-950 font-black py-4 rounded-3xl text-[10px] uppercase tracking-widest shadow-2xl border-4 border-slate-900 transition-all active:scale-95">Verify</button>
                            </div>
                        </div>
                    )}

                    {step === 'review' && (
                        <div className="space-y-10 animate-fade-in-up">
                             <div className="bg-emerald-500/10 p-8 rounded-[3rem] border border-emerald-500/20 flex items-center gap-6 shadow-2xl">
                                <div className="p-4 bg-emerald-500 rounded-2xl shadow-xl"><CheckCircleIcon className="h-10 w-10 text-white"/></div>
                                <div>
                                    <h3 className="font-black text-emerald-400 italic uppercase tracking-tighter text-xl leading-none">Dossier Sealed</h3>
                                    <p className="text-xs text-emerald-100/60 font-medium mt-1">Evidence validated. Ready for grid upload.</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Visual Hash</p>
                                    <img src={photoUrl!} className="w-full h-32 object-cover rounded-2xl border border-white/5 grayscale opacity-50" alt="P1"/>
                                </div>
                                 <div className="space-y-2">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Token Handshake</p>
                                    <img src={signatureUrl!} className="w-full h-32 object-contain rounded-2xl border border-white/5 bg-white/5 grayscale invert opacity-50" alt="S1"/>
                                </div>
                            </div>

                            <button onClick={handleSubmit} className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-6 rounded-[2rem] text-xs uppercase tracking-[0.4em] shadow-[0_0_30px_rgba(220,0,0,0.3)] transition-all transform active:scale-95 border border-white/10">Terminate & Upload</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProofOfDeliveryModal;