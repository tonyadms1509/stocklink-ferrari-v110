
import React, { useEffect, useState } from 'react';
import { useToast, Toast } from '../hooks/useToast';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/solid';

const TOAST_TIMEOUT = 5000; // 5 seconds

const toastConfig = {
    success: {
        icon: CheckCircleIcon,
        bg: 'bg-gray-900/90',
        border: 'border-green-500',
        text: 'text-white',
        iconColor: 'text-green-400',
    },
    error: {
        icon: XCircleIcon,
        bg: 'bg-gray-900/90',
        border: 'border-red-500',
        text: 'text-white',
        iconColor: 'text-red-400',
    },
    info: {
        icon: InformationCircleIcon,
        bg: 'bg-gray-900/90',
        border: 'border-blue-500',
        text: 'text-white',
        iconColor: 'text-blue-400',
    },
    warning: {
        icon: ExclamationTriangleIcon,
        bg: 'bg-gray-900/90',
        border: 'border-yellow-500',
        text: 'text-white',
        iconColor: 'text-yellow-400',
    }
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onDismiss(toast.id), 300); // Wait for exit animation
        }, TOAST_TIMEOUT);

        return () => clearTimeout(timer);
    }, [toast, onDismiss]);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => onDismiss(toast.id), 300);
    }

    const config = toastConfig[toast.type];
    const Icon = config.icon;

    return (
        <div 
            className={`
                max-w-sm w-full backdrop-blur-md shadow-2xl rounded-xl pointer-events-auto overflow-hidden border-l-4 ${config.border} ${config.bg}
                transition-all duration-300 transform
                ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
                animate-fade-in-right mb-3 relative group
            `}
        >
            <div className="p-4 flex items-start gap-3">
                <div className="flex-shrink-0">
                    <Icon className={`h-6 w-6 ${config.iconColor}`} aria-hidden="true" />
                </div>
                <div className="w-0 flex-1 pt-0.5">
                    <p className={`text-sm font-medium ${config.text}`}>
                        {toast.message}
                    </p>
                </div>
                <div className="flex-shrink-0 flex">
                    <button
                        className={`rounded-md text-gray-400 hover:text-white focus:outline-none transition-colors opacity-0 group-hover:opacity-100`}
                        onClick={handleDismiss}
                    >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
            </div>
            
            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
                <div 
                    className={`h-full ${config.iconColor.replace('text-', 'bg-')}`}
                    style={{ 
                        width: '0%', 
                        animation: `progress ${TOAST_TIMEOUT}ms linear forwards` 
                    }} 
                />
            </div>
            <style>{`
                @keyframes progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
};


const ToastContainer: React.FC = () => {
    const { toasts, dismissToast } = useToast();

    return (
        <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-[100]">
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
                ))}
            </div>
        </div>
    );
};

export default ToastContainer;
