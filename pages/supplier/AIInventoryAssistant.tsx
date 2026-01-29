
import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useLocalization } from '../../hooks/useLocalization';
import { ArchiveBoxArrowDownIcon, SparklesIcon, CurrencyDollarIcon, ArrowPathIcon, ExclamationTriangleIcon, MegaphoneIcon, XMarkIcon, CheckCircleIcon, RadioIcon } from '@heroicons/react/24/solid';
import { SupplierTab, Product } from '../../types';
import { useCurrency } from '../../hooks/useCurrency';
import { GoogleGenAI } from '@google/genai';
import { useToast } from '../../hooks/useToast';

const InsightCard: React.FC<{ title: string; description: string; icon: React.ElementType; children: React.ReactNode; isLoading: boolean; error: string | null }> = ({ title, description, icon: Icon, children, isLoading, error }) => {
    const { t } = useLocalization();
    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-md border border-gray-100 relative overflow-hidden flex flex-col h-full group hover:shadow-xl transition-all duration-500">
            <div className="flex items-start gap-5 mb-8">
                <div className="bg-blue-600/10 p-4 rounded-2xl group-hover:bg-blue-600 transition-colors">
                    <Icon className="h-8 w-8 text-blue-600 group-hover:text-white" />
                </div>
                <div className="text-left">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">{title}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{description}</p>
                </div>
            </div>
            <div className="flex-grow flex flex-col">
                {isLoading ? (
                    <div className="flex-grow flex flex-col items-center justify-center py-12">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Syncing Neural Buffers...</p>
                    </div>
                ) : error ? (
                    <div className="flex-grow bg-red-50 border-2 border-dashed border-red-200 p-8 rounded-3xl text-center flex flex-col items-center justify-center gap-4">
                        <ExclamationTriangleIcon className="h-10 w-10 text-red-500 animate-pulse" />
                        <div>
                            <p className="text-xs font-black text-red-700 uppercase tracking-widest">Neural Ops Locked</p>
                            <p className="text-[10px] text-red-600 font-medium italic mt-2 leading-relaxed">"{error}"</p>
                        </div>
                    </div>
                ) : children}
            </div>
        </div>
    );
}

