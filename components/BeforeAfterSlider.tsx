import React, { useState, useRef, useEffect } from 'react';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/solid';

interface BeforeAfterSliderProps {
    beforeImage: string;
    afterImage: string;
    beforeLabel?: string;
    afterLabel?: string;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ 
    beforeImage, 
    afterImage, 
    beforeLabel = "Before", 
    afterLabel = "After" 
}) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = () => setIsResizing(true);
    const handleMouseUp = () => setIsResizing(false);

    const handleMouseMove = (e: MouseEvent | React.MouseEvent) => {
        if (!isResizing || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e as MouseEvent).clientX - rect.left;
        const width = rect.width;
        const position = Math.min(Math.max((x / width) * 100, 0), 100);
        setSliderPosition(position);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        const width = rect.width;
        const position = Math.min(Math.max((x / width) * 100, 0), 100);
        setSliderPosition(position);
    };

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousemove', handleMouseMove as any);
        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousemove', handleMouseMove as any);
        };
    }, [isResizing]);

    return (
        <div 
            ref={containerRef}
            className="relative w-full h-64 sm:h-80 md:h-96 rounded-[2rem] overflow-hidden cursor-col-resize shadow-2xl select-none group border border-white/10"
            onTouchMove={handleTouchMove}
        >
            {/* After Image (Background) */}
            <div className="absolute inset-0 bg-slate-900">
                <img 
                    src={afterImage} 
                    alt={afterLabel} 
                    className="w-full h-full object-cover" 
                    draggable={false}
                />
                <span className="absolute bottom-6 right-6 bg-blue-600/80 text-white text-[10px] font-black px-3 py-1 rounded-full backdrop-blur-md z-10 uppercase tracking-widest">
                    {afterLabel}
                </span>
            </div>

            {/* Before Image (Clipped) */}
            <div 
                className="absolute inset-0 overflow-hidden" 
                style={{ width: `${sliderPosition}%` }}
            >
                <img 
                    src={beforeImage} 
                    alt={beforeLabel} 
                    className="absolute top-0 left-0 h-full max-w-none object-cover grayscale" 
                    style={{ width: containerRef.current?.offsetWidth || '100%' }}
                    draggable={false}
                />
                <span className="absolute bottom-6 left-6 bg-slate-900/80 text-white text-[10px] font-black px-3 py-1 rounded-full backdrop-blur-md z-10 uppercase tracking-widest">
                    {beforeLabel}
                </span>
            </div>

            {/* Slider Handle */}
            <div 
                className="absolute top-0 bottom-0 w-1 bg-white/50 cursor-col-resize z-20 flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
            >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-110 border-4 border-slate-900">
                    <ArrowsRightLeftIcon className="h-5 w-5 text-slate-900" />
                </div>
            </div>
        </div>
    );
};

export default BeforeAfterSlider;