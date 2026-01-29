import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext.tsx';
import { useCurrency } from '../../hooks/useCurrency.tsx';
import { InvoiceStatus, ExpenseCategory } from '../../types.ts';
import { 
    BanknotesIcon, ArrowPathIcon, SparklesIcon, 
    ArrowTrendingDownIcon, DocumentTextIcon, 
    ChartBarIcon, ShieldCheckIcon,
    CurrencyDollarIcon, WalletIcon
} from '@heroicons/react/24/solid';
import AnimatedNumber from '../../components/AnimatedNumber.tsx';
import { GoogleGenAI } from '@google/genai';
import { useToast } from '../../hooks/useToast.tsx';

const LedgerHUDCard = ({ label, value, sub, color, icon: Icon, isCurrency = true }: any) => {
    const { formatCurrency } = useCurrency();
    return (
        <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:border-red-600/30 transition-all duration-500 text-left">
            <div className="absolute inset-0 bg-carbon opacity-5"></div>
            <div className="flex justify-between items-start mb-6 relative z-10 text-left">
                 <div className={`p-4 rounded-2xl ${color} bg-opacity-10 transition-transform group-hover:scale-110 shadow-lg`}>
                    <Icon className={`h-8 w-8 ${color.replace('bg-', 'text-')}`} />
                </div>
                <div className="flex flex-col items-end">
                     <div className="flex gap-1 mb-2">
                        <div className="w-1 h-3 bg-red-600 rounded-full animate-pulse"></div>
                        <div className="w-1 h-3 bg-red-600 rounded-full animate-pulse delay-75"></div>
                     </div>
                </div>
            </div>
            <div className="relative z-10 text-left">
                 <h3 className="text-5xl font-black text-white mb-2 tracking-tighter italic uppercase leading-none">
                     {isCurrency ? (
                         <AnimatedNumber value={value} format={formatCurrency} />
                     ) : <AnimatedNumber value={value} />}
                 </h3>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] pl-3 border-l-2 border-red-600 text-left">
                    {label}
                 </p>
                 <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-4 italic">{sub}</p>
            </div>
        </div>
    );
};

