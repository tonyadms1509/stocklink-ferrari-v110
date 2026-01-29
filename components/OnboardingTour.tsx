import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, ChevronRightIcon, SparklesIcon } from '@heroicons/react/24/solid';

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

    // Safeguard: Ensure steps exists and we have a valid current step
    const currentStep = (steps && steps.length > 0 && currentStepIndex < steps.length) 
        ? steps[currentStepIndex] 
        : null;

    const updateTargetPosition = useCallback(() => {
        if (!isOpen || !currentStep || !currentStep.targetId) {
            setIsCalculating(false);
            return;
        }

        const element = document.getElementById(currentStep.targetId);
        if (element) {
            // Smooth scroll to the element to ensure it's in the viewport
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Wait for scroll to settle before measuring
            setTimeout(() => {
                const rect = element.getBoundingClientRect();
                setTargetRect(rect);
                setIsCalculating(false);
            }, 500);
        } else {
            // If target element is missing from DOM, safely skip this step
            console.warn(`Tour Target [${currentStep.targetId}] not found. Skipping...`);
            if (currentStepIndex < (steps?.length || 0) - 1) {
                setCurrentStepIndex(prev => prev + 1);
            } else {
                onComplete();
            }
        }
    }, [isOpen, currentStep, currentStepIndex, steps?.length, onComplete]);

    useEffect(() => {
        if (isOpen && steps && steps.length > 0) {
            setIsCalculating(true);
            const timer = setTimeout(updateTargetPosition, 400);
            window.addEventListener('resize', updateTargetPosition);
            return () => {
                clearTimeout(timer);
                window.removeEventListener('resize', updateTargetPosition);
            };
        } else if (isOpen) {
            // Close if no steps provided
            onComplete();
        }
    }, [currentStepIndex, isOpen, steps, updateTargetPosition, onComplete]);

    const handleNext = () => {
        if (currentStepIndex < (steps?.length || 0) - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    // Prevent rendering if state is invalid
    if (!isOpen || !currentStep || !targetRect) return null;

    const tooltipStyle: React.CSSProperties = {
        position: 'fixed',
        zIndex: 10000,
        width: '340px',
        pointerEvents: 'auto'
    };

    const spacing = 24;
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

    // Keep tooltip within screen bounds
    if (typeof tooltipStyle.left === 'number') {
        tooltipStyle.left = Math.max(10, Math.min(window.innerWidth - 350, tooltipStyle.left));
    }

    return createPortal(
        <div className="fixed inset-0 z-[9998] transition-opacity duration-500 ease-in-out">
            {/* Backdrop with Highlight Clip */}
            <div 
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]"
                style={{
                    clipPath: `polygon(
                        0% 0%, 0% 100%, 
                        ${targetRect.left - 12}px 100%, 
                        ${targetRect.left - 12}px ${targetRect.top - 12}px, 
                        ${targetRect.right + 12}px ${targetRect.top - 12}px, 
                        ${targetRect.right + 12}px ${targetRect.bottom + 12}px, 
                        ${targetRect.left - 12}px ${targetRect.bottom + 12}px, 
                        ${targetRect.left - 12}px 100%, 
                        100% 100%, 100% 0%
                    )`
                }}
            ></div>
            
            {/* Pulsing Target Border */}
            <div 
                className="absolute border-4 border-red-600 rounded-[2rem] shadow-[0_0_50px_rgba(220,0,0,0.4)] animate-pulse pointer-events-none"
                style={{
                    top: targetRect.top - 16,
                    left: targetRect.left - 16,
                    width: targetRect.width + 32,
                    height: targetRect.height + 32,
                }}
            ></div>

            {/* Tooltip Content */}
            <div 
                className={`bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 flex flex-col gap-4 border border-white/10 animate-fade-in-scale transition-opacity duration-300 ${isCalculating ? 'opacity-0' : 'opacity-100'}`}
                style={tooltipStyle}
            >
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="h-5 w-5 text-red-500 animate-pulse" />
                        <h3 className="font-black text-xl text-white italic uppercase tracking-tighter">{currentStep.title}</h3>
                    </div>
                    <button onClick={onSkip} className="text-slate-500 hover:text-white transition-colors p-1">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <p className="text-sm text-slate-300 font-medium leading-relaxed italic">"{currentStep.content}"</p>
                
                <div className="flex items-center justify-between mt-4 pt-6 border-t border-white/5">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest font-mono">
                        Protocol {currentStepIndex + 1} / {steps?.length || 0}
                    </span>
                    <button 
                        onClick={handleNext} 
                        className="px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xl shadow-red-900/40 transition-all transform active:scale-95 border border-white/10"
                    >
                        {currentStepIndex === (steps?.length || 0) - 1 ? 'Engage' : 'Next'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default OnboardingTour;