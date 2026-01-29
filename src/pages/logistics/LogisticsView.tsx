
import React, { useState, useMemo } from 'react';
import { LogisticsTab } from '../../types';
import DashboardLayout from '../../components/DashboardLayout';
import { 
    Truck, BarChart, Map, Package, Sparkles, Settings, CreditCard, Users, 
    Zap, Globe, Gift, ArrowRight, Activity, Box, Radar, UserCircle,
    ShieldCheck, CheckCircle, Flame, Terminal, Power, Wrench
} from 'lucide-react';
import { useLocalization } from '../../hooks/useLocalization';
import { useData } from '../../hooks/useDataContext';
import { useAuth } from '../../hooks/useAuth';
import { useCurrency } from '../../hooks/useCurrency';
import EmptyState from '../../components/EmptyState';
import AnimatedNumber from '../../components/AnimatedNumber';
import Messages from '../shared/Messages';
import BillingPage from '../shared/BillingPage';
import SettingsPage from '../shared/SettingsPage';
import ReferralsPage from '../shared/ReferralsPage';
import LogisticsProfile from './LogisticsProfile';
import LogisticsDirectory from '../shared/LogisticsDirectory';
import LogisticsPage from '../supplier/LogisticsPage';
import FleetWorkshop from './FleetWorkshop';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-slate-900 border border-white/5 p-10 rounded-[3rem] shadow-2xl flex flex-col justify-between group hover:border-red-600/40 transition-all duration-500 relative overflow-hidden text-left min-h-[250px] breathe-red">
        <div className="absolute inset-0 bg-carbon opacity-5 group-hover:opacity-10 transition-opacity"></div>
        <div className="flex justify-between items-start mb-6 relative z-10">
             <div className={`p-5 rounded-3xl ${color} bg-opacity-10 transition-all group-hover:scale-110 shadow-2xl border border-white/5`}>
                <Icon size={32} className={`${color.replace('bg-', 'text-')}`} />
            </div>
            <div className="flex flex-col items-end">
                <div className="flex gap-1.5 mb-2">
                     <div className="w-1 h-3 bg-red-600 rounded-full animate-pulse"></div>
                     <div className="w-1 h-3 bg-red-600 rounded-full animate-pulse delay-75"></div>
                     <div className="w-1 h-3 bg-red-600 rounded-full animate-pulse delay-150"></div>
                </div>
                <span className="text-[8px] font-black text-slate-600 tracking-[0.3em] uppercase">Uplink Nominal</span>
            </div>
        </div>
        <div className="relative z-10 text-left">
            <h3 className="text-6xl font-black text-white tracking-tighter italic uppercase leading-none mb-4 drop-shadow-2xl">
                {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
            </h3>
            <div className="flex items-center gap-4 border-l-4 border-red-600 pl-6 py-1">
                <div>
                    <p className="text-[11px] font-black uppercase text-slate-400 tracking-[0.4em]">{title}</p>
                    <p className="text-[9px] text-slate-500 mt-1 font-bold tracking-[0.2em] opacity-80 italic uppercase">Fleet Metric v80.5</p>
                </div>
            </div>
        </div>
    </div>
);

