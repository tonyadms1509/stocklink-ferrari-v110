
import React, { useMemo } from 'react';
import { 
    CubeIcon, ClipboardDocumentListIcon, DocumentTextIcon, 
    UserCircleIcon, ArrowRightIcon, BellAlertIcon, 
    CheckCircleIcon, InboxStackIcon, ExclamationTriangleIcon, 
    GiftIcon, SparklesIcon, UsersIcon, LightBulbIcon, 
    ShieldCheckIcon, RadioIcon, GlobeAmericasIcon 
} from '@heroicons/react/24/solid';
import { useAuth } from '../../hooks/useAuth.tsx';
import { useData } from '../../hooks/useDataContext.tsx';
import { OrderStatus, QuoteStatus, SupplierTab } from '../../types.ts';
import { useLocalization } from '../../hooks/useLocalization.tsx';
import AnimatedNumber from '../../components/AnimatedNumber.tsx';

interface ActionCardProps {
    title: string;
    description: string;
    icon: React.ElementType;
    onClick: () => void;
    badge?: number;
    colorClass: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon: Icon, onClick, badge, colorClass }) => (
    <button 
        onClick={onClick} 
        className="bg-slate-900 border border-white/5 rounded-[3rem] p-10 text-left w-full h-full relative group hover:border-blue-600/40 transition-all duration-500 flex flex-col shadow-2xl overflow-hidden"
    >
        <div className="absolute inset-0 bg-carbon opacity-5 group-hover:opacity-10 transition-opacity"></div>
        <div className={`p-5 rounded-3xl w-fit mb-10 ${colorClass.replace('text-', 'bg-').replace('600', '100')} ${colorClass} bg-opacity-10 group-hover:bg-opacity-100 transition-all shadow-2xl border border-white/5`}>
            <Icon className={`h-12 w-12 group-hover:text-white transition-colors drop-shadow-xl`} />
        </div>
        
        <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">{title}</h3>
        <p className="text-base text-slate-500 mb-12 leading-relaxed font-medium flex-grow italic">"{description}"</p>
        
        <div className="flex items-center justify-between w-full mt-auto pt-8 border-t border-white/5">
            <span className={`text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 group-hover:text-white flex items-center gap-3 transition-colors`}>
                Initialize Module <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-2 text-red-600"/>
            </span>
            {badge !== undefined && badge > 0 && (
                 <span className="bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-[0_0_20px_#DC0000] animate-pulse border border-red-400/30">
                    {badge} ACTIVE_NODES
                </span>
            )}
        </div>
    </button>
);

const BriefingWidget: React.FC<{ title: string, count: number, icon: React.ElementType, color: string, onClick: () => void }> = ({ title, count, icon: Icon, color, onClick }) => (
    <button onClick={onClick} className="bg-white/5 border border-white/5 p-10 rounded-[3rem] flex items-center gap-10 w-full text-left hover:bg-white/10 hover:border-red-600/30 transition-all duration-500 shadow-2xl group shadow-inner">
        <div className={`p-6 rounded-2xl bg-black/60 shadow-2xl group-hover:scale-110 transition-transform border border-white/5`}>
            <Icon className="h-10 w-10 text-red-600 drop-shadow-[0_0_15px_red]" />
        </div>
        <div className="text-left">
            <p className="text-6xl font-black text-white italic tracking-tighter text-left drop-shadow-lg">
                <AnimatedNumber value={count} />
            </p>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 mt-2 text-left">{title}</p>
        </div>
    </button>
);