const ContractorLedger: React.FC = () => {
    const { clientInvoices = [], projectExpenses = [] } = useData();
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditReport, setAuditReport] = useState<string | null>(null);

    const financials = useMemo(() => {
        const totalBilled = clientInvoices.reduce((sum, i) => sum + (Number(i.total) || 0), 0);
        const totalPaid = clientInvoices.filter(i => i.status === InvoiceStatus.Paid).reduce((sum, i) => sum + (Number(i.total) || 0), 0);
        const totalExpenses = projectExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        const netPosition = totalPaid - totalExpenses;
        
        const categorySpend = Object.values(ExpenseCategory).reduce((acc, cat) => {
            acc[cat as string] = projectExpenses.filter(e => e.category === cat).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
            return acc;
        }, {} as Record<string, number>);

        return { totalBilled, totalPaid, totalExpenses, netPosition, categorySpend };
    }, [clientInvoices, projectExpenses]);

    const runNeuralFiscalAudit = async () => {
        if (!process.env.API_KEY) {
            showToast("API Key Missing. Audit restricted.", "error");
            return;
        }
        setIsAuditing(true);
        setAuditReport(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Analyze this South African construction firm's financial status: 
                Total Invoiced: ${financials.totalBilled}, 
                Expenses: ${financials.totalExpenses}, 
                Net Position: ${financials.netPosition}.
                Provide a high-fidelity tactical financial briefing. 
                Identify potential tax efficiencies or burn rate anomalies in 3 concise sentences. No markdown formatting.`;
            
            const response = await ai.models.generateContent({ 
                model: 'gemini-3-flash-preview', 
                contents: prompt 
            });
            setAuditReport(response.text || "Audit complete. Registry state: Nominal.");
            showToast("Fiscal Intelligence Dossier Compiled", "success");
        } catch (e) {
            showToast("Neural Bridge Failure", "error");
        } finally {
            setIsAuditing(false);
        }
    };

    return (
        <div className="space-y-12 animate-fade-in pb-24 text-left selection:bg-red-600/30">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12 text-left">
                <div className="text-left">
                    <div className="flex items-center gap-4 mb-4 text-left">
                        <WalletIcon className="h-10 w-10 text-red-600 shadow-2xl animate-pulse" />
                        <span className="text-[12px] font-black uppercase tracking-[0.5em] text-red-600 italic">FINANCIAL_NERVE_CENTER v1.2</span>
                    </div>
                    <h1 className="text-7xl font-black text-white tracking-tighter uppercase italic leading-none text-left">THE <span className="text-red-600 text-glow-red">LEDGER</span></h1>
                    <p className="text-slate-500 mt-6 font-mono text-sm tracking-widest uppercase italic max-w-2xl leading-relaxed text-left">"National grid synchronized receivables. Automated spend tracking and revenue audit telemetry established."</p>
                </div>
                
                <button 
                    onClick={runNeuralFiscalAudit}
                    disabled={isAuditing}
                    className="bg-white text-slate-950 font-black py-6 px-16 rounded-[2.5rem] flex items-center gap-5 transition-all transform active:scale-95 shadow-2xl border-4 border-slate-950 uppercase text-xs tracking-widest group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    {isAuditing ? <ArrowPathIcon className="h-6 w-6 animate-spin" /> : <SparklesIcon className="h-6 w-6 text-red-600 animate-pulse" />}
                    Execute Fiscal Audit
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
                <LedgerHUDCard label="Grid Liquidity" value={financials.totalBilled} sub="Net Billed Receivables" icon={BanknotesIcon} color="bg-blue-600" />
                <LedgerHUDCard label="Operational Burn" value={financials.totalExpenses} sub="Resource Consumption" icon={ArrowTrendingDownIcon} color="bg-red-600" />
                <LedgerHUDCard label="Net Settlement" value={financials.netPosition} sub="Handshake Profit" icon={CurrencyDollarIcon} color="bg-emerald-600" />
                <LedgerHUDCard label="Settled Volume" value={financials.totalPaid} sub="Verification Finalized" icon={ShieldCheckIcon} color="bg-purple-600" />
            </div>

            {auditReport && (
                <div className="bg-slate-900 border border-blue-500/30 p-12 rounded-[4rem] shadow-2xl animate-fade-in-up relative overflow-hidden group text-left">
                     <div className="absolute inset-0 bg-carbon opacity-10"></div>
                     <div className="absolute top-0 right-0 p-12 opacity-5 transform group-hover:scale-110 transition-transform duration-1000"><SparklesIcon className="h-48 w-48 text-blue-500" /></div>
                     
                     <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 text-left">
                        <div className="w-48 h-48 rounded-full border-[12px] border-blue-600 flex flex-col items-center justify-center bg-slate-950 shadow-2xl shrink-0">
                             <SparklesIcon className="h-12 w-12 text-blue-500 animate-pulse mb-2" />
                             <span className="text-4xl font-black italic text-white tracking-tighter">94.2</span>
                             <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Trust Index</span>
                        </div>
                        <div className="flex-grow text-left">
                             <h4 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-6 underline decoration-blue-600 decoration-8 underline-offset-8 text-left">Neural Intelligence Briefing</h4>
                             <p className="text-xl text-blue-100 leading-relaxed italic font-serif text-left">"{auditReport}"</p>
                        </div>
                     </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
                <div className="lg:col-span-4 space-y-10 text-left">
                    <div className="bg-slate-950 p-10 rounded-[4rem] shadow-2xl border border-white/5 relative overflow-hidden group text-left">
                        <div className="absolute inset-0 bg-carbon opacity-5"></div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-10 flex items-center gap-4 text-left">
                            <ChartBarIcon className="h-8 w-8 text-blue-500" />
                            Sector <span className="text-blue-500">Analysis</span>
                        </h3>
                        <div className="space-y-6 text-left">
                            {Object.entries(financials.categorySpend).map(([cat, amount]) => {
                                const percentage = financials.totalExpenses > 0 ? (Number(amount) / financials.totalExpenses) * 100 : 0;
                                return (
                                    <div key={cat} className="space-y-2 group/cat cursor-help text-left">
                                        <div className="flex justify-between items-end text-left">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/cat:text-white transition-colors">{cat}</span>
                                            <span className="text-sm font-black text-white italic">{formatCurrency(Number(amount))}</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                            <div 
                                                className={`h-full transition-all duration-1000 ${cat === 'Materials' ? 'bg-blue-600' : cat === 'Labor' ? 'bg-red-600' : 'bg-slate-500'}`} 
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 bg-slate-900 rounded-[5rem] border border-white/5 shadow-2xl overflow-hidden relative text-left">
                    <div className="absolute inset-0 bg-carbon opacity-5 pointer-events-none"></div>
                    <div className="p-10 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-slate-950/50 text-left">
                        <div className="text-left">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Registry <span className="text-red-600">Nodes</span></h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Live Transactional Feed: SECURE_UPLINK</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto text-left">
                        <table className="w-full text-left">
                            <thead className="bg-black/30 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
                                <tr>
                                    <th className="px-10 py-6 text-left">Node Descriptor</th>
                                    <th className="px-10 py-6 text-left">Client Identity</th>
                                    <th className="px-10 py-6 text-right">Settlement</th>
                                    <th className="px-10 py-6 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-left">
                                {clientInvoices.length > 0 ? (
                                    clientInvoices.slice(0, 10).map((inv, idx) => (
                                        <tr key={idx} className="group hover:bg-white/5 transition-all duration-300 text-left">
                                            <td className="px-10 py-8 text-left">
                                                <div className="flex items-center gap-5 text-left">
                                                     <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-white/10 shadow-inner">
                                                        <DocumentTextIcon className="h-5 w-5 text-slate-500 group-hover:text-blue-500 transition-colors" />
                                                     </div>
                                                     <div className="text-left">
                                                        <p className="font-black text-white uppercase italic tracking-tight text-lg leading-none">ORD-{inv.invoiceNumber}</p>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Fiscal Payload</p>
                                                     </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-left">
                                                <p className="text-sm font-bold text-slate-300 truncate uppercase">{inv.clientName}</p>
                                                <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">GRID_NODE_{inv.id.slice(0,6).toUpperCase()}</p>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <p className="text-2xl font-black text-white italic tracking-tighter leading-none">{formatCurrency(Number(inv.total))}</p>
                                                <p className="text-[9px] font-black uppercase mt-2 tracking-widest text-right">Net Credit</p>
                                            </td>
                                            <td className="px-10 py-8">
                                                 <div className="flex justify-center text-center">
                                                     <span className={`px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${inv.status === 'Paid' ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-800/40 text-slate-500 border-white/5'}`}>
                                                         {inv.status}
                                                     </span>
                                                 </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-10 py-32 text-center text-slate-700 italic font-black uppercase tracking-[1em] text-xs">Awaiting Grid Transmissions...</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractorLedger;