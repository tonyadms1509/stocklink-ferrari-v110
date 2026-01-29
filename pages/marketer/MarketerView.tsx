
import React, { useState, useMemo } from 'react';
import { 
    LayoutGrid, Users, DollarSign, Globe, 
    TrendingUp, Award, Share2, ClipboardList,
    Rocket, ShieldCheck, Zap, Mail, ChevronRight,
    ArrowUpRight, Target, Activity, Megaphone,
    Search, Sparkles, Download, MessageSquare,
    Radio, Signal, FileText, BarChart3,
    RefreshCcw, Eye, ShieldAlert, Laptop
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';
import { useCurrency } from '../../hooks/useCurrency';
import AnimatedNumber from '../../components/AnimatedNumber';
import { useToast } from '../../hooks/useToast';
import { CommissionRecord, PostType } from '../../types';
import { GoogleGenAI, Type } from '@google/genai';
import EmptyState from '../../components/EmptyState';

const ExpansionCard = ({ title, value, sub, color, icon: Icon, isCurrency = false }: any) => {
    const { formatCurrency } = useCurrency();
    return (
      <div className="bg-slate-900 border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group text-left h-full transition-all duration-500 hover:border-red-600/40">
        <div className="absolute inset-0 bg-carbon opacity-5 group-hover:opacity-10 transition-opacity"></div>
        <div className="flex justify-between items-start mb-10 relative z-10 text-left">
            <div className={`p-5 rounded-3xl ${color} bg-opacity-10 shadow-2xl border border-white/5 group-hover:bg-opacity-20 transition-all`}>
                <Icon size={28} className={color.replace('bg-', 'text-')} />
            </div>
            <div className="flex gap-1.5">
                 <div className="w-1 h-3 bg-red-600 rounded-full animate-pulse"></div>
                 <div className="w-1 h-3 bg-red-600 rounded-full animate-pulse delay-100"></div>
                 <div className="w-1 h-3 bg-red-600 rounded-full animate-pulse delay-200"></div>
            </div>
        </div>
        <div className="relative z-10 text-left">
            <h3 className="text-6xl font-black text-white tracking-tighter italic uppercase leading-none mb-6 drop-shadow-2xl">
                {isCurrency ? formatCurrency(value) : <AnimatedNumber value={value} />}
            </h3>
            <div className="flex items-center gap-4 border-l-4 border-red-600 pl-6">
                <div className="text-left">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none mb-2 text-left">{title}</p>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest italic text-left">{sub || 'Grid Yield v110.0'}</p>
                </div>
            </div>
        </div>
      </div>
    );
};

const MarketingAssetForge: React.FC = () => {
    const { showToast } = useToast();
    const [prompt, setPrompt] = useState('');
    const [isForging, setIsForging] = useState(false);
    const [asset, setAsset] = useState<{ copy: string, imageUrl: string } | null>(null);

    const handleForge = async () => {
        if (!prompt.trim() || !process.env.API_KEY) return;
        setIsForging(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Generate Marketing Copy
            const copyResponse = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Forge high-fidelity recruitment copy for the StockLink Ferrari construction grid. Target: ${prompt}. Tone: Elite, Strategic, High-Performance. Max 100 words. No markdown.`
            });

            // Generate Marketing Image using pro model
            const imageResponse = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: { parts: [{ text: `A futuristic, high-performance construction management dashboard with South African city skyline (Sandton or Cape Town) in background, cinematic red and blue lighting, 8k resolution, stocklink logo style. Context: ${prompt}` }] },
                config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
            });

            const imagePart = imageResponse.candidates?.[0]?.content?.parts.find(p => p.inlineData);
            
            setAsset({
                copy: copyResponse.text || '',
                imageUrl: imagePart ? `data:image/png;base64,${imagePart.inlineData.data}` : 'https://picsum.photos/seed/grid/800/450'
            });
            showToast("Recruitment Asset Forged", "success");
        } catch (e) {
            showToast("Forge Interference Detected", "error");
        } finally {
            setIsForging(false);
        }
    };

    return (
        <div className="space-y-12 animate-fade-in-up text-left">
            <div className="bg-slate-900 border border-white/10 rounded-[4rem] p-12 shadow-2xl relative overflow-hidden text-left">
                <div className="absolute inset-0 bg-carbon opacity-10"></div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-8 flex items-center gap-5 text-left">
                    <Sparkles className="h-10 w-10 text-blue-500 animate-pulse" />
                    Asset <span className="text-blue-500">Forge</span>
                </h3>
                <div className="flex flex-col md:flex-row gap-6">
                    <input 
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="Define targeting parameters (e.g. 'Electrical Contractors in Gauteng')..."
                        className="flex-grow p-6 bg-white/5 border-2 border-white/5 rounded-3xl text-white font-bold outline-none focus:border-blue-600 transition-all shadow-inner"
                    />
                    <button 
                        onClick={handleForge}
                        disabled={isForging || !prompt.trim()}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-black py-6 px-12 rounded-3xl shadow-xl transition-all transform active:scale-95 disabled:opacity-30 flex items-center justify-center gap-4 uppercase tracking-widest text-xs border border-white/10"
                    >
                        {isForging ? <RefreshCcw className="animate-spin" /> : <Rocket size={20} />}
                        Execute Forge
                    </button>
                </div>
            </div>

            {asset && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in-up text-left">
                    <div className="bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 group">
                         <img src={asset.imageUrl} className="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-1000" alt="Recruitment Asset" />
                         <div className="p-10 border-t border-white/5 flex justify-between items-center text-left">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recruitment Visual v1.0</span>
                            <button className="p-4 bg-white/5 hover:bg-blue-600 text-slate-400 hover:text-white rounded-2xl transition-all">
                                <Download size={20}/>
                            </button>
                         </div>
                    </div>
                    <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-left relative overflow-hidden flex flex-col justify-between">
                         <div className="absolute top-0 right-0 p-8 opacity-5 text-left"><Share2 size={200} className="text-slate-900" /></div>
                         <div className="relative z-10 text-left">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-8 border-b pb-4 text-left">Forged Transmission Copy</h4>
                            <p className="text-xl text-slate-800 italic font-serif leading-loose text-left">"{asset.copy}"</p>
                         </div>
                         <div className="mt-12 flex gap-4 relative z-10 text-left">
                             <button onClick={() => { navigator.clipboard.writeText(asset.copy); showToast("Copy Transferred", "success"); }} className="flex-1 bg-slate-900 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-[10px] transform active:scale-95 transition-all">Copy Schematic</button>
                             <button className="flex-1 bg-blue-600 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-[10px] transform active:scale-95 transition-all shadow-xl">Broadcast to Grid</button>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MarketerView: React.FC = () => {
    const { user } = useAuth();
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [aiDirective, setAiDirective] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);

    const commissionRecords: CommissionRecord[] = [
        { id: '1', nodeName: 'Johannesburg Bricks', nodeType: 'supplier', status: 'Settled', amount: 2500, residual: 450, timestamp: new Date() },
        { id: '2', nodeName: 'Sipho Contractors', nodeType: 'contractor', status: 'Pending', amount: 1200, residual: 180, timestamp: new Date() },
        { id: '3', nodeName: 'Elite Plumbers CC', nodeType: 'contractor', status: 'Settled', amount: 1200, residual: 180, timestamp: new Date() },
        { id: '4', nodeName: 'Cape Sourcing Node', nodeType: 'supplier', status: 'Settled', amount: 3500, residual: 620, timestamp: new Date(new Date().getTime() - 86400000 * 2) },
    ];

    const stats = useMemo(() => {
        const totalSettled = commissionRecords.filter(r => r.status === 'Settled').reduce((sum, r) => sum + r.amount, 0);
        const totalResidual = commissionRecords.filter(r => r.status === 'Settled').reduce((sum, r) => sum + r.residual, 0);
        return { totalSettled, totalResidual, activeNodes: commissionRecords.length };
    }, [commissionRecords]);

    const referralLink = `${window.location.origin}/#/signup?ref=${user?.referralCode || 'NODE_FORCE'}`;

    const generateDirective = async () => {
        if (!process.env.API_KEY) return;
        setIsScanning(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = "Identify the highest demand construction sectors in South Africa right now (e.g. Solar in Cape Town, Affordable Housing in GP). Provide a strategic recruitment directive for a StockLink Marketer in 2 sentences. No markdown.";
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });
            setAiDirective(response.text || '');
            showToast("Strategic Directive Decrypted", "success");
        } catch (e) {
            showToast("Directive Link Stalled", "error");
        } finally {
            setIsScanning(false);
        }
    };

    const navGroups = [
        {
            title: 'Expansion Command',
            items: [
                { id: 'dashboard', label: 'Mission HUD', icon: LayoutGrid },
                { id: 'ledger', label: 'Payout Ledger', icon: DollarSign },
                { id: 'marketing-kit', label: 'Asset Forge', icon: Share2 },
            ]
        },
        {
            title: 'Registry Hub',
            items: [
                { id: 'messages', label: 'Comms Link', icon: Mail },
                { id: 'settings', label: 'Config', icon: Globe },
            ]
        }
    ];

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        showToast("Expansion Link Copied", "success");
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="space-y-12 animate-fade-in-up-scale text-left">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12 text-left">
                            <div className="text-left">
                                <div className="flex items-center gap-3 mb-6 text-red-600 text-left">
                                    <TrendingUp size={24} className="animate-pulse shadow-[0_0_15px_red]" />
                                    <span className="text-[12px] font-black uppercase tracking-[0.6em] italic text-left">EXPANSION_FORCE v110.0</span>
                                </div>
                                <h2 className="text-8xl md:text-9xl font-black text-white tracking-tighter uppercase italic leading-[0.8] drop-shadow-2xl text-left">THE <span className="text-red-600 text-glow-red">HUD</span></h2>
                            </div>
                            <div className="bg-slate-900 border-4 border-blue-500/30 p-8 rounded-[3rem] flex items-center gap-8 shadow-[0_0_50px_rgba(37,99,235,0.1)] transition-all hover:scale-105 text-left">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-500 tracking-widest mb-1">Commander Rank</p>
                                    <p className="text-3xl font-black text-blue-400 italic tracking-tighter uppercase leading-none">Elite Commander</p>
                                </div>
                                <div className="p-4 bg-blue-600 rounded-2xl shadow-2xl shadow-blue-900/40">
                                    <Award className="text-white" size={32} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
                            <ExpansionCard title="Yield Settled" value={stats.totalSettled} sub="Direct Commission Pulse" icon={DollarSign} color="bg-emerald-500" isCurrency />
                            <ExpansionCard title="Residual Pulse" value={stats.totalResidual} sub="Recurring Node Royalty" icon={Zap} color="bg-blue-600" isCurrency />
                            <ExpansionCard title="Grid Footprint" value={stats.activeNodes} sub="Verified Synchronizations" icon={Users} color="bg-purple-600" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
                            <div className="bg-slate-900 border border-white/10 rounded-[5rem] p-16 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative overflow-hidden group text-left">
                                <div className="absolute inset-0 bg-carbon opacity-10"></div>
                                <div className="absolute top-0 right-0 p-12 opacity-5 transform group-hover:rotate-12 group-hover:scale-110 transition-transform duration-2000 text-left"><Globe size={600} className="text-white" /></div>
                                <div className="relative z-10 flex flex-col items-start text-left">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Activity size={20} className="text-blue-500 animate-pulse" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-500">Node Sync Protocol</span>
                                    </div>
                                    <h4 className="text-5xl font-black italic uppercase tracking-tighter text-white mb-6 leading-none text-left">Expansion <span className="text-blue-500">Coordinate</span></h4>
                                    <p className="text-xl text-slate-400 mb-12 font-medium italic leading-relaxed max-w-lg text-left">"Successful first-month subscription handshake triggers immediate ZAR settlement."</p>
                                    <div className="w-full flex flex-col sm:flex-row bg-black/60 p-5 rounded-[2.5rem] border border-white/5 items-center justify-between gap-6 shadow-inner backdrop-blur-md text-left">
                                        <span className="text-sm font-mono text-slate-500 truncate px-4 select-all">{referralLink}</span>
                                        <button onClick={handleCopy} className="w-full sm:w-auto p-5 bg-white text-slate-950 rounded-[1.5rem] hover:bg-blue-600 hover:text-white transition-all transform active:scale-95 shadow-2xl flex items-center justify-center gap-3 border-4 border-slate-900">
                                            <Share2 size={20}/>
                                            <span className="uppercase font-black text-[10px] tracking-widest">Copy Link</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-950 border-4 border-red-600 rounded-[5rem] p-16 shadow-[0_0_80px_rgba(220,0,0,0.2)] relative overflow-hidden group flex flex-col justify-between text-left">
                                <div className="absolute inset-0 bg-carbon opacity-5"></div>
                                <div className="relative z-10 text-left">
                                    <div className="flex items-center gap-4 mb-10 text-left">
                                        <div className="p-4 bg-red-600 rounded-2xl shadow-2xl shadow-red-900/40 animate-pulse"><Target className="text-white" size={24}/></div>
                                        <div className="text-left">
                                             <p className="text-[10px] font-black uppercase text-red-500 tracking-[0.5em] leading-none text-left">Neural Intelligence</p>
                                             <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white mt-3 text-left">Tactical <span className="text-red-600">Directive</span></h3>
                                        </div>
                                    </div>
                                    <div className="min-h-[120px] flex items-center text-left">
                                        {isScanning ? (
                                            <div className="flex items-center gap-6 text-left">
                                                <RefreshCcw className="h-10 w-10 text-slate-700 animate-spin"/>
                                                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] animate-pulse text-left">Decrypting Regional Demand Matrix...</p>
                                            </div>
                                        ) : aiDirective ? (
                                            <p className="text-2xl text-blue-100 font-medium italic leading-relaxed text-left">"{aiDirective}"</p>
                                        ) : (
                                            <p className="text-lg text-slate-600 font-medium italic leading-relaxed text-left">"Initialize grid scan to identify high-probability recruitment sectors and regional material deficits."</p>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    onClick={generateDirective}
                                    disabled={isScanning}
                                    className="relative z-10 w-full bg-white text-slate-950 font-black py-6 rounded-[2.5rem] mt-12 uppercase tracking-[0.4em] text-xs transform active:scale-95 transition-all shadow-2xl border-4 border-slate-900"
                                >
                                    {isScanning ? 'Synchronizing...' : 'Execute National Scan'}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'ledger':
                return (
                    <div className="space-y-12 animate-fade-in-up text-left">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-12 text-left">
                            <div className="text-left">
                                <div className="flex items-center gap-3 mb-6 text-blue-500 text-left">
                                    <ClipboardList size={24} className="animate-pulse shadow-[0_0_15px_blue]" />
                                    <span className="text-[12px] font-black uppercase tracking-[0.6em] italic text-blue-500 text-left">SETTLEMENT_LEDGER v110.0</span>
                                </div>
                                <h2 className="text-7xl font-black text-white tracking-tighter uppercase italic leading-none text-left">NODE <span className="text-blue-500 text-glow-blue">REGISTRY</span></h2>
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-white/5 rounded-[4rem] p-12 shadow-2xl text-left overflow-hidden relative">
                             <div className="absolute inset-0 bg-carbon opacity-5"></div>
                             <div className="space-y-6 relative z-10 text-left">
                                 {commissionRecords.map(record => (
                                     <div key={record.id} className="flex flex-col md:flex-row items-center justify-between p-10 bg-white/5 rounded-[3rem] border border-white/5 hover:bg-white/10 transition-all group cursor-default shadow-inner gap-10 text-left">
                                         <div className="flex items-center gap-8 w-full md:w-auto text-left">
                                             <div className={`p-6 rounded-[2rem] ${record.nodeType === 'supplier' ? 'bg-amber-600' : 'bg-blue-600'} bg-opacity-20 shadow-2xl border border-white/5 group-hover:scale-110 transition-transform text-left`}>
                                                 {record.nodeType === 'supplier' ? <Globe className="text-amber-500" size={28}/> : <Zap className="text-blue-500" size={28}/>}
                                             </div>
                                             <div className="text-left">
                                                 <p className="font-black text-white italic uppercase tracking-tight text-3xl leading-none group-hover:text-blue-400 transition-colors mb-4 text-left">{record.nodeName}</p>
                                                 <div className="flex items-center gap-3 text-left">
                                                     <span className={`px-4 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${record.status === 'Settled' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'}`}>{record.status}</span>
                                                     <div className="w-1.5 h-1.5 rounded-full bg-slate-700 text-left"></div>
                                                     <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest font-mono text-left">Synced: {record.timestamp.toLocaleDateString()}</span>
                                                 </div>
                                             </div>
                                         </div>
                                         <div className="flex gap-16 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 md:border-l border-white/5 pt-8 md:pt-0 md:pl-16 text-left">
                                             <div className="text-left">
                                                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-2 text-left">Sync Yield</p>
                                                 <p className="text-4xl font-black text-white italic tracking-tighter drop-shadow-lg text-left">{formatCurrency(record.amount)}</p>
                                             </div>
                                             <div className="text-right">
                                                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-2 text-right">Residual Flux</p>
                                                 <p className="text-2xl font-black text-blue-500 italic tracking-tighter leading-none text-right">+{formatCurrency(record.residual)}</p>
                                                 <p className="text-[8px] font-bold text-slate-700 uppercase mt-2 text-right">Per Month</p>
                                             </div>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                             <div className="mt-16 text-center text-left">
                                 <button className="text-[11px] font-black uppercase text-slate-500 hover:text-white tracking-[0.8em] transition-colors border-b-2 border-white/5 pb-2 text-left">Full Expansion Ledger</button>
                             </div>
                        </div>
                    </div>
                );
            case 'marketing-kit':
                return <MarketingAssetForge />;
            default:
                return null;
        }
    };

    return (
        <DashboardLayout 
            activeTab={activeTab} 
            onNavigate={setActiveTab} 
            navGroups={navGroups} 
            mobileNavItems={[
                { id: 'dashboard', icon: LayoutGrid, label: 'HUD' },
                { id: 'ledger', icon: DollarSign, label: 'Ledger' },
                { id: 'marketing-kit', icon: Share2, label: 'Forge' },
                { id: 'menu', icon: Laptop, label: 'Menu', action: () => document.dispatchEvent(new CustomEvent('toggle-mobile-menu')) }
            ]}
        >
             <div className="w-full relative px-4 md:px-8 pb-32 text-left">
                {renderContent()}
                <div className="ferrari-watermark">EXPANSION_FORCE</div>
            </div>
        </DashboardLayout>
    );
};

export default MarketerView;
