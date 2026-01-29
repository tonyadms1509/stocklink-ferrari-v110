import React, { useMemo, useState } from 'react';
import { 
    CurrencyDollarIcon, ShoppingCartIcon, ChatBubbleLeftRightIcon, 
    StarIcon, ClipboardDocumentListIcon, SparklesIcon, QrCodeIcon, 
    RadioIcon, FireIcon, TruckIcon, ShieldCheckIcon, GlobeAmericasIcon,
    ArrowPathIcon, RocketLaunchIcon, SignalIcon, InboxStackIcon, MapIcon,
    ArrowTrendingUpIcon
} from '@heroicons/react/24/solid';
import { useCurrency } from '../../hooks/useCurrency.tsx';
import { useData } from '../../hooks/useDataContext.tsx';
import { useAuth } from '../../hooks/useAuth.tsx';
import { OrderStatus, QuoteStatus, SystemStatus } from '../../types.ts';
import CounterCheckInModal from '../../components/CounterCheckInModal.tsx';
import AnimatedNumber from '../../components/AnimatedNumber.tsx';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; trend?: string; trendUp?: boolean; colorClass?: string; isCurrency?: boolean; id?: string }> = ({ title, value, icon: Icon, trend, trendUp, colorClass = 'bg-primary', isCurrency = false, id }) => {
    const { formatCurrency } = useCurrency();
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g,"")) : value;

    return (
        <div id={id} className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl group hover:border-blue-500/30 transition-all duration-500 flex flex-col justify-between relative overflow-hidden text-left">
            <div className="absolute inset-0 bg-carbon opacity-5 group-hover:opacity-10"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
                 <div className={`p-4 rounded-2xl ${colorClass} bg-opacity-10 transition-transform group-hover:scale-110 shadow-lg`}>
                    <Icon className={`h-6 w-6 ${colorClass.replace('bg-', 'text-')}`} />
                </div>
                {trend && (
                    <div className={`flex items-center text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {trend}
                    </div>
                )}
            </div>
            <div className="relative z-10">
                <h3 className="text-5xl font-black text-white mb-2 tracking-tighter italic uppercase">
                    {isCurrency ? formatCurrency(Number(numValue)) : <AnimatedNumber value={isNaN(Number(numValue)) ? 0 : Number(numValue)} />}
                </h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 pl-2 border-l-2 border-blue-600">{title}</p>
            </div>
        </div>
    );
};

export default function SupplierDashboard() {
    const { formatCurrency } = useCurrency();
    const { currentCompany } = useAuth();
    const { orders = [], quoteRequests = [], systemStatus } = useData();
    const [isCheckInOpen, setIsCheckInOpen] = useState(false);

    const metrics = useMemo(() => {
        if (!currentCompany) return { revenue: 0, pending: 0, quotes: 0, recent: [] };
        const myOrders = (orders || []).filter(o => o.supplierId === currentCompany.id);
        const revenue = myOrders.filter(o => o.status === OrderStatus.Completed).reduce((sum, o) => sum + o.total, 0);
        const pending = myOrders.filter(o => [OrderStatus.New, OrderStatus.Processing].includes(o.status)).length;
        const quotes = (quoteRequests || []).filter(q => q.supplierId === currentCompany.id && q.status === QuoteStatus.Pending).length;
        return { revenue, pending, quotes, recent: myOrders.slice(0, 5) };
    }, [currentCompany, orders, quoteRequests]);

    const isProduction = systemStatus === SystemStatus.Production;

    return (
        <div className="space-y-12 pb-12 font-sans selection:bg-blue-500/30">
            {/* Mission Control Header */}
            <div className={`rounded-[3.5rem] shadow-2xl p-12 text-white relative overflow-hidden border transition-all duration-1000 ${isProduction ? 'bg-slate-950 border-emerald-500/30' : 'bg-slate-900 border-white/5'}`}>
                <div className="absolute inset-0 bg-carbon opacity-20"></div>
                <div className={`absolute top-0 right-0 p-12 transition-opacity duration-1000 ${isProduction ? 'opacity-10' : 'opacity-0'}`}>
                    <RocketLaunchIcon className="h-96 w-96 text-emerald-500 transform rotate-12 opacity-50" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="text-left">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-2.5 h-2.5 rounded-full animate-pulse shadow-lg ${isProduction ? 'bg-emerald-500 shadow-emerald-500' : 'bg-blue-500 shadow-blue-500'}`}></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                                {isProduction ? 'FERRARI PRODUCTION GRID ACTIVE' : `Merchant Node: ${currentCompany?.id.slice(0,8).toUpperCase()}`}
                            </span>
                        </div>
                        <h2 className="text-8xl font-black tracking-tighter uppercase italic leading-[0.8] mb-6 drop-shadow-2xl">{currentCompany?.name}</h2>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                                <SignalIcon className="h-4 w-4 text-blue-500" />
                                <p className="text-blue-500 font-mono font-bold text-[10px] tracking-[0.3em] uppercase">Signal Strength: NOMINAL</p>
                            </div>
                        </div>
                    </div>

                    <button onClick={() => setIsCheckInOpen(true)} className="bg-white hover:bg-slate-100 text-slate-950 font-black py-6 px-16 rounded-[2.5rem] flex items-center gap-8 transition-all shadow-2xl transform active:scale-95 group border-4 border-slate-900">
                         <QrCodeIcon className="h-14 w-14 text-blue-600 group-hover:scale-110 transition-transform"/>
                         <div className="text-left border-l-2 border-slate-200 pl-8">
                            <span className="block text-2xl leading-tight font-black uppercase italic tracking-tighter">Check-In</span>
                            <span className="block text-[10px] text-slate-500 uppercase font-black tracking-widest">Counter Protocol</span>
                         </div>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <StatCard title="Portfolio Settlement" value={metrics.revenue} icon={CurrencyDollarIcon} trend="+R12k Shift" trendUp={true} colorClass="bg-emerald-600" isCurrency={true} />
                <StatCard title="Pipeline Flow" value={metrics.pending} icon={ShoppingCartIcon} colorClass="bg-blue-600" />
                <StatCard title="Active Mandates" value={metrics.quotes} icon={ChatBubbleLeftRightIcon} colorClass="bg-amber-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-slate-900 border border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
                     <div className="absolute inset-0 bg-carbon opacity-10"></div>
                    <div className="flex justify-between items-center mb-12 relative z-10">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-6 text-white text-left">
                            <div className="w-2 h-10 bg-blue-600 rounded-full shadow-[0_0_15px_#2563eb]"></div>
                            Registry <span className="text-blue-500">Events</span>
                        </h3>
                        <button className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] hover:text-white transition-colors border-b border-white/10 pb-1">All Transmissions</button>
                    </div>
                    <div className="space-y-4 relative z-10">
                        {metrics.recent.map(o => (
                            <div key={o.id} className="flex items-center justify-between p-8 bg-white/5 rounded-[2.5rem] border border-white/5 group hover:bg-white/10 transition-all cursor-pointer">
                                <div className="flex items-center gap-8 text-left">
                                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-slate-400 text-xs">NODE</div>
                                    <div>
                                        <p className="font-black text-white uppercase tracking-tight text-2xl group-hover:text-blue-400 transition-colors italic">#{o.orderNumber}</p>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 font-mono">{o.contractorName}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-white text-3xl tracking-tighter italic">{formatCurrency(o.total)}</p>
                                    <span className={`text-[9px] font-black uppercase text-blue-500 tracking-[0.4em] italic`}>{o.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 border border-white/10 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group flex flex-col justify-between h-full text-left">
                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:rotate-12 duration-1000">
                        <SparklesIcon className="h-64 w-64"/>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-8 leading-none">Neural <br/> Market <br/> Pulse</h3>
                        <p className="text-blue-100 text-lg leading-relaxed mb-10 font-medium italic opacity-70">"National material indices indicate a 12% demand spike in Gauteng Sector Delta. Recalibrate price anchors to capture regional surplus."</p>
                        
                        <div className="bg-white/5 backdrop-blur-md rounded-[2rem] p-8 border border-white/10">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory Velocity</span>
                                <span className="text-emerald-400 font-black text-xs uppercase italic tracking-tighter">Accelerating</span>
                            </div>
                            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-400 w-3/4 shadow-[0_0_15px_#10b981]"></div>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => window.location.hash = '#/intelligence'} className="relative z-10 w-full bg-blue-600 text-white font-black py-6 rounded-[2.5rem] mt-12 hover:bg-blue-500 transition-all shadow-2xl uppercase tracking-[0.3em] text-[10px]">Execute Audit</button>
                </div>
            </div>
            {isCheckInOpen && <CounterCheckInModal onClose={() => setIsCheckInOpen(false)} />}
        </div>
    );
}