import React, { useState } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { 
    DocumentTextIcon, SparklesIcon, XMarkIcon, 
    MagnifyingGlassIcon, BookOpenIcon, WrenchScrewdriverIcon, 
    CommandLineIcon, CpuChipIcon, 
    TruckIcon, ChartBarIcon, FireIcon, BoltIcon, ArrowRightIcon,
    ShoppingCartIcon, ArrowLeftIcon, ArrowDownTrayIcon
} from '@heroicons/react/24/solid';
import { GoogleGenAI } from '@google/genai';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

// Premium Dossier Header for the Manual
const DossierHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
    <div className="border-l-4 border-blue-600 pl-6 mb-10">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">{title}</h2>
        <p className="text-slate-500 font-mono text-xs mt-1 uppercase tracking-[0.3em]">{subtitle}</p>
    </div>
);

const ModuleCard: React.FC<{ title: string; desc: string; icon: React.ElementType; color: string; onClick: () => void }> = ({ title, desc, icon: Icon, color, onClick }) => (
    <button 
        onClick={onClick}
        className="bg-white group p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl hover:border-blue-500/30 transition-all duration-500 text-left relative overflow-hidden flex flex-col h-full"
    >
        <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
            <Icon className="h-24 w-24 transform rotate-12" />
        </div>
        <div className={`${color} p-3 rounded-2xl w-fit mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
            <Icon className="h-6 w-6 text-white"/>
        </div>
        <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight mb-2">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">{desc}</p>
        <div className="flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest border-t border-slate-50 pt-4 group-hover:underline">
            Access Schematic <ArrowRightIcon className="h-3 w-3"/>
        </div>
    </button>
);

const HelpPage: React.FC = () => {
    const { t } = useLocalization();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [query, setQuery] = useState('');
    const [guideTitle, setGuideTitle] = useState('');
    const [guideContent, setGuideContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [view, setView] = useState<'directory' | 'reader'>('directory');

    const handleGenerateManual = async (topic: string) => {
        if (!process.env.API_KEY) {
            showToast("Neural Link Unavailable (API Key Missing)", "error");
            return;
        }

        setIsLoading(true);
        setGuideTitle(topic);
        setView('reader');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                Generate a premium "Technical Operations Manual" article for the StockLink Ferrari Build (v55).
                Topic: ${topic}
                Context: For a South African ${user?.role}.
                Tone: Highly professional, technical, yet clear.
                
                Requirements:
                1. Start with a "System Overview" paragraph.
                2. Use "Protocol" instead of "Steps".
                3. Reference the "Neural AI Core" where applicable.
                4. Include a "Tactical Tip" section at the end.
                5. Do NOT use markdown symbols like # or *. Use plain text with spacing and bold headers.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });

            setGuideContent(response.text);
        } catch (err) {
            showToast("Manual Generation Failed", "error");
            setView('directory');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) handleGenerateManual(query);
    };

    return (
        <div className="pb-20 max-w-7xl mx-auto px-4">
            {view === 'directory' ? (
                <div className="animate-fade-in-up">
                    <div className="bg-slate-900 rounded-[3rem] p-12 text-white mb-12 shadow-2xl relative overflow-hidden border border-white/10">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        <div className="absolute top-0 right-0 p-12 opacity-10">
                            <CommandLineIcon className="h-64 w-64 text-blue-500" />
                        </div>
                        
                        <div className="relative z-10">
                            <p className="text-blue-400 font-black text-xs uppercase tracking-[0.4em] mb-4">Central Intelligence Hub</p>
                            <h1 className="text-6xl font-black tracking-tighter mb-8 italic uppercase">TECHNICAL <span className="text-blue-500">MANUAL</span></h1>
                            
                            <form onSubmit={handleSearch} className="max-w-2xl relative">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-500"/>
                                <input 
                                    type="text" 
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search the Neural Knowledge Base..." 
                                    className="w-full bg-white/10 backdrop-blur-xl border border-white/20 p-5 pl-14 rounded-2xl text-lg font-bold placeholder-slate-500 focus:ring-4 focus:ring-blue-500/50 outline-none transition-all"
                                />
                                <button type="submit" className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white font-black px-6 rounded-xl transition-all shadow-lg text-xs uppercase tracking-widest">
                                    Execute
                                </button>
                            </form>
                        </div>
                    </div>

                    <DossierHeader title="System Modules" subtitle="Operational Schematics and Protocols" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ModuleCard 
                            title="Neural Core" 
                            desc="Understanding the AI-driven predictive business nervous system and real-time pulse."
                            icon={CpuChipIcon}
                            color="bg-purple-600"
                            onClick={() => handleGenerateManual("StockLink Neural AI Core and Real-time Prediction")}
                        />
                        <ModuleCard 
                            title="Procurement" 
                            desc="Schematics for nationwide sourcing, smart quote builders, and SANS compliance."
                            icon={ShoppingCartIcon}
                            color="bg-blue-600"
                            onClick={() => handleGenerateManual("Optimized Material Sourcing and SANS Compliance")}
                        />
                        <ModuleCard 
                            title="Logistics" 
                            desc="The dispatch grid, driver tracking, and route optimization protocols."
                            icon={TruckIcon}
                            color="bg-emerald-600"
                            onClick={() => handleGenerateManual("Logistics Management and Driver Tactical HUD")}
                        />
                        <ModuleCard 
                            title="Finance" 
                            desc="Digital wallet, Paystack integration, and automated ZAR accounting."
                            icon={ChartBarIcon}
                            color="bg-amber-600"
                            onClick={() => handleGenerateManual("Project Financial Tracking and Invoicing Automation")}
                        />
                    </div>

                    <div className="mt-20">
                         <DossierHeader title="Tactical Assets" subtitle="Client Onboarding and External Guides" />
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200 flex items-center justify-between group">
                                <div>
                                    <h4 className="font-black text-xl text-slate-800 uppercase tracking-tight">Homeowner Portal Guide</h4>
                                    <p className="text-slate-500 text-sm mt-2 max-w-xs">Draft a custom manual to show your clients how to track their project on StockLink.</p>
                                    <button onClick={() => handleGenerateManual("Homeowner's Guide to Tracking a Project via StockLink Portal")} className="mt-6 bg-slate-900 text-white font-black py-3 px-6 rounded-xl shadow-lg hover:bg-black transition-all uppercase tracking-widest text-xs">Generate Document</button>
                                </div>
                                <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100 group-hover:rotate-6 transition-transform">
                                    <FireIcon className="h-12 w-12 text-orange-500" />
                                </div>
                            </div>
                            <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100 flex items-center justify-between group">
                                <div>
                                    <h4 className="font-black text-xl text-blue-900 uppercase tracking-tight">Supplier API Schematic</h4>
                                    <p className="text-blue-700/60 text-sm mt-2 max-w-xs">Documentation for wholesalers looking to sync their ERP systems with StockLink.</p>
                                    <button onClick={() => handleGenerateManual("Supplier Integration Schematic and ERP Sync Protocols")} className="mt-6 bg-blue-600 text-white font-black py-3 px-6 rounded-xl shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest text-xs">Generate Specs</button>
                                </div>
                                <div className="p-6 bg-white rounded-3xl shadow-sm border border-blue-100 group-hover:-rotate-6 transition-transform">
                                    <BoltIcon className="h-12 w-12 text-blue-600" />
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in-up flex flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-8 px-4">
                        <button onClick={() => setView('directory')} className="flex items-center gap-2 text-slate-500 font-black uppercase tracking-widest text-xs hover:text-slate-900 transition-colors">
                            <ArrowLeftIcon className="h-4 w-4" /> Return to Dossier
                        </button>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            Secure Uplink Active
                        </div>
                    </div>

                    <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 flex flex-col min-h-[80vh]">
                         <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter italic">FILE: {guideTitle}</h2>
                                <p className="text-blue-400 text-[10px] font-mono mt-1">STOCKLINK SECURITY CLEARANCE LEVEL 04</p>
                            </div>
                            <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                                <BookOpenIcon className="h-6 w-6 text-blue-400" />
                            </div>
                         </div>
                         
                         <div className="p-12 overflow-y-auto flex-grow bg-[url('https://www.transparenttextures.com/patterns/lined-paper-2.png')]">
                             {isLoading ? (
                                 <div className="flex flex-col items-center justify-center h-full py-20">
                                     <div className="relative w-20 h-20 mb-6">
                                         <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                                         <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                                         <SparklesIcon className="absolute inset-0 m-auto h-8 w-8 text-blue-600 animate-pulse"/>
                                     </div>
                                     <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Drafting Technical Content...</p>
                                 </div>
                             ) : (
                                 <div className="prose prose-slate max-w-none">
                                     <div className="whitespace-pre-wrap font-serif text-lg text-slate-800 leading-relaxed first-letter:text-5xl first-letter:font-black first-letter:text-blue-600 first-letter:mr-3 first-letter:float-left">
                                         {guideContent}
                                     </div>
                                 </div>
                             )}
                         </div>

                         <div className="p-6 bg-slate-50 border-t flex justify-between items-center no-print">
                             <div className="flex gap-2">
                                <span className="text-[10px] font-black bg-slate-200 text-slate-500 px-2 py-1 rounded">REV 1.0.55</span>
                                <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-1 rounded">VERIFIED CONTENT</span>
                             </div>
                             <button onClick={() => window.print()} className="bg-slate-900 text-white font-black px-6 py-2 rounded-xl text-xs uppercase tracking-widest hover:bg-black shadow-lg flex items-center gap-2">
                                 <ArrowDownTrayIcon className="h-4 w-4"/> Download Dossier
                             </button>
                         </div>
                    </div>
                </div>
            )}
            
            {/* Global Watermark */}
            <div className="fixed bottom-10 left-10 pointer-events-none opacity-5 -z-10 rotate-90">
                <span className="text-[120px] font-black tracking-tighter text-slate-900">FERRARI v55</span>
            </div>
        </div>
    );
};

export default HelpPage;