const ReadinessHUD: React.FC<{ units: number, pilots: number }> = ({ units, pilots }) => {
    const isReady = units > 0 && pilots > 0;
    
    return (
        <div className={`p-10 rounded-[4rem] border-4 transition-all duration-1000 relative overflow-hidden shadow-2xl ${isReady ? 'bg-slate-900 border-red-600' : 'bg-slate-900 border-white/5'}`}>
            <div className="absolute inset-0 bg-carbon opacity-20"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="text-left flex-grow">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-3 px-5 py-2 bg-red-600/10 border border-red-500/20 rounded-2xl backdrop-blur-md">
                            <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-red-600 animate-pulse shadow-[0_0_15px_#DC0000]' : 'bg-slate-700'}`}></div>
                            <span className={`text-[11px] font-black uppercase tracking-widest italic ${isReady ? 'text-red-500' : 'text-slate-500'}`}>
                                {isReady ? 'GRID READINESS: CRITICAL MASS' : 'STANDBY MODE'}
                            </span>
                        </div>
                    </div>
                    <h2 className="text-7xl font-black italic tracking-tighter uppercase text-white leading-none">
                        FLEET <span className="text-red-600">COMMAND</span>
                    </h2>
                    <p className="text-slate-500 font-mono text-sm mt-4 tracking-[0.3em] uppercase">Unified National Dispatch Authority established</p>
                </div>
                
                <div className="flex gap-6 shrink-0">
                    <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center min-w-[160px] shadow-inner">
                        <p className="text-5xl font-black italic text-white tracking-tighter">{units}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">Active Chassis</p>
                    </div>
                    <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center min-w-[160px] shadow-inner">
                        <p className="text-5xl font-black italic text-white tracking-tighter">{pilots}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">Pilot Nodes</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LoadBoard: React.FC = () => {
    const data = useData();
    const { logisticsLoads = [] } = data || {};
    const { formatCurrency } = useCurrency();
    
    return (
        <div className="space-y-12 text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 border border-white/10 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
                 <div className="absolute inset-0 bg-carbon opacity-10"></div>
                 <div className="relative z-10 text-left">
                    <div className="flex items-center gap-3 mb-4">
                        <Radar size={20} className="text-red-600 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500">Live Grid Intercept</span>
                    </div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none">MARKET <span className="text-blue-600">PAYLOADS</span></h3>
                 </div>
                 <div className="relative z-10 mt-8 md:mt-0 flex items-center gap-4 bg-white/5 px-6 py-3 rounded-full border border-white/10 shadow-xl">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Broadcasting Fulfillment Schema</span>
                 </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-20">
                {logisticsLoads.filter((l: any) => l.status === 'Available').map((load: any) => (
                    <div key={load.id} className="bg-slate-900 border border-white/5 rounded-[3.5rem] p-12 hover:border-red-600/50 transition-all duration-500 group relative overflow-hidden shadow-2xl text-left">
                        <div className="absolute top-0 right-0 p-12 opacity-5 transform group-hover:scale-110 transition-transform duration-1000"><Truck className="h-64 w-64 text-white"/></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <div className="bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest w-fit mb-4 shadow-xl shadow-red-900/40">{load.requiredVehicleType}</div>
                                    <h4 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">NODE_ORD_{load.orderNumber}</h4>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-3 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        Origin Node: {load.supplierName}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Contract Settlement</p>
                                    <p className="text-5xl font-black text-emerald-400 italic tracking-tighter">{formatCurrency(load.payout)}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-8 mb-12">
                                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 group-hover:bg-white/10 transition-all shadow-inner">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3">Load Coordinates</p>
                                    <p className="text-2xl font-black text-slate-100 uppercase italic tracking-tight">{load.pickupLocation}</p>
                                </div>
                                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 group-hover:bg-white/10 transition-all shadow-inner">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3">Target Coordinate</p>
                                    <p className="text-2xl font-black text-slate-100 uppercase italic tracking-tight">{load.dropoffLocation}</p>
                                </div>
                            </div>

                            <button 
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-6 rounded-[2.5rem] text-xs uppercase tracking-[0.4em] transition-all transform active:scale-95 shadow-2xl shadow-red-900/40 flex items-center justify-center gap-6 border-4 border-slate-950"
                            >
                                <Globe className="h-6 w-6 text-white animate-pulse" />
                                Initiate Transport Protocol
                            </button>
                        </div>
                    </div>
                ))}
                {logisticsLoads.filter((l: any) => l.status === 'Available').length === 0 && (
                    <div className="col-span-full">
                        <EmptyState icon={Map} title="GRID CLEAR" message="Neural Core scanning for unassigned regional payloads. Standby for operational handshake." />
                    </div>
                )}
            </div>
        </div>
    );
};

const LogisticsView: React.FC = () => {
    const data = useData();
    const { currentCompany } = useAuth();
    const { vehicles = [], drivers = [], logisticsLoads = [] } = data || {};
    const [activeTab, setActiveTab] = useState<LogisticsTab>('dashboard');
    
    const myUnits = useMemo(() => vehicles.filter((v:any) => v.supplierId === currentCompany?.id), [vehicles, currentCompany]);
    const myPilots = useMemo(() => drivers.filter((d:any) => d.supplierId === currentCompany?.id), [drivers, currentCompany]);

    const navGroups = [
        {
            title: 'Fleet Control',
            items: [
                { id: 'dashboard', label: 'Command HUD', icon: BarChart },
                { id: 'load-board', label: 'Mission Board', icon: Map, badge: logisticsLoads.filter((l:any) => l.status === 'Available').length },
                { id: 'fleet', label: 'Unit Registry', icon: Truck },
                { id: 'workshop', label: 'Fleet Workshop', icon: Wrench },
            ]
        },
        {
            title: 'Registry',
            items: [
                { id: 'profile', label: 'Node Dossier', icon: UserCircle },
                { id: 'fleet-hub', label: 'Global Registry', icon: Globe },
                { id: 'referrals', label: 'Growth Matrix', icon: Gift },
                { id: 'billing', label: 'System Ledger', icon: CreditCard },
                { id: 'settings', label: 'System Config', icon: Settings },
            ]
        }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return (
                <div className="space-y-12 animate-fade-in">
                    <ReadinessHUD units={myUnits.length} pilots={myPilots.length} />

                    {/* R50 HANDSHAKE - LOGISTICS ELEVATION */}
                    <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden group border-4 border-slate-950">
                            <div className="absolute inset-0 bg-carbon opacity-10"></div>
                            <div className="absolute top-0 right-0 p-8 opacity-20 transform -rotate-12 group-hover:rotate-0 transition-transform duration-1000"><Gift size={260} className="text-white"/></div>
                            
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                            <div className="text-left max-w-2xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <Sparkles size={24} className="text-yellow-400 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-100">National Dispatch Growth Protocol</span>
                                </div>
                                <h3 className="text-6xl font-black italic uppercase tracking-tighter leading-none mb-6">R50 <span className="text-slate-900">HANDSHAKE</span></h3>
                                <p className="text-blue-50 text-xl font-medium italic leading-relaxed text-left">"Invite fellow carriers or suppliers to the grid. Secure a R50.0 dispatch credit for your next fleet maintenance or subscription cycle when their node synchronizes with a paid plan."</p>
                            </div>
                            <button 
                                onClick={() => setActiveTab('referrals' as any)}
                                className="bg-slate-950 hover:bg-black text-white font-black py-6 px-16 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all transform active:scale-95 uppercase text-sm tracking-[0.4em] flex items-center justify-center gap-4 group border border-white/10"
                            >
                                <Users size={24} className="text-blue-500 group-hover:animate-bounce"/>
                                Expand Fleet Grid
                            </button>
                            </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <StatCard title="Active Units" value={vehicles.filter((v:any) => v.status === 'On Delivery').length} icon={Truck} color="bg-blue-600" />
                        <StatCard title="Payload Tempo" value="4.2T" icon={Package} color="bg-red-600" />
                        <StatCard title="Market Depth" value={logisticsLoads.filter((l:any) => l.status === 'Available').length} icon={Map} color="bg-amber-500" />
                        <StatCard title="Pilot Roster" value={drivers.length} icon={Users} color="bg-purple-600" />
                    </div>
                    
                    <div className="bg-slate-900 border border-white/5 rounded-[4rem] p-16 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-carbon opacity-10"></div>
                        <div className="absolute top-0 right-0 p-16 opacity-5 transform group-hover:scale-110 transition-transform duration-1000"><Sparkles size={500} /></div>
                        <div className="relative z-10 max-w-3xl text-left">
                            <div className="flex items-center gap-4 mb-8">
                                <Activity className="h-8 w-8 text-blue-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400">National Grid Sync: NOMINAL</span>
                            </div>
                            <h3 className="text-8xl font-black italic tracking-tighter uppercase mb-8 leading-none">FLEET <span className="text-blue-500">NERVE</span> CENTER</h3>
                            <p className="text-slate-400 text-2xl leading-relaxed font-medium italic opacity-80 text-left">"Predictive route optimization locked. Real-time driver telemetry established for 142 metropolitan nodes. System integrity verified."</p>
                            <div className="mt-16 flex flex-wrap gap-12">
                                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-md shadow-inner">
                                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Grid Saturation</p>
                                     <p className="text-4xl font-black">94.2%</p>
                                </div>
                                <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-md shadow-inner">
                                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Core Latency</p>
                                     <p className="text-4xl font-black text-blue-400">22ms</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
            case 'load-board': return <div className="animate-fade-in-up"><LoadBoard /></div>;
            case 'fleet': return <LogisticsPage />;
            case 'workshop': return <FleetWorkshop />;
            case 'profile': return <LogisticsProfile />;
            case 'fleet-hub': return <LogisticsDirectory />;
            case 'referrals': return <ReferralsPage />;
            case 'messages': return <Messages onBack={() => setActiveTab('dashboard')} />;
            case 'billing': return <BillingPage />;
            case 'settings': return <SettingsPage onBack={() => setActiveTab('dashboard')} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-12 font-sans text-slate-200 overflow-x-hidden">
            <DashboardLayout 
                activeTab={activeTab}
                onNavigate={(id) => setActiveTab(id as LogisticsTab)}
                navGroups={navGroups}
                mobileNavItems={[
                    { id: 'dashboard', icon: BarChart, label: 'HUD' },
                    { id: 'load-board', icon: Map, label: 'Loads' },
                    { id: 'fleet', icon: Truck, label: 'Fleet' },
                    { id: 'menu', icon: Terminal, label: 'Menu', action: () => document.dispatchEvent(new CustomEvent('toggle-mobile-menu')) }, 
                ]}
            >
                <div className="w-full">
                    {renderContent()}
                </div>
            </DashboardLayout>

            <div className="ferrari-watermark">FLEET COMMAND</div>
        </div>
    );
};

export default LogisticsView;
