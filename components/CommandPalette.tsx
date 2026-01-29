
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useData } from '../hooks/useDataContext';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { 
    MagnifyingGlassIcon, 
    BriefcaseIcon, 
    ShoppingCartIcon, 
    CubeIcon, 
    ArrowRightIcon, 
    PlusIcon, 
    BanknotesIcon,
    HomeIcon,
    ChartBarIcon,
    CommandLineIcon,
    CalculatorIcon,
    WrenchIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

type ResultType = 'page' | 'action' | 'project' | 'order' | 'product';

interface SearchResult {
    id: string;
    type: ResultType;
    title: string;
    subtitle?: string;
    icon: React.ElementType;
    action: () => void;
    keywords?: string[];
    colorClass?: string;
}

const CommandPalette: React.FC = () => {
    const { t } = useLocalization();
    const { projects, orders, products, isGridSaturated } = useData();
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const navigate = (path: string) => {
        window.location.hash = path;
        setIsOpen(false);
    };

    // Toggle Logic
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        const handleCustomOpen = () => setIsOpen(true);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('open-command-palette', handleCustomOpen);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('open-command-palette', handleCustomOpen);
        };
    }, []);

    // Auto-focus input
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Generate Search Results
    const results = useMemo<SearchResult[]>(() => {
        if (!user) return [];
        const role = user.role;
        const list: SearchResult[] = [];

        // 1. Navigation Pages (Role Based)
        list.push({ id: 'nav-home', type: 'page', title: t('navHome'), icon: HomeIcon, colorClass: 'bg-blue-100 text-blue-600', action: () => navigate('#/home') });
        list.push({ id: 'nav-dashboard', type: 'page', title: t('navDashboard'), icon: ChartBarIcon, colorClass: 'bg-purple-100 text-purple-600', action: () => navigate('#/dashboard') });
        
        if (role === UserRole.Contractor) {
            list.push({ id: 'act-create-project', type: 'action', title: t('createNewProject'), icon: PlusIcon, colorClass: 'bg-green-100 text-green-600', action: () => navigate('#/projects') });
            list.push({ id: 'act-est', type: 'action', title: t('navCostEstimator'), icon: CalculatorIcon, colorClass: 'bg-orange-100 text-orange-600', action: () => navigate('#/cost-estimator') });
            list.push({ id: 'act-req-stock', type: 'action', title: t('rfsCreateNewRequest'), icon: PlusIcon, colorClass: 'bg-teal-100 text-teal-600', action: () => navigate('#/stock-requests') });

            list.push({ id: 'nav-projects', type: 'page', title: t('navMyProjects'), icon: BriefcaseIcon, colorClass: 'bg-gray-100 text-gray-600', action: () => navigate('#/projects') });
            list.push({ id: 'nav-orders', type: 'page', title: t('navMyOrders'), icon: ShoppingCartIcon, colorClass: 'bg-gray-100 text-gray-600', action: () => navigate('#/orders') });
        }

        if (role === UserRole.Supplier || role === UserRole.Logistics) {
            list.push({ id: 'nav-workshop', type: 'page', title: 'Fleet Workshop', icon: WrenchIcon, colorClass: 'bg-red-100 text-red-600', action: () => navigate('#/workshop') });
            list.push({ id: 'act-add-prod', type: 'action', title: 'Add New Product', icon: PlusIcon, colorClass: 'bg-green-100 text-green-600', action: () => navigate('#/products') });
            list.push({ id: 'nav-orders', type: 'page', title: t('navOrderManagement'), icon: ShoppingCartIcon, colorClass: 'bg-gray-100 text-gray-600', action: () => navigate('#/orders') });
            list.push({ id: 'nav-products', type: 'page', title: t('navProductManagement'), icon: CubeIcon, colorClass: 'bg-gray-100 text-gray-600', action: () => navigate('#/products') });

            // Supplier Data
            products.filter(p => p.supplierId === user.id).forEach(p => {
                list.push({
                    id: `prod-${p.id}`,
                    type: 'product',
                    title: p.name,
                    subtitle: `${p.stock} in stock`,
                    icon: CubeIcon,
                    colorClass: 'bg-orange-50 text-orange-600',
                    action: () => navigate('#/products')
                });
            });
        }

        return list;
    }, [user, projects, orders, products, t]);

    const filteredResults = useMemo(() => {
        if (!query) return results.slice(0, 8); 
        const lowerQuery = query.toLowerCase();
        return results.filter(item => 
            item.title.toLowerCase().includes(lowerQuery) || 
            item.subtitle?.toLowerCase().includes(lowerQuery)
        ).slice(0, 15);
    }, [query, results]);

    // Keyboard Navigation
    useEffect(() => {
        const handleNav = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(i => (i + 1) % filteredResults.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(i => (i - 1 + filteredResults.length) % filteredResults.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredResults[selectedIndex]) {
                    filteredResults[selectedIndex].action();
                }
            }
        };
        window.addEventListener('keydown', handleNav);
        return () => window.removeEventListener('keydown', handleNav);
    }, [isOpen, filteredResults, selectedIndex]);

    // Scroll into view
    useEffect(() => {
        if (listRef.current && filteredResults.length > 0) {
            const selectedEl = listRef.current.children[selectedIndex] as HTMLElement;
            if (selectedEl) {
                selectedEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex, filteredResults]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[12vh] px-4 transition-opacity duration-200">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-fade-in-scale border border-white/20 ring-1 ring-black/5">
                <div className="relative border-b border-gray-200/50">
                    <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
                        placeholder="What do you need to do?"
                        className="w-full p-5 pl-14 text-lg bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 font-medium"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                        {isGridSaturated && (
                             <div className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-full animate-pulse mr-2">
                                <ExclamationTriangleIcon size={12} />
                                <span className="text-[10px] font-black uppercase">OVERLOAD</span>
                            </div>
                        )}
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded border border-gray-200 uppercase">ESC</span>
                    </div>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto py-2" ref={listRef}>
                    {filteredResults.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <CommandLineIcon className="h-12 w-12 mx-auto mb-3 opacity-20"/>
                            <p className="font-medium">No results found.</p>
                            <p className="text-xs mt-1">Try searching for pages, actions, or data.</p>
                        </div>
                    ) : (
                        filteredResults.map((result, index) => {
                            const Icon = result.icon;
                            const isActive = index === selectedIndex;
                            return (
                                <div
                                    key={result.id}
                                    onClick={result.action}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={`px-4 py-3 mx-2 rounded-xl flex items-center gap-4 cursor-pointer transition-all duration-150 ${isActive ? 'bg-primary text-white shadow-md scale-[1.01]' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20 text-white' : (result.colorClass || 'bg-gray-100 text-gray-500')}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <p className={`text-sm font-bold ${isActive ? 'text-white' : 'text-gray-800'}`}>{result.title}</p>
                                        {result.subtitle && <p className={`text-xs truncate ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>{result.subtitle}</p>}
                                    </div>
                                    <ArrowRightIcon className={`h-4 w-4 transition-all ${isActive ? 'text-white translate-x-0' : 'text-transparent -translate-x-4'}`} />
                                    {result.type === 'action' && !isActive && <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">Action</span>}
                                </div>
                            );
                        })
                    )}
                </div>
                
                <div className="bg-gray-50/80 px-5 py-3 border-t border-gray-200/50 flex justify-between items-center text-xs text-gray-500 font-medium backdrop-blur-md">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1"><span className="bg-gray-200 px-1.5 rounded text-[10px]">↑↓</span> to navigate</span>
                        <span className="flex items-center gap-1"><span className="bg-gray-200 px-1.5 rounded text-[10px]">↵</span> to select</span>
                    </div>
                    <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full animate-pulse ${isGridSaturated ? 'bg-red-600' : 'bg-green-500'}`}></span> StockLink AI {isGridSaturated ? 'Cooling' : 'Ready'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
