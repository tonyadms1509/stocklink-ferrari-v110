
import React from 'react';

interface EmptyStateProps {
    icon: React.ElementType;
    title: string;
    message: string;
    action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, message, action }) => {
    return (
        <div className="text-center bg-white p-12 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-50 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-50 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl opacity-50"></div>
            
            <div className="relative z-10">
                <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Icon className="h-12 w-12 text-gray-400 opacity-80" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-8">{message}</p>
                {action && <div className="inline-block">{action}</div>}
            </div>
        </div>
    );
};

export default EmptyState;
