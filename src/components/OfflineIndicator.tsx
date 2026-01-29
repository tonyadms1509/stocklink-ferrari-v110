
import React, { useEffect, useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiIcon, NoSymbolIcon, BoltIcon } from '@heroicons/react/24/solid';
import { isSupabaseConfigured } from '../services/supabaseClient';

const OfflineIndicator: React.FC = () => {
    const isOnline = useOnlineStatus();
    // Simple state to force a re-render or check if backend is really live via simple ping could be added here
    // For now, static config check is sufficient for UI
    const isBackendLive = isSupabaseConfigured;

    if (isOnline) {
        if (isBackendLive) {
             return (
                <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-100/80 px-3 py-1 rounded-full font-semibold border border-green-200">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span>Live Sync</span>
                </div>
            );
        } else {
             return (
                <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-100/80 px-3 py-1 rounded-full font-semibold border border-blue-200">
                    <span className="relative flex h-2 w-2">
                         <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span>Demo Mode</span>
                </div>
            );
        }
    }

    return (
        <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-100/80 px-3 py-1 rounded-full font-semibold border border-red-200">
             <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span>Offline</span>
        </div>
    );
};

export default OfflineIndicator;