const SupplierHome: React.FC<{ onNavigate: (tab: SupplierTab) => void }> = ({ onNavigate }) => {
    const { user } = useAuth();
    const { orders = [], quoteRequests = [], products = [] } = useData();

    const stats = useMemo(() => {
        const myOrders = Array.isArray(orders) ? orders : [];
        const myQuotes = Array.isArray(quoteRequests) ? quoteRequests : [];
        const myProducts = Array.isArray(products) ? products : [];

        const newOrders = myOrders.filter(o => o.status === OrderStatus.New).length;
        const toPack = myOrders.filter(o => o.status === OrderStatus.Processing).length;
        const pendingQuotes = myQuotes.filter(q => q.status === QuoteStatus.Pending).length;
        const lowStock = myProducts.filter(p => p.stock < 10).length;
        return { newOrders, toPack, pendingQuotes, lowStock };
    }, [orders, quoteRequests, products]);

    return (
        <div className="pb-24 space-y-12 animate-fade-in text-left selection:bg-red-600/30">
            {/* National Dispatch High Visibility Banner */}
            <div className="bg-red-600 rounded-[4rem] p-16 text-white shadow-[0_0_100px_rgba(220,0,0,0.3)] relative overflow-hidden group border-4 border-slate-950">
                 <div className="absolute inset-0 bg-carbon opacity-10"></div>
                 <div className="absolute top-0 right-0 p-12 opacity-20 transform -rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                    <GiftIcon className="h-96 w-96"/>
                 </div>
                 
                 <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-16 text-left">
                    <div className="text-left max-w-4xl">
                        <div className="flex items-center gap-4 mb-8">
                            <SparklesIcon className="h-8 w-8 text-white animate-pulse shadow-[0_0_15px_white]" />
                            <span className="text-[12px] font-black uppercase tracking-[0.8em] text-white italic">Grid Loyalty Protocol v110.0</span>
                        </div>
                        <h3 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.8] mb-10">R50 <br/> <span className="text-slate-950">HANDSHAKE</span></h3>
                        <p className="text-white text-2xl font-medium italic leading-relaxed opacity-90 text-left max-w-3xl">"Recruit verified carriers or material nodes to the national grid. Secure high-fidelity R50.0 fulfillment credit for every successful node sync."</p>
                    </div>
                    <button 
                        onClick={() => onNavigate('referrals')}
                        className="bg-slate-950 hover:bg-black text-white font-black py-10 px-20 rounded-[3rem] shadow-2xl transition-all transform active:scale-95 uppercase text-sm tracking-[0.6em] flex items-center justify-center gap-8 group border border-white/10 shrink-0"
                    >
                        <UsersIcon className="h-10 w-10 text-red-600 group-hover:animate-bounce"/>
                        Provision Partner
                    </button>
                 </div>
            </div>

            {/* Tactical Briefing Header */}
            <div className="bg-slate-900 rounded-[4rem] p-16 text-white shadow-2xl relative overflow-hidden border border-white/5 group">
                 <div className="absolute inset-0 bg-carbon opacity-10"></div>
                 <div className="absolute top-0 right-0 p-12 opacity-5 transform group-hover:scale-125 transition-transform duration-2000"><GlobeAmericasIcon size={600} /></div>
                 <div className="relative z-10 text-left">
                     <div className="flex items-center gap-4 mb-4 font-mono">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse shadow-[0_0_10px_#2563eb]"></div>
                        <p className="text-blue-500 font-black text-xs uppercase tracking-[0.5em] leading-none">SUPPLIER_NODE_UPLINK v110.0</p>
                     </div>
                     <h2 className="text-8xl font-black italic tracking-tighter uppercase leading-none mb-16 text-left">COMMANDER <span className="text-red-600 text-glow-red">{user?.name.split(' ')[0]}</span></h2>
                     
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <BriefingWidget 
                            title="Active Payloads" 
                            count={stats.toPack} 
                            icon={InboxStackIcon} 
                            color="text-red-600"
                            onClick={() => onNavigate('orders')}
                        />
                        <BriefingWidget 
                            title="Pending Mandates" 
                            count={stats.pendingQuotes} 
                            icon={DocumentTextIcon} 
                            color="text-blue-600"
                            onClick={() => onNavigate('quotes')}
                        />
                         <BriefingWidget 
                            title="Low Stock Nodes" 
                            count={stats.lowStock} 
                            icon={ExclamationTriangleIcon} 
                            color="text-amber-500"
                            onClick={() => onNavigate('products')}
                        />
                     </div>
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <ActionCard
                    title="BOM Intercept"
                    description="Autonomous digitization of handwritten contractor mandates and technical quote payloads."
                    icon={DocumentTextIcon}
                    onClick={() => onNavigate('bom-assistant')}
                    colorClass="text-purple-600"
                />
                <ActionCard
                    title="Inventory AI"
                    description="Neural-driven suggestions for node restocking, regional price arbitrage, and stock velocity."
                    icon={LightBulbIcon}
                    onClick={() => onNavigate('ai-assistant')}
                    colorClass="text-emerald-600"
                />
                <ActionCard
                    title="Dispatch HUD"
                    description="Full orchestrator for pilot assignments, route telemetry, and national fulfillment tracking."
                    icon={ClipboardDocumentListIcon}
                    onClick={() => onNavigate('orders')}
                    badge={stats.newOrders}
                    colorClass="text-red-600"
                />
                <ActionCard
                    title="The Vault"
                    description="Settlement audit desk. Manage milestone escrow holds and release verified structural funds."
                    icon={ShieldCheckIcon}
                    onClick={() => onNavigate('vault' as any)}
                    colorClass="text-blue-600"
                />
            </div>
            
            <div className="fixed bottom-10 right-10 pointer-events-none opacity-[0.02] -z-10 rotate-90 select-none text-left">
                <span className="text-[180px] font-black tracking-tighter text-white uppercase italic leading-none">GRID_CORE_PROD</span>
            </div>
        </div>
    );
};

export default SupplierHome;
