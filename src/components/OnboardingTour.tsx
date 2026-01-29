
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, ChevronRightIcon, ChevronLeftIcon, SparklesIcon } from '@heroicons/react/24/solid';

export interface TourStep {
    targetId: string;
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
    steps: TourStep[];
    onComplete: () => void;
    onSkip: () => void;
    isOpen: boolean;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ steps, onComplete, onSkip, isOpen }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isCalculating, setIsCalculating] = useState(true);

    const currentStep = steps[currentStepIndex];

    const updateTargetPosition = () => {
        if (!isOpen) return;
        const element = document.getElementById(currentStep.targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                const rect = element.getBoundingClientRect();
                setTargetRect(rect);
                setIsCalculating(false);
            }, 600);
        } else {
            handleNext();
        }
    };

    useEffect(() => {
        if (isOpen) {
            setIsCalculating(true);
            const timer = setTimeout(updateTargetPosition, 400);
            window.addEventListener('resize', updateTargetPosition);
            return () => {
                clearTimeout(timer);
                window.removeEventListener('resize', updateTargetPosition);
            };
        }
    }, [currentStepIndex, isOpen]);

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    if (!isOpen || !targetRect) return null;

    const tooltipStyle: React.CSSProperties = {
        position: 'fixed',
        zIndex: 10000,
        width: '340px',
    };

    const spacing = 20;
    const position = currentStep.position || 'bottom';

    if (position === 'bottom') {
        tooltipStyle.top = targetRect.bottom + spacing;
        tooltipStyle.left = targetRect.left + (targetRect.width / 2) - 170;
    } else if (position === 'top') {
        tooltipStyle.bottom = window.innerHeight - targetRect.top + spacing;
        tooltipStyle.left = targetRect.left + (targetRect.width / 2) - 170;
    } else if (position === 'left') {
        tooltipStyle.top = targetRect.top;
        tooltipStyle.right = window.innerWidth - targetRect.left + spacing;
    } else if (position === 'right') {
        tooltipStyle.top = targetRect.top;
        tooltipStyle.left = targetRect.right + spacing;
    }

    if (typeof tooltipStyle.left === 'number') {
        tooltipStyle.left = Math.max(10, Math.min(window.innerWidth - 350, tooltipStyle.left));
    }

    return createPortal(
        <div className="fixed inset-0 z-[9998] transition-opacity duration-500 ease-in-out">
            <div 
                className="absolute inset-0"
                style={{
                    backgroundColor: 'rgba(2, 6, 23, 0.85)',
                    clipPath: `polygon(
                        0% 0%, 0% 100%, 
                        ${targetRect.left - 8}px 100%, 
                        ${targetRect.left - 8}px ${targetRect.top - 8}px, 
                        ${targetRect.right + 8}px ${targetRect.top - 8}px, 
                        ${targetRect.right + 8}px ${targetRect.bottom + 8}px, 
                        ${targetRect.left - 8}px ${targetRect.bottom + 8}px, 
                        ${targetRect.left - 8}px 100%, 
                        100% 100%, 100% 0%
                    )`
                }}
            ></div>
            
            <div 
                className="absolute border-4 border-blue-500 rounded-[2rem] shadow-[0_0_40px_rgba(59,130,246,0.5)] animate-pulse pointer-events-none"
                style={{
                    top: targetRect.top - 12,
                    left: targetRect.left - 12,
                    width: targetRect.width + 24,
                    height: targetRect.height + 24,
                }}
            ></div>

            <div 
                className={`bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 flex flex-col gap-4 border border-white/10 animate-fade-in-scale ${isCalculating ? 'opacity-0' : 'opacity-100'}`}
                style={tooltipStyle}
            >
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="h-5 w-5 text-blue-400 animate-pulse" />
                        <h3 className="font-black text-xl text-white italic uppercase tracking-tighter">{currentStep.title}</h3>
                    </div>
                    <button onClick={onSkip} className="text-slate-500 hover:text-white p-1 transition-colors">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <p className="text-sm text-slate-400 font-medium leading-relaxed italic">"{currentStep.content}"</p>
                
                <div className="flex items-center justify-between mt-4 pt-6 border-t border-white/5">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                        Protocol {currentStepIndex + 1} / {steps.length}
                    </span>
                    <div className="flex gap-3">
                        {currentStepIndex > 0 && (
                             <button 
                                onClick={handlePrev} 
                                className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                             >
                                Previous
                            </button>
                        )}
                        <button 
                            onClick={handleNext} 
                            className="px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center gap-2 shadow-xl shadow-blue-900/40 transition-all transform active:scale-95"
                        >
                            {currentStepIndex === steps.length - 1 ? 'Activate' : 'Next'}
                            {currentStepIndex < steps.length - 1 && <ChevronRightIcon className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default OnboardingTour;
