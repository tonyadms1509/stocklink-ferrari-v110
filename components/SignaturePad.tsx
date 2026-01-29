
import React, { useRef, useState, useEffect } from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/solid';

interface SignaturePadProps {
    onSave: (dataUrl: string) => void;
    onCancel?: () => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onCancel }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        setIsDrawing(true);
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };
    
    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
    }

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            onSave(canvas.toDataURL());
        }
    }

    return (
        <div className="border-2 border-gray-300 rounded-lg p-1 bg-gray-50">
            <div className="flex justify-between items-center px-2 mb-1">
                 <p className="text-xs text-gray-500 flex items-center gap-1"><PencilSquareIcon className="h-3 w-3"/> Sign Above</p>
                 <button onClick={clearSignature} className="text-xs text-red-500 font-bold hover:underline">Clear</button>
            </div>
            <canvas
                ref={canvasRef}
                width={300}
                height={150}
                className="w-full h-32 bg-white rounded cursor-crosshair touch-none border border-gray-200"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
            <div className="flex justify-end gap-2 mt-2 px-1">
                {onCancel && <button onClick={onCancel} className="text-xs text-gray-500 hover:underline">Cancel</button>}
                <button onClick={handleSave} className="text-xs bg-primary text-white px-3 py-1 rounded hover:bg-blue-700 font-bold">Save Signature</button>
            </div>
        </div>
    );
};

export default SignaturePad;
