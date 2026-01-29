
import React, { useState, useRef, useEffect } from 'react';
import { ChevronRightIcon, CheckIcon } from '@heroicons/react/24/solid';

interface SwipeButtonProps {
    onComplete: () => void;
    label: string;
    colorClass?: string;
    resetOnComplete?: boolean;
}

const SwipeButton: React.FC<SwipeButtonProps> = ({ onComplete, label, colorClass = 'bg-primary', resetOnComplete = false }) => {
    const [dragWidth, setDragWidth] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const trackRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDrag = (clientX: number) => {
        if (!trackRef.current || isCompleted) return;
        const trackRect = trackRef.current.getBoundingClientRect();
        const newWidth = Math.min(Math.max(0, clientX - trackRect.left), trackRect.width);
        setDragWidth(newWidth);
        
        // Threshold to complete (95%)
        if (newWidth > trackRect.width * 0.95) {
            setIsCompleted(true);
            setDragWidth(trackRect.width);
            onComplete();
            if (resetOnComplete) {
                setTimeout(() => {
                    setIsCompleted(false);
                    setDragWidth(0);
                }, 2000);
            }
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if(isDragging) handleDrag(e.touches[0].clientX);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if(isDragging) handleDrag(e.clientX);
    };

    const handleEnd = () => {
        setIsDragging(false);
        if (!isCompleted) {
            setDragWidth(0); // Snap back
        }
    };

    return (
        <div 
            className="relative w-full h-14 bg-gray-200 rounded-full overflow-hidden select-none shadow-inner border border-gray-300"
            ref={trackRef}
            onTouchMove={handleTouchMove}
            onMouseMove={handleMouseMove}
            onTouchEnd={handleEnd}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
        >
            {/* Background Text */}
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-bold text-sm uppercase tracking-wider pointer-events-none">
                {isCompleted ? 'Completed!' : label}
            </div>

            {/* Progress Track */}
            <div 
                className={`absolute top-0 left-0 h-full transition-all duration-75 ${isCompleted ? 'bg-green-500' : colorClass} opacity-20`} 
                style={{ width: dragWidth }}
            ></div>

            {/* Slider Handle */}
            <div 
                className={`absolute top-1 bottom-1 w-12 h-12 rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing transition-all duration-75 ${isCompleted ? 'bg-green-500' : colorClass}`}
                style={{ left: Math.min(dragWidth, (trackRef.current?.offsetWidth || 0) - 52) }}
                onMouseDown={() => setIsDragging(true)}
                onTouchStart={() => setIsDragging(true)}
            >
                {isCompleted ? (
                    <CheckIcon className="h-6 w-6 text-white animate-fade-in-scale" />
                ) : (
                    <ChevronRightIcon className="h-6 w-6 text-white" />
                )}
            </div>
        </div>
    );
};

export default SwipeButton;
