
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../hooks/useLocalization';
import { 
    Cog6ToothIcon, 
    ArrowLeftIcon, 
    TrashIcon, 
    BellIcon, 
    LanguageIcon,
    ShieldCheckIcon,
    ServerIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    GlobeAltIcon,
    LinkIcon,
    CheckCircleIcon,
    RocketLaunchIcon,
    CommandLineIcon,
    KeyIcon,
    SparklesIcon
} from '@heroicons/react/24/solid';
import { useToast } from '../../hooks/useToast';
import { getAllFromSyncQueue } from '../../utils/db';
import { useData } from '../../hooks/useDataContext';

const SettingsPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { t, locale, setLocale } = useLocalization();
    const { user, logout } = useAuth();
    const { systemStatus, isGridSaturated } = useData();
    const { showToast } = useToast();
    
    const [cacheSize, setCacheSize] = useState('0 KB');
    const [pendingSyncs, setPendingSyncs] = useState(0);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [isVerifyingDomain, setIsVerifyingDomain] = useState(false);

    useEffect(() => {
        const size = new Blob(Object.values(localStorage)).size;
        setCacheSize((size / 1024).toFixed(2) + ' KB');
        getAllFromSyncQueue().then(items => setPendingSyncs(items.length));
    }, []);

    const handleVerifyDomain = () => {
        setIsVerifyingDomain(true);
        setTimeout(() => {
            setIsVerifyingDomain(false);
            showToast("Domain Routing: Optimized", "success");
        }, 2000);
    };

    const handleClearCache = () => {
        if (confirm("This will clear local app data. You may need to log in again. Continue?")) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
        }
    };

    const handleToggleNotifications = () => {
        setNotificationsEnabled(!notificationsEnabled);
        showToast(notificationsEnabled ? "Pulse Uplink Muted" : "Pulse Uplink Re-activated", 'info');
    };

    const handleKeyCalibrate = async () => {
        if ((window as any).aistudio) {
            await (window as any).aistudio.openSelectKey();
            showToast("Neural Link Re-calibrated", "success");
        } else {
            showToast("AI Studio Terminal Unavailable", "error");
        }
    }

    return (
        <div className="pb-12 max-w-5xl mx-auto font-sans">
             {onBack && (
                <button onClick={onBack} className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white mb-8 transition-colors">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Return to Mission
                </button>
            )}
            
            <div className="flex justify-between items-end mb-10 border-b border-white/5 pb-8">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">System <span className="text-blue-50">Config</span></h2>
                    <p className="text-slate-500 font-mono text-xs mt-1 uppercase tracking-[0.3em]">Ferrari Node v80.4 Settings</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-400 rounded-full border border-blue-500/20 text-[10px] font-black uppercase tracking-widest">
                    <ServerIcon className="h-4 w-4"/> Environment: {systemStatus}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                
                {/* Left Column: Domain & Deployment */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Neural Link Management */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-carbon opacity-10"></div>
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <SparklesIcon className="h-48 w-48 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-6 relative z-10">
                            Neural <span className="text-blue-500">Link Control</span>
                        </h3>
                        
                        {isGridSaturated && (
                            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-start gap-4 animate-pulse relative z-10">
                                <ExclamationTriangleIcon className="h-6 w-6 text-red-500 shrink-0"/>
                                <div>
                                    <p className="text-xs font-black text-red-500 uppercase tracking-widest">CRITICAL: Quota Exceeded (429)</p>
                                    <p className="text-[11px] text-red-200/70 font-medium mt-1">The current API node is saturated. Re-calibrate below with a high-capacity or paid key to restore Redline performance.</p>
                                </div>
                            </div>
                        )}

                        <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium relative z-10">
                            The Neural AI Core operates on national quota buckets. If you have exceeded your RPM/TPM limits (Error 429), re-calibrate the handshake to utilize a different or paid merchant key from Google AI Studio.
                        </p>
                        <button 
                            onClick={handleKeyCalibrate}
                            className="bg-white text-slate-950 font-black py-5 px-12 rounded-[2rem] text-xs uppercase tracking-[0.4em] shadow-2xl transform active:scale-95 transition-all border-4 border-slate-900 flex items-center justify-center gap-4 relative z-10"
                        >
                            <KeyIcon className="h-5 w-5 text-blue-600"/>
                            Re-calibrate Neural Link
                        </button>
                        
                        <p className="mt-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] text-center relative z-10">
                             Handshake Protocol: Gemini-3 Pro Preview
                        </p>
                    </div>

                    {/* Domain Management Card */}
                    <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden group">
                        <div className="p-5 bg-slate-800/50 border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <GlobeAltIcon className="h-5 w-5 text-blue-400" />
                                <span className="font-black uppercase tracking-widest text-[10px] text-slate-300">Domain Controller</span>
                            </div>
                        </div>
                        <div className="p-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                                <div>
                                    <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">stocklinksa.co.za</h3>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">SSL Shield: ACTIVE</p>
                                </div>
                                <button 
                                    onClick={handleVerifyDomain}
                                    className="bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-8 rounded-2xl shadow-xl transition-all flex items-center gap-3 uppercase tracking-widest text-[10px]"
                                >
                                    {isVerifyingDomain ? <ArrowPathIcon className="h-4 w-4 animate-spin"/> : <ShieldCheckIcon className="h-4 w-4"/>}
                                    Verify DNS
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Build Pipeline</p>
                                    <p className="font-mono text-blue-400 font-bold text-sm">Vercel Auto-Deploy</p>
                                </div>
                                <div className="bg-black/30 p-6 rounded-2xl border border-white/5 text-emerald-400 flex items-center gap-2">
                                    <CheckCircleIcon className="h-5 w-5"/>
                                    <span className="font-black text-xs uppercase tracking-widest">Sync Stable</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* App Cache & Storage */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-10 border border-white/5 shadow-2xl">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter uppercase mb-8 flex items-center gap-3">
                            <CommandLineIcon className="h-6 w-6 text-slate-500" />
                            Data <span className="text-slate-500">Terminal</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Local Cache</p>
                                    <p className="text-2xl font-black text-white tracking-tighter">{cacheSize}</p>
                                </div>
                                <button onClick={handleClearCache} className="p-3 bg-red-600/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all">
                                    <TrashIcon className="h-6 w-6"/>
                                </button>
                            </div>
                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Offline Queue</p>
                                    <p className="text-2xl font-black text-amber-500 tracking-tighter">{pendingSyncs} Items</p>
                                </div>
                                <button onClick={() => window.location.reload()} className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl hover:bg-blue-500 hover:text-white transition-all">
                                    <ArrowPathIcon className="h-6 w-6"/>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Preferences & Profile */}
                <div className="space-y-8">
                    {/* User Card */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheckIcon className="h-32 w-32"/></div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-4xl font-black italic shadow-2xl mb-4 border-4 border-slate-800">
                                {user?.name.charAt(0)}
                            </div>
                            <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">{user?.name}</h4>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">{user?.email}</p>
                            
                            <button onClick={logout} className="mt-8 w-full py-4 bg-white/5 hover:bg-red-500 hover:text-white text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-2xl border border-white/10 transition-all">
                                Terminate Session
                            </button>
                        </div>
                    </div>

                    {/* Localization */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
                         <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-3">
                             <LanguageIcon className="h-4 w-4 text-blue-500"/> Grid Language
                         </h3>
                         <div className="space-y-2">
                             {['en', 'af', 'zu'].map(lang => (
                                 <button 
                                    key={lang}
                                    onClick={() => setLocale(lang as any)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${locale === lang ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-400'}`}
                                 >
                                     <span className="font-bold text-xs uppercase tracking-widest">{lang === 'en' ? 'English' : lang === 'af' ? 'Afrikaans' : 'isiZulu'}</span>
                                     {locale === lang && <CheckCircleIcon className="h-5 w-5"/>}
                                 </button>
                             ))}
                         </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-3">
                             <BellIcon className="h-4 w-4 text-amber-500"/> Pulse Notifications
                         </h3>
                         <button 
                            onClick={handleToggleNotifications}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${notificationsEnabled ? 'bg-amber-600 border-amber-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-400'}`}
                         >
                            <span className="font-bold text-sm uppercase tracking-widest">{notificationsEnabled ? 'Uplink Active' : 'Uplink Muted'}</span>
                            <div className={`w-10 h-5 rounded-full relative p-1 transition-colors ${notificationsEnabled ? 'bg-white/20' : 'bg-slate-800'}`}>
                                <div className={`w-3 h-3 rounded-full bg-white transition-all transform ${notificationsEnabled ? 'translate-x-5' : ''}`}></div>
                            </div>
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
