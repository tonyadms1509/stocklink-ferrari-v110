
import React, { useState, useRef, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { XMarkIcon, CameraIcon, PencilSquareIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
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

    // Handle Photo Upload
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPhotoUrl(url);
        }
    };

    // Signature Pad Logic
    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        setIsDrawing(true);
        const { x, y } = getCoordinates(e, canvas);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const { x, y } = getCoordinates(e, canvas);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        if (canvasRef.current) {
            // Save immediately to state to preserve between renders if needed
            // though in this flow we capture it on "Next"
        }
    };

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const handleNext = () => {
        if (step === 'photo') {
            if (photoUrl) setStep('signature');
            else alert(t('podPhotoRequired'));
        } else if (step === 'signature') {
             const canvas = canvasRef.current;
             if (canvas) {
                 // Check if canvas is empty - simplistic check
                 // Ideally we'd track if any drawing occurred
                 setSignatureUrl(canvas.toDataURL());
                 setStep('review');
             }
        }
    };
    
    const handleSubmit = () => {
        if (photoUrl && signatureUrl) {
            onComplete(order.id, {
                imageUrl: photoUrl,
                signatureUrl: signatureUrl,
                timestamp: new Date()
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-[70] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-primary">{t('podTitle')}</h2>
                    <button onClick={onClose} className="text-gray-500"><XMarkIcon className="h-6 w-6"/></button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto">
                    {step === 'photo' && (
                        <div className="text-center space-y-6">
                            <p className="text-gray-600">{t('podStep1Desc')}</p>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:bg-gray-50 flex flex-col items-center justify-center h-64"
                            >
                                {photoUrl ? (
                                    <img src={photoUrl} alt="Delivery proof" className="max-h-full object-contain" />
                                ) : (
                                    <>
                                        <CameraIcon className="h-16 w-16 text-gray-300 mb-2"/>
                                        <p className="text-sm text-gray-500">{t('podTakePhoto')}</p>
                                    </>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                            </div>
                            <button onClick={handleNext} disabled={!photoUrl} className="w-full bg-primary text-white font-bold py-3 rounded-lg disabled:opacity-50">
                                {t('podNext')}
                            </button>
                        </div>
                    )}

                    {step === 'signature' && (
                        <div className="space-y-4">
                            <p className="text-gray-600 text-center">{t('podStep2Desc')}</p>
                            <div className="border-2 border-gray-300 rounded-lg bg-gray-50 touch-none">
                                <canvas
                                    ref={canvasRef}
                                    width={350}
                                    height={200}
                                    className="w-full h-48"
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                />
                            </div>
                            <div className="flex justify-between">
                                <button onClick={clearSignature} className="text-sm text-red-500 font-semibold">{t('podClearSignature')}</button>
                            </div>
                             <div className="flex gap-3">
                                <button onClick={() => setStep('photo')} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-lg">
                                    {t('podBack')}
                                </button>
                                <button onClick={handleNext} className="flex-1 bg-primary text-white font-bold py-3 rounded-lg">
                                    {t('podNext')}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'review' && (
                        <div className="space-y-4">
                             <div className="bg-green-50 p-4 rounded-lg flex items-center gap-3 mb-4">
                                <CheckCircleIcon className="h-8 w-8 text-green-500"/>
                                <div>
                                    <h3 className="font-bold text-green-800">{t('podReviewTitle')}</h3>
                                    <p className="text-sm text-green-700">{t('podReviewDesc')}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 mb-1">Photo</p>
                                    <img src={photoUrl!} className="w-full h-32 object-cover rounded border" alt="Proof"/>
                                </div>
                                 <div>
                                    <p className="text-xs font-bold text-gray-500 mb-1">Signature</p>
                                    <img src={signatureUrl!} className="w-full h-32 object-contain rounded border bg-white" alt="Signature"/>
                                </div>
                            </div>

                            <button onClick={handleSubmit} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg text-lg shadow-lg">
                                {t('podConfirmComplete')}
                            </button>
                             <button onClick={() => setStep('signature')} className="w-full text-gray-500 font-semibold py-2">
                                {t('podEdit')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProofOfDeliveryModal;
