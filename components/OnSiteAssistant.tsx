
import React, { useState } from 'react';
import { SparklesIcon, XMarkIcon, MicrophoneIcon, CameraIcon, CalculatorIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../hooks/useLocalization';

interface OnSiteAssistantProps {
    onOpenCopilot: () => void;
    onOpenScanner: () => void;
    onOpenCalculator: () => void;
}

const OnSiteAssistant: React.FC<OnSiteAssistantProps> = ({ onOpenCopilot, onOpenScanner, onOpenCalculator }) => {
    const { t } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);

    if (isOpen) {
        return (
            <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-3 animate-fade-in-scale">
                <button 
                    onClick={onOpenCalculator}
                    className="bg-white text-gray-700 p-3 rounded-full shadow-lg hover:bg-gray-50 flex items-center gap-2 group border border-gray-200"
                >
                    <span className="text-sm font-semibold mr-1 hidden group-hover:block">Calculators</span>
                    <CalculatorIcon className="h-6 w-6 text-secondary"/>
                </button>
                <button 
                    onClick={onOpenScanner}
                    className="bg-white text-gray-700 p-3 rounded-full shadow-lg hover:bg-gray-50 flex items-center gap-2 group border border-gray-200"
                >
                    <span className="text-sm font-semibold mr-1 hidden group-hover:block">Site Reporter</span>
                    <CameraIcon className="h-6 w-6 text-blue-600"/>
                </button>
                <button 
                    onClick={onOpenCopilot}
                    className="bg-white text-gray-700 p-3 rounded-full shadow-lg hover:bg-gray-50 flex items-center gap-2 group border border-gray-200"
                >
                    <span className="text-sm font-semibold mr-1 hidden group-hover:block">Voice Assistant</span>
                    <MicrophoneIcon className="h-6 w-6 text-accent"/>
                </button>
                <button 
                    onClick={() => setIsOpen(false)}
                    className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
                >
                    <XMarkIcon className="h-6 w-6"/>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-24 right-6 z-40 sm:bottom-6 sm:right-20">
             <button 
                onClick={() => setIsOpen(true)}
                className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110 flex items-center justify-center"
            >
                <SparklesIcon className="h-6 w-6"/>
            </button>
        </div>
    );
};

export default OnSiteAssistant;
