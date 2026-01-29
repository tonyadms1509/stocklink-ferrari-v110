
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UserRole, Currency } from '../types.ts';
import { 
    BellIcon, 
    PowerIcon,
    SunIcon,
    BanknotesIcon,
    ShieldExclamationIcon,
    ChevronDownIcon,
    CheckCircleIcon,
    PresentationChartLineIcon,
} from '@heroicons/react/24/outline/index.js';
import { 
    Wrench, 
    Store,
    RefreshCw,
    Smartphone,
    Minimize2,
    Truck,
    Activity,
    ShieldAlert
} from 'lucide-react';
import { useData } from '../hooks/useDataContext.tsx';
import { useAuth } from '../hooks/useAuth.tsx';
import NotificationPanel from './NotificationPanel.tsx';
import { useCurrency } from '../hooks/useCurrency.tsx';
import OfflineIndicator from './OfflineIndicator.tsx';
import Logo from './Logo.tsx';
import { useToast } from '../hooks/useToast.tsx';

const Header: React.FC = () => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const [switchingRole, setSwitchingRole] = useState<UserRole | null>(null);
  const { notifications, isRuggedMode, toggleRuggedMode, isGridSaturated, refreshData } = useData();
  const { user, switchAccount, currentCompany, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const { showToast } = useToast();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
            setIsNotificationsOpen(false);
        }
        if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
            setIsCurrencyOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFsChange = useCallback(() => {
    setIsFullscreen(!!document.fullscreenElement);
  }, []);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [handleFsChange]);

  if (!user || !currentCompany) return null;
  const activeRole = user.role;
  const unreadCount = (notifications || []).filter(n => n.recipientId === currentCompany.id && !n.isRead).length;

  const handleSync = async () => {
    if (isSyncing || isGridSaturated) return;
    setIsSyncing(true);
    try {
        const success = await refreshData();
        if (!success) {
             showToast("Grid Handshake Distorted. Retry suggested.", "warning");
        }
    } catch (e) {
        showToast("Synchronisation Buffer Error", "error");
    } finally {
        setIsSyncing(false);
    }
  };

  const toggleFullscreen = async () => {
    try {
        if (!document.fullscreenElement) {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                await elem.requestFullscreen();
            }
            showToast("Device HUD Optimised", "success");
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            }
        }
    } catch (err) {
        showToast("HUD override restricted.", "warning");
    }
  };

  const handleRoleSwitch = async (role: UserRole) => {
    if (role === activeRole) return;
    setSwitchingRole(role);
    await switchAccount(role);
    setSwitchingRole(null);
  };

  const currencyOptions = [
    { code: Currency.ZAR, name: 'Rand', region: 'South Africa' },
    { code: Currency.USD, name: 'Dollar', region: 'United States' },
    { code: Currency.EUR, name: 'Euro', region: 'European Union' },
    { code: Currency.GBP, name: 'Pound', region: 'United Kingdom' },
  ];

  return (
    <header className={`sticky top-0 z-[100] border-b transition-all duration-700 ${isRuggedMode ? 'bg-white border-black border-b-[4px]' : 'bg-slate-950/90 border-white/5 backdrop-blur-3xl shadow-2xl'}`}>
      <div className="w-full px-8 md:px-12">
        <div className="flex items-center justify-between h-24">
          
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-6 cursor-pointer group" onClick={() => window.location.hash = '#/'}>
                <Logo className={`h-16 w-auto transition-all duration-500 group-hover:scale-110 ${!isRuggedMode && 'drop-shadow-[0_0_30px_rgba(220,0,0,0.4)]'}`} />
                <div className="hidden lg:block text-left">
                    <h1 className={`text-4xl font-black tracking-tighter uppercase italic leading-none ${isRuggedMode ? 'text-black' : 'text-white'}`}>StockLink</h1>
                    {!isRuggedMode && (
                        <div className="flex items-center gap-1.5 px-3 py-0.5 bg-red-600/10 text-red-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-500/20 italic mt-2">
                            REDLINE <span className="text-white">v110.0</span>
                        </div>
                    )}
                </div>
            </div>
          </div>

          <div className={`hidden lg:flex items-center p-1 rounded-3xl border transition-all ${isRuggedMode ? 'bg-slate-100 border-black' : 'bg-white/5 border-white/5 shadow-inner'}`}>
              {[
                { role: UserRole.Contractor, icon: Wrench, label: 'Contractor' },
                { role: UserRole.Supplier, icon: Store, label: 'Supplier' },
                { role: UserRole.Logistics, icon: Truck, label: 'Logistics' },
                { role: UserRole.Marketer, icon: PresentationChartLineIcon, label: 'Sales' },
                { role: UserRole.Admin, icon: ShieldExclamationIcon, label: 'Admin' },
              ].map((item) => (
                <button
                  key={item.role}
                  onClick={() => handleRoleSwitch(item.role)}
                  disabled={switchingRole === item.role}
                  className={`px-6 py-2.5 rounded-2xl flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                    activeRole === item.role 
                      ? isRuggedMode ? 'bg-black text-white shadow-lg' : 'bg-red-600 text-white shadow-xl scale-105' 
                      : isRuggedMode ? 'text-slate-700 hover:text-black hover:bg-white' : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden xl:inline">{item.label}</span>
                </button>
              ))}
          </div>
          
          <div className="flex items-center space-x-6">
            <OfflineIndicator />
            
            <div className="flex items-center gap-3">
                {/* Grid Health Pulse */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${isGridSaturated ? 'bg-red-600/10 border-red-500 text-red-500 animate-pulse' : 'bg-emerald-600/10 border-emerald-500 text-emerald-500'}`}>
                    {isGridSaturated ? <ShieldAlert size={14}/> : <Activity size={14}/>}
                    <span className="text-[9px] font-black uppercase tracking-widest">{isGridSaturated ? 'Saturated' : 'Nominal'}</span>
                </div>

                <div className="relative" ref={currencyRef}>
                    <button 
                        onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                        className={`px-6 py-2.5 rounded-xl border font-black text-xs transition-all flex items-center gap-3 shadow-xl ${isRuggedMode ? 'bg-white border-black text-black' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'}`}
                    >
                        <BanknotesIcon className={`h-5 w-5 ${isRuggedMode ? 'text-black' : 'text-slate-400'}`} />
                        <span className="leading-none uppercase tracking-widest">{currency}</span>
                        <ChevronDownIcon className={`h-3 w-3 transition-transform duration-300 ${isCurrencyOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isCurrencyOpen && (
                        <div className={`absolute right-0 mt-3 w-64 rounded-3xl shadow-2xl border p-4 z-[150] animate-fade-in-scale backdrop-blur-3xl overflow-hidden ${isRuggedMode ? 'bg-white border-black border-[3px]' : 'bg-slate-900 border-white/10'}`}>
                            <div className="absolute inset-0 bg-carbon opacity-5 pointer-events-none"></div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 ml-2 text-left">Settlement Tier</p>
                            <div className="space-y-1">
                                {currencyOptions.map((opt) => (
                                    <button
                                        key={opt.code}
                                        onClick={() => { setCurrency(opt.code); setIsCurrencyOpen(false); }}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${currency === opt.code ? 'bg-red-600 text-white shadow-xl' : isRuggedMode ? 'hover:bg-slate-100 text-black' : 'hover:bg-white/5 text-slate-400'}`}
                                    >
                                        <div className="text-left">
                                            <p className="text-xs font-black uppercase tracking-widest">{opt.code}</p>
                                            <p className={`text-[10px] font-bold ${currency === opt.code ? 'text-red-200' : 'text-slate-300'}`}>{opt.name} • {opt.region}</p>
                                        </div>
                                        {currency === opt.code && <CheckCircleIcon className="h-5 w-5" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <button 
                    onClick={handleSync}
                    disabled={isGridSaturated}
                    className={`p-4 rounded-xl border transition-all shadow-xl group ${isSyncing ? 'animate-pulse' : ''} ${isGridSaturated ? 'opacity-30 cursor-not-allowed' : ''} ${isRuggedMode ? 'bg-white border-black text-black' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}
                    title={isGridSaturated ? "Grid Cooling: Manual Sync Locked" : "Manual Grid Sync"}
                >
                    <RefreshCw className={`h-5 w-5 transition-transform duration-500 ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                </button>

                <button 
                    onClick={toggleFullscreen}
                    className={`p-4 rounded-xl border transition-all shadow-xl group ${isRuggedMode ? 'bg-white border-black text-black' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}
                    title="Toggle Device HUD"
                >
                    {isFullscreen ? <Minimize2 className="h-5 w-5 text-red-600" /> : <Smartphone className="h-5 w-5 group-hover:scale-110 transition-transform" />}
                </button>

                <button 
                    onClick={toggleRuggedMode}
                    className={`p-4 rounded-xl border transition-all shadow-xl transition-colors duration-500 ${isRuggedMode ? 'bg-black border-black text-white' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}
                    title="Aero Sunlight Optimisation"
                >
                    <SunIcon className={`h-5 w-5 transition-all duration-700 ${isRuggedMode ? 'animate-sunlight scale-125' : 'text-slate-400'}`} />
                </button>
                
                <div className="relative" ref={notificationRef}>
                    <button 
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
                        className={`p-4 rounded-xl border transition-all relative shadow-xl ${isRuggedMode ? 'bg-white border-black text-black' : isNotificationsOpen ? 'text-red-500 border-red-600/30 bg-white/10' : 'text-slate-400 border-white/5 hover:bg-white/10'}`}
                    >
                        <BellIcon className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 flex h-4 w-4">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRuggedMode ? 'bg-red-600' : 'bg-red-400'}`}></span>
                                <span className={`relative inline-flex rounded-full h-4 w-4 text-[8px] items-center justify-center font-black ${isRuggedMode ? 'bg-black text-white' : 'bg-red-600 text-white'}`}>
                                    {unreadCount}
                                </span>
                            </span>
                        )}
                    </button>
                    {isNotificationsOpen && <NotificationPanel companyId={currentCompany.id} onClose={() => setIsNotificationsOpen(false)} />}
                </div>
            </div>

            <div className={`flex items-center gap-6 pl-6 border-l ${isRuggedMode ? 'border-black' : 'border-white/10'}`}>
                <div className="hidden sm:block text-right">
                    <p className={`text-sm font-black uppercase italic tracking-tighter leading-none ${isRuggedMode ? 'text-black' : 'text-white'}`}>{user.name}</p>
                    <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${isRuggedMode ? 'text-black font-bold' : 'text-red-600'}`}>Operator Node</p>
                </div>
                <button 
                    onClick={() => logout()} 
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all transform active:scale-90 shadow-xl ${isRuggedMode ? 'bg-white border-black text-black' : 'bg-white/5 border-white/5 hover:bg-red-600 hover:text-white'}`}
                >
                    <PowerIcon className="h-6 w-6" />
                </button>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
