import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiIcon, NoSymbolIcon } from '@heroicons/react/24/solid';

const OfflineIndicator: React.FC = () => {
    const isOnline = useOnlineStatus();

    if (isOnline) {
        return (
            <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span>Online</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
             <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span>Offline</span>
        </div>
    );
};

export default OfflineIndicator;