const AIInventoryAssistant: React.FC<{ onNavigate: (tab: SupplierTab) => void }> = ({ onNavigate }) => {
    const { 
        restockSuggestions, 
        trendingSuggestions, 
        pricingSuggestions, 
        isAILoading, 
        aiErrors,
        generateInventoryInsights,
        pricingAnalysis,
        clearPricingAnalysis,
        products,
        isGridSaturated
    } = useData();
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();

    useEffect(() => {
        if (restockSuggestions === null && !isAILoading.inventory) {
            generateInventoryInsights();
        }
    }, [restockSuggestions, generateInventoryInsights, isAILoading.inventory]);

    const analyzedProduct = useMemo(() =>
        pricingAnalysis ? (products || []).find(p => p.id === pricingAnalysis.productId) : null,
        [pricingAnalysis, products]
    );

    return (
        <div className="animate-fade-in text-left pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12 mb-12">
                <div className="text-left">
                    <div className="flex items-center gap-3 mb-4 text-blue-500">
                         <SparklesIcon className="h-8 w-8 animate-pulse shadow-[0_0_20px_#2563eb]" />
                         <span className="text-[10px] font-black uppercase tracking-[0.4em]">Inventory Intelligence Core v80.5</span>
                    </div>
                    <h1 className="text-7xl font-black tracking-tighter italic uppercase text-slate-900 leading-none">NEURAL <span className="text-blue-600">OPS</span></h1>
                    <p className="text-slate-500 mt-4 font-mono text-sm tracking-widest uppercase italic font-bold">"Predictive material orchestration engine."</p>
                </div>
                <button 
                    onClick={() => generateInventoryInsights(true)} 
                    disabled={isAILoading.inventory || isGridSaturated} 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-12 rounded-[2rem] shadow-2xl flex items-center justify-center gap-4 transform active:scale-95 disabled:opacity-30 border-4 border-slate-950 uppercase tracking-widest text-[10px]"
                >
                    <ArrowPathIcon className={`h-6 w-6 ${isAILoading.inventory ? 'animate-spin' : ''}`} />
                    Refresh Matrix
                </button>
            </div>
            
            {isGridSaturated && (
                 <div className="bg-red-600 text-white p-10 rounded-[3rem] mb-12 flex items-center gap-10 border-4 border-slate-950 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-carbon opacity-10"></div>
                    <div className="bg-white p-5 rounded-3xl shrink-0 shadow-2xl"><ExclamationTriangleIcon className="h-10 w-10 text-red-600"/></div>
                    <div className="text-left">
                        <h4 className="text-2xl font-black italic uppercase tracking-tighter leading-none">GRID NODES COOLING</h4>
                        <p className="text-sm font-medium mt-2 text-red-100 leading-relaxed italic">"API quota saturated. Currently serving data from Internal Reserve (Cache). Automatic neural scans paused for sixty cycles."</p>
                    </div>
                </div>
            )}

            {pricingAnalysis && analyzedProduct && !isAILoading.pricing && (
                <div className="mb-12 bg-blue-600/5 p-10 rounded-[4rem] border border-blue-500/20 shadow-2xl relative overflow-hidden animate-fade-in-scale">
                    <div className="absolute top-0 right-0 p-12 opacity-5 transform rotate-12 scale-150"><SparklesIcon className="h-96 w-96 text-blue-500"/></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div className="text-left">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-4 text-slate-900">
                                <SparklesIcon className="h-6 w-6 text-blue-500 animate-pulse" />
                                {analyzedProduct.name}
                            </h3>
                             <p className="text-xs font-black text-blue-600 uppercase tracking-[0.4em] mt-3 italic font-bold">GRID_SOURCE_ACTIVE</p>
                        </div>
                        <button onClick={clearPricingAnalysis} className="p-4 bg-white rounded-2xl shadow-xl text-slate-400 hover:text-red-600 transition-colors"><XMarkIcon className="h-6 w-6"/></button>
                    </div>
                    <div className="mt-10 text-slate-700 italic font-serif leading-loose text-2xl border-l-8 border-blue-600 pl-10 max-w-4xl text-left">
                        {pricingAnalysis.analysis}
                    </div>
                    <div className="mt-12 flex gap-4">
                        <button onClick={() => onNavigate('products')} className="bg-slate-950 text-white font-black py-5 px-10 rounded-2xl text-[10px] uppercase tracking-[0.4em] hover:bg-black transition-all shadow-xl">Recalibrate Catalog</button>
                        <button onClick={() => onNavigate('promotions')} className="bg-blue-600 text-white font-black py-5 px-10 rounded-2xl text-[10px] uppercase tracking-[0.4em] hover:bg-blue-700 transition-all shadow-2xl border border-white/10">Launch Flash Payload</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <InsightCard 
                    title="Restock Registry" 
                    description="Inventory Depletion Alert" 
                    icon={ArchiveBoxArrowDownIcon} 
                    isLoading={isAILoading.inventory}
                    error={aiErrors.inventory || null}
                >
                    {restockSuggestions && restockSuggestions.length > 0 ? (
                        <div className="space-y-4">
                            {restockSuggestions.map((item, index) => (
                                <div key={index} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-blue-500/30 transition-all shadow-inner text-left">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="font-black text-slate-900 uppercase tracking-tight italic text-lg">{item.productName}</p>
                                        <span className="text-[10px] font-black text-red-500 uppercase bg-white border px-2 py-1 rounded-lg">{item.currentStock} Units</span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium italic leading-relaxed opacity-80">"{item.reason}"</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center py-20 opacity-20 italic">
                             <CheckCircleIcon className="h-16 w-16 mb-4 text-emerald-500" />
                             <p className="text-xs font-black uppercase tracking-widest">Registry: Nominal</p>
                        </div>
                    )}
                </InsightCard>

                 <InsightCard 
                    title="Trend Intercept" 
                    description="Regional Demand Vectors" 
                    icon={SparklesIcon} 
                    isLoading={isAILoading.inventory}
                    error={aiErrors.inventory || null}
                >
                   {trendingSuggestions && trendingSuggestions.length > 0 ? (
                        <div className="space-y-4">
                            {trendingSuggestions.map((item, index) => (
                                <div key={index} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-blue-500/30 transition-all shadow-inner text-left">
                                    <p className="font-black text-blue-600 uppercase tracking-tight italic text-lg">{item.productName}</p>
                                    <p className="text-xs text-slate-500 font-medium italic mt-2 leading-relaxed opacity-80">"{item.reason}"</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center py-20 opacity-20 italic">
                             <RadioIcon className="h-16 w-16 mb-4 text-blue-500 animate-pulse" />
                             <p className="text-xs font-black uppercase tracking-widest">Scanning Grid Nodes...</p>
                        </div>
                    )}
                </InsightCard>

                 <InsightCard 
                    title="Price Arbitrage" 
                    description="Margin Optimization Logic" 
                    icon={CurrencyDollarIcon} 
                    isLoading={isAILoading.inventory}
                    error={aiErrors.inventory || null}
                >
                   {pricingSuggestions && pricingSuggestions.length > 0 ? (
                        <div className="space-y-4">
                            {pricingSuggestions.map((item, index) => (
                                <div key={index} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-emerald-500/30 transition-all shadow-inner text-left">
                                    <div className="flex justify-between items-start mb-3">
                                        <p className="font-black text-slate-900 uppercase tracking-tight italic text-lg leading-tight">{item.productName}</p>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-emerald-600">{formatCurrency(item.suggestedPrice)}</p>
                                            <p className="text-[9px] text-slate-400 font-bold line-through">{formatCurrency(item.currentPrice)}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium italic leading-relaxed opacity-80">"{item.reason}"</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center py-20 opacity-20 italic">
                             <CurrencyDollarIcon className="h-16 w-16 mb-4 text-amber-500" />
                             <p className="text-xs font-black uppercase tracking-widest">Market Index Synchronized</p>
                        </div>
                    )}
                </InsightCard>
            </div>
            
            <div className="fixed bottom-10 right-10 pointer-events-none opacity-[0.03] -z-10 rotate-90 select-none">
                <span className="text-[180px] font-black tracking-tighter text-white uppercase italic">NEURAL OPS REDLINE</span>
            </div>
        </div>
    );
};

export default AIInventoryAssistant;
