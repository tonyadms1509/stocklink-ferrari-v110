import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useData } from '../hooks/useDataContext';
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
    action?: () => void;
}

interface NavGroup {
    title: string;
    items: NavItem[];
}

interface DashboardLayoutProps {
    activeTab: string;
    onNavigate: (tabId: string) => void;
    navGroups: NavGroup[];
    mobileNavItems: NavItem[];
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
    activeTab, 
    onNavigate, 
    navGroups, 
    mobileNavItems,
    children 
}) => {
    const { t } = useLocalization();
    const { isRuggedMode } = useData();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openSections, setOpenSections] = useState<string[]>(navGroups.map(g => g.title));

    // Force aggressive scroll to top on tab change to prevent "blank spot" experience
    useEffect(() => {
        // Reset scroll for both window and root element for cross-browser safety
        window.scrollTo(0, 0);
        document.documentElement.scrollTo(0, 0);
    }, [activeTab]);

    useEffect(() => {
        const handleToggleMenu = () => setIsMobileMenuOpen(prev => !prev);
        document.addEventListener('toggle-mobile-menu', handleToggleMenu);
        return () => document.removeEventListener('toggle-mobile-menu', handleToggleMenu);
    }, []);

    const handleToggleSection = (title: string) => {
        setOpenSections(prev => prev.includes(title) ? prev.filter(s => s !== title) : [...prev, title]);
    };

    const handleNavigate = (id: string) => {
        if (id === 'menu') {
             setIsMobileMenuOpen(true);
             return;
        }
        onNavigate(id);
        setIsMobileMenuOpen(false);
    };

    const renderNavLinks = () => (
        <nav className="space-y-4">
            {navGroups.map(group => {
                const isOpen = openSections.includes(group.title);
                return (
                    <div key={group.title} className="py-2">
                        <button 
                            onClick={() => handleToggleSection(group.title)} 
                            className={`w-full flex items-center justify-between p-2 rounded-md text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isRuggedMode ? 'text-black border-b-2 border-black' : 'text-slate-400 hover:text-white'}`}
                        >
                            <span>{group.title}</span>
                            <ChevronDownIcon className={`h-3 w-3 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                            <ul className="mt-2 space-y-1">
                                {group.items.map(item => (
                                    <li key={item.id} className="relative">
                                        <button
                                            onClick={() => handleNavigate(item.id)}
                                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold tracking-tight transition-all duration-300 group ${
                                                activeTab === item.id
                                                    ? isRuggedMode ? 'bg-black text-white shadow-lg' : 'text-white bg-red-600/10'
                                                    : isRuggedMode ? 'text-slate-700 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            <item.icon className={`h-5 w-5 flex-shrink-0 transition-all duration-300 ${activeTab === item.id ? isRuggedMode ? 'text-white' : 'text-red-600 drop-shadow-[0_0_8px_rgba(220,0,0,0.5)] scale-110' : 'text-slate-500 group-hover:text-white'}`} />
                                            <span className="flex-grow text-left truncate uppercase tracking-widest">{item.label}</span>
                                            {activeTab === item.id && !isRuggedMode && (
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-600 rounded-l-full shadow-[0_0_10px_red]"></div>
                                            )}
                                            {!!item.badge && item.badge > 0 && (
                                                <span className={`text-[10px] font-black rounded-lg px-1.5 py-0.5 shadow-lg ${isRuggedMode ? 'bg-black text-white border border-white' : 'bg-red-600 text-white'}`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                );
            })}
        </nav>
    );

    return (
        <div className={`flex flex-col lg:flex-row gap-8 relative pb-24 lg:pb-0 min-h-[calc(100vh-4rem)] ${isRuggedMode ? 'rugged-theme' : ''}`}>
            {/* Mobile Header HUD */}
            <div className={`lg:hidden mb-4 flex justify-between items-center p-4 rounded-2xl shadow-xl mx-4 mt-4 border transition-all ${isRuggedMode ? 'bg-white border-black border-[3px]' : 'bg-slate-900 border-white/5'}`}>
                <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${isRuggedMode ? 'bg-black' : 'bg-red-600 shadow-[0_0_10px_red]'}`}></div>
                    <span className={`font-black text-[10px] uppercase tracking-[0.3em] truncate ${isRuggedMode ? 'text-black' : 'text-white'}`}>
                        {activeTab.replace('-', ' ')}
                    </span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(true)} className={`p-2 rounded-xl ${isRuggedMode ? 'bg-slate-100 text-black border-black border-2' : 'text-slate-400 hover:text-white bg-white/5'}`}>
                    <Bars3Icon className="h-6 w-6"/>
                </button>
            </div>

            {/* Mobile Bottom HUD Bar */}
            <div className={`lg:hidden fixed bottom-6 left-6 right-6 h-16 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-[2rem] flex items-center justify-around z-50 px-4 ring-1 ring-white/5 transition-all ${isRuggedMode ? 'bg-white border-black border-[3px]' : 'bg-slate-900/90 backdrop-blur-3xl border-white/10'}`}>
                {mobileNavItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={item.action || (() => handleNavigate(item.id))}
                        className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-500 ${activeTab === item.id && !item.action ? 'text-red-600' : 'text-slate-500'}`}
                    >
                        <div className={`p-2 rounded-xl transition-all duration-500 ${activeTab === item.id && !item.action ? isRuggedMode ? 'bg-black text-white scale-125' : 'bg-red-600/10 scale-125' : ''}`}>
                            <item.icon className="h-6 w-6" />
                        </div>
                        {activeTab === item.id && !isRuggedMode && <div className="absolute -bottom-1 w-1 h-1 bg-red-600 rounded-full shadow-[0_0_5px_red]"></div>}
                    </button>
                ))}
            </div>

            {/* Sidebar Overlay (Mobile) */}
            <div className={`fixed inset-0 z-[60] lg:hidden ${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                <div className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMobileMenuOpen(false)} />
                <aside className={`absolute top-0 left-0 bottom-0 w-80 shadow-[0_0_100px_rgba(0,0,0,0.9)] transform transition-transform duration-500 ease-in-out flex flex-col border-r ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} ${isRuggedMode ? 'bg-white border-black' : 'bg-slate-950 border-white/5'}`}>
                    <div className="absolute inset-0 bg-carbon opacity-5 pointer-events-none"></div>
                    <div className={`p-8 border-b flex justify-between items-center relative z-10 ${isRuggedMode ? 'border-black' : 'border-white/5'}`}>
                        <h2 className={`text-2xl font-black italic uppercase tracking-tighter ${isRuggedMode ? 'text-black' : 'text-white'}`}>GRID <span className="text-red-600">LINKS</span></h2>
                        <button onClick={() => setIsMobileMenuOpen(false)} className={`p-2 rounded-xl transition-colors ${isRuggedMode ? 'bg-slate-100 text-black border-black border-2' : 'text-slate-500 hover:text-white bg-white/5'}`}>
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="overflow-y-auto flex-1 p-6 pb-32 custom-scrollbar relative z-10">
                        {renderNavLinks()}
                    </div>
                </aside>
            </div>

            {/* Desktop Side Nav */}
            <div className="hidden lg:block w-72 flex-shrink-0 animate-fade-in">
                <aside className={`sticky top-28 w-full rounded-[3rem] border overflow-hidden shadow-2xl transition-all duration-700 ${isRuggedMode ? 'bg-white border-black border-[3px]' : 'bg-slate-900/50 backdrop-blur-2xl border-white/5'}`}>
                    <div className="absolute inset-0 bg-carbon opacity-5 pointer-events-none"></div>
                    <div className={`p-5 text-[10px] font-black uppercase tracking-[0.4em] text-center relative z-10 border-b ${isRuggedMode ? 'bg-slate-100 border-black text-black' : 'bg-slate-950 border-white/5 text-slate-500'}`}>Registry Hub</div>
                    <div className="p-4 custom-scrollbar max-h-[calc(100vh-12rem)] overflow-y-auto relative z-10">
                        {renderNavLinks()}
                    </div>
                </aside>
            </div>

            {/* Main Content Area */}
            <div id="main-content-scroll-target" className="flex-1 min-w-0 pb-20 lg:pb-0">
                {children}
            </div>
        </div>
    );
};

export default DashboardLayout;