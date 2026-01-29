import React, { useState, useRef, useEffect } from 'react';
import { UserRole, Currency } from '../types';
import { 
    BuildingStorefrontIcon, 
    WrenchScrewdriverIcon, 
    BellIcon, 
    TruckIcon,
    PowerIcon,
    SunIcon,
    BanknotesIcon,
    ShieldExclamationIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import { useData } from '../hooks/useDataContext';
import { useAuth } from '../hooks/useAuth';
import NotificationPanel from './NotificationPanel';
import { useCurrency } from '../hooks/useCurrency';
import OfflineIndicator from './OfflineIndicator';
import Logo from './Logo';

const Header: React.FC = () => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [switchingRole, setSwitchingRole] = useState<UserRole | null>(null);
  const { notifications, isRuggedMode, toggleRuggedMode } = useData();
  const { user, switchAccount, currentCompany, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
            setIsNotificationsOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user || !currentCompany) return null;
  const activeRole = user.role;
  const unreadCount = (notifications || []).filter(n => n.recipientId === currentCompany.id && !n.isRead).length;

  const handleRoleSwitch = async (role: UserRole) => {
    if (role === activeRole) return;
    setSwitchingRole(role);
    await switchAccount(role);
    setSwitchingRole(null);
  };

  const handleCurrencyToggle = () => {
    const currencies = Object.values(Currency);
    const currentIndex = currencies.indexOf(currency);
    const nextIndex = (currentIndex + 1) % currencies.length;
    setCurrency(currencies[nextIndex]);
  };

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

          {/* Core Sector Switcher */}
          <div className={`hidden lg:flex items-center p-1 rounded-3xl border transition-all ${isRuggedMode ? 'bg-slate-100 border-black' : 'bg-white/5 border-white/5 shadow-inner'}`}>
              {[
                { role: UserRole.Contractor, icon: WrenchScrewdriverIcon, label: 'Contractor' },
                { role: UserRole.Supplier, icon: BuildingStorefrontIcon, label: 'Supplier' },
                { role: UserRole.Logistics, icon: TruckIcon, label: 'Logistics' },
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
                <button 
                    onClick={handleCurrencyToggle}
                    className={`px-4 py-2.5 rounded-xl border font-black text-xs transition-all ${isRuggedMode ? 'bg-white border-black text-black' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'}`}
                >
                    <BanknotesIcon className={`h-5 w-5 mb-1 mx-auto ${isRuggedMode ? 'text-black' : 'text-slate-400'}`} />
                    {currency}
                </button>

                <button 
                    onClick={toggleRuggedMode}
                    className={`p-4 rounded-xl border transition-all ${isRuggedMode ? 'bg-black border-black text-white' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}
                >
                    <SunIcon className={`h-5 w-5 ${isRuggedMode ? 'animate-spin-slow text-white' : 'text-slate-400'}`} />
                </button>
                
                <div className="relative" ref={notificationRef}>
                    <button 
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
                        className={`p-4 rounded-xl border transition-all relative ${isRuggedMode ? 'bg-white border-black text-black' : isNotificationsOpen ? 'text-red-500 border-red-600/30 bg-white/10' : 'text-slate-400 border-white/5 hover:bg-white/10'}`}
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
      </div>
    </header>
  );
};

export default Header;