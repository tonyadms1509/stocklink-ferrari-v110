
import React, { useMemo, useEffect, useState } from 'react';
import { 
  CurrencyDollarIcon, 
  ShoppingCartIcon, 
  UsersIcon, 
  ReceiptPercentIcon, 
  ArrowLeftIcon, 
  ChartBarIcon, 
  LightBulbIcon, 
  SparklesIcon, 
  ArrowTrendingUpIcon, 
  RadioIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/solid';
import { useCurrency } from '../../hooks/useCurrency';
import { useLocalization } from '../../hooks/useLocalization';
import { useData } from '../../hooks/useDataContext';
import { useAuth } from '../../hooks/useAuth';
import { OrderStatus } from '../../types';
import AIBusinessAnalyst from '../../components/AIBusinessAnalyst';
import AnimatedNumber from '../../components/AnimatedNumber';

const DarkStatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType, color: string, isCurrency?: boolean }> = ({ title, value, icon: Icon, color, isCurrency }) => {
    const { formatCurrency } = useCurrency();
    return (
        <div className="bg-slate-900 border border-white/5 p-10 rounded-[3rem] shadow-2xl group hover:border-blue-500/30 transition-all duration-700 flex items-center space-x-10 text-left relative overflow-hidden">
            <div className="absolute inset-0 bg-carbon opacity-5"></div>
            <div className={`p-6 rounded-[2rem] ${color} bg-opacity-10 transition-transform group-hover:scale-110 shadow-lg border border-white/5`}>
                <Icon className={`h-10 w-10 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div className="relative z-10">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mb-2 font-mono">Ledger Metrics</p>
                <h3 className="text-5xl font-black text-white tracking-tighter italic uppercase leading-none">
                    {isCurrency && typeof value === 'number' ? formatCurrency(value) : <AnimatedNumber value={Number(value) || 0} />}
                </h3>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4 border-l-2 border-blue-600 pl-3">{title}</p>
            </div>
        </div>
    );
};

const BusinessIntelligencePage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();
    const { user, currentCompany } = useAuth();
    const { orders, products, users, generateBusinessIntelligenceReport, isBILoading, businessIntelligenceReport } = useData();

    const stats = useMemo(() => {
        if (!currentCompany) return { totalRevenue: 0, orderCount: 0, customerCount: 0, avgTicket: 0 };
        const myOrders = orders.filter(o => o.supplierId === currentCompany.id);
        const settledOrders = myOrders.filter(o => o.status === OrderStatus.Completed);
        const totalRevenue = settledOrders.reduce((sum, o) => sum + o.total, 0);
        const orderCount = myOrders.length;
        const customerCount = new Set(myOrders.map(o => o.contractorId)).size;
        const avgTicket = orderCount > 0 ? totalRevenue / orderCount : 0;

        return { totalRevenue, orderCount, customerCount, avgTicket };
    }, [orders, currentCompany]);

    return (
        <div className="space-y-12 pb-24 animate-fade-in text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12">
                <div className="text-left">
                    <div className="flex items-center gap-3 mb-4 text-blue-500">
                         <SparklesIcon className="h-8 w-8 animate-pulse shadow-[0_0_20px_#2563eb]" />
                         <span className="text-[10px] font-black uppercase tracking-[0.4em]">Neural Analytics Core v110.0</span>
                    </div>
                    <h1 className="text-7xl font-black tracking-tighter italic uppercase text-white leading-none">STRATEGIC <span className="text-blue-500">INTEL</span></h1>
                    <p className="text-slate-500 mt-4 font-mono text-sm tracking-widest uppercase italic">"Deep-data dredging & predictive business orchestration."</p>
                </div>
                <button 
                    onClick={onBack}
                    className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-slate-500 hover:text-white transition-all transform active:scale-95 border border-white/10"
                >
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <DarkStatCard title="Settled Revenue" value={stats.totalRevenue} icon={CurrencyDollarIcon} color="bg-emerald-600" isCurrency />
                <DarkStatCard title="Network Flow" value={stats.orderCount} icon={ShoppingCartIcon} color="bg-blue-600" />
                <DarkStatCard title="Active Nodes" value={stats.customerCount} icon={UsersIcon} color="bg-purple-600" />
                <DarkStatCard title="Mean Payload" value={stats.avgTicket} icon={ReceiptPercentIcon} color="bg-amber-600" isCurrency />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8">
                    <AIBusinessAnalyst />
                </div>

                <div className="lg:col-span-4 space-y-10">
                    <div className="bg-slate-900 border border-white/10 rounded-[4rem] p-12 shadow-2xl relative overflow-hidden group h-full">
                        <div className="absolute inset-0 bg-carbon opacity-10"></div>
                        <div className="absolute top-0 right-0 p-12 opacity-5 transform group-hover:rotate-12 transition-transform duration-1000">
                            <SparklesIcon className="h-64 w-64 text-blue-500" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-8 leading-tight">National <br/> Supply <br/> Heat</h3>
                            <p className="text-blue-100 text-lg leading-relaxed font-medium italic opacity-70 mb-10 text-left">
                                "Real-time demand vectors identified in the Sector E-3 corridor. PVC conduits experiencing a 14% liquidity spike. Recalibrate anchor pricing nodes to capture regional surplus."
                            </p>
                            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-inner">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Market Saturation</span>
                                    <span className="text-blue-400 font-black text-xs italic tracking-tighter uppercase">Growing</span>
                                </div>
                                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                                    <div className="h-full bg-blue-500 w-2/3 shadow-[0_0_15px_#3b82f6] animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                        <button className="relative z-10 w-full bg-white text-slate-950 font-black py-6 rounded-[2rem] mt-12 hover:bg-slate-100 transition-all shadow-2xl uppercase tracking-[0.3em] text-[10px] border-4 border-slate-900 transform active:scale-95">Download PDF Dossier</button>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-10 right-10 pointer-events-none opacity-5 -z-10 rotate-90 select-none">
                <span className="text-[140px] font-black tracking-tighter text-white uppercase italic">GRID_INTEL</span>
            </div>
        </div>
    );
};

export default BusinessIntelligencePage;
