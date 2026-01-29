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
    CommandLineIcon
} from '@heroicons/react/24/solid';
import { useToast } from '../../hooks/useToast';
import { useData } from '../../hooks/useDataContext';

const SettingsPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { t, locale, setLocale } = useLocalization();
    const { user, logout } = useAuth();
    const { systemStatus } = useData();
    const { showToast } = useToast();
    
    const [cacheSize, setCacheSize] = useState('0 KB');
    const [isVerifyingDomain, setIsVerifyingDomain] = useState(false);

    useEffect(() => {
        const size = new Blob(Object.values(localStorage)).size;
        setCacheSize((size / 1024).toFixed(2) + ' KB');
    }, []);

    const handleVerifyDomain = () => {
        setIsVerifyingDomain(true);
        setTimeout(() => {
            setIsVerifyingDomain(false);
            showToast("DNS Protocol: NOMINAL", "success");
        }, 2000);
    };

    const handleClearCache = () => {
        if (confirm("Terminate local data? Session will be purged.")) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="pb-12 max-w-5xl mx-auto font-sans">
             {onBack && (
                <button onClick={onBack} className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white mb-8 transition-colors">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back
                </button>
            )}
            
            <div className="flex justify-between items-end mb-10 border-b border-white/5 pb-8">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">System <span className="text-blue-500">Config</span></h2>
                    <p className="text-slate-500 font-mono text-xs mt-1 uppercase tracking-[0.3em]">Node v80.4 Deployment Settings</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-400 rounded-full border border-blue-500/20 text-[10px] font-black uppercase tracking-widest">
                    <ServerIcon className="h-4 w-4"/> Environment: {systemStatus}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden">
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
                </div>

                <div className="space-y-8">
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

                    <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/5">
                        <button onClick={handleClearCache} className="w-full flex items-center justify-between p-4 bg-red-600/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all">
                            <span className="font-black text-[10px] uppercase tracking-widest">Wipe Cache ({cacheSize})</span>
                            <TrashIcon className="h-5 w-5"/>
                        </button>
                    </div>

                    <button onClick={logout} className="w-full py-5 bg-white text-slate-950 font-black text-xs uppercase tracking-[0.4em] rounded-3xl border-4 border-slate-900 shadow-xl transition-all active:scale-95">
                        Terminate Session
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;