import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { 
  MagnifyingGlassIcon, 
  ArrowPathIcon, 
  SparklesIcon, 
  ChartBarIcon, 
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid';
import { useCurrency } from '../../hooks/useCurrency.tsx';
import { useToast } from '../../hooks/useToast.tsx';
import AnimatedNumber from '../../components/AnimatedNumber.tsx';
import { useData } from '../../hooks/useDataContext.tsx';

interface PriceResult {
  retailer: string;
  price: number;
  location: string;
  availability: string;
}

const NationalPriceWatch: React.FC = () => {
  const { formatCurrency } = useCurrency();
  const { showToast } = useToast();
  const { isGridSaturated } = useData();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PriceResult[]>([]);
  const [insight, setInsight] = useState<string | null>(null);
  const [sources, setSources] = useState<{title: string, uri: string}[]>([]);

  const executeMarketScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !process.env.API_KEY) return;
    if (isGridSaturated) {
      showToast("Grid Nodes Cooling. Use cached data.", "warning");
      return;
    }

    setIsLoading(true);
    setResults([]);
    setInsight(null);
    setSources([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        Perform a real-time price audit for construction material: "${query}" in South Africa (ZAR).
        Locate actual prices from major retailers like Builders, Cashbuild, Chamberlains, and Leroy Merlin.
        
        Return a JSON object with:
        1. "benchmarks": Array of objects { "retailer": string, "price": number, "location": string, "availability": string }
        2. "tacticalBrief": A 2-sentence summary of the market arbitrage opportunity.
        
        Ensure prices are current for 2025.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview', // High quality + search grounding
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text || '{}');
      setResults(data.benchmarks || []);
      setInsight(data.tacticalBrief);
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const links = chunks
          .map((c: any) => c.web)
          .filter(Boolean)
          .map((w: any) => ({ title: w.title, uri: w.uri }));
        setSources(links);
      }

      showToast("Market Intelligence Synchronized", "success");
    } catch (e) {
      console.error("Price Watch Failure:", e);
      showToast("Neural Bridge Interference", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in pb-24 text-left font-sans">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 border-b border-white/5 pb-12">
        <div className="text-left">
           <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-3 px-5 py-2 bg-blue-600/10 border border-blue-500/20 rounded-2xl backdrop-blur-md">
                    <GlobeAltIcon className="h-5 w-5 text-blue-500 animate-pulse shadow-[0_0_15px_#2563eb]" />
                    <span className="text-[11px] font-black text-blue-500 uppercase tracking-widest italic">NATIONAL_PRICE_INDEX v1.0</span>
                </div>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.6em] font-mono">NODE_PRICE_AUDIT</span>
            </div>
          <h1 className="text-8xl md:text-9xl font-black text-white tracking-tighter uppercase italic leading-[0.75]">PRICE <span className="text-blue-600 text-glow-blue">WATCH</span></h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900 border border-white/10 rounded-[4rem] p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-carbon opacity-10"></div>
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-10 flex items-center gap-5 relative z-10 leading-none">
              <div className="w-1.5 h-10 bg-blue-600 rounded-full shadow-[0_0_20px_#2563eb]"></div>
              Scan <span className="text-blue-600">Request</span>
            </h3>
            
            <form onSubmit={executeMarketScan} className="space-y-8 relative z-10 text-left">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3">Technical Payload Identifier</label>
                <input 
                  type="text" 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="e.g. PPC Cement 50kg 42.5N"
                  className="w-full p-5 bg-white/5 border-2 border-white/5 rounded-3xl text-white font-bold focus:border-blue-600 outline-none transition-all italic tracking-tight"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading || !query.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-[2.5rem] text-[10px] uppercase tracking-[0.4em] shadow-[0_0_50px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-4 transform active:scale-95 disabled:opacity-30 border border-white/10"
              >
                {isLoading ? <ArrowPathIcon className="h-6 w-6 animate-spin" /> : <MagnifyingGlassIcon className="h-6 w-6 text-blue-200 animate-pulse" />}
                Execute National Audit
              </button>
            </form>
          </div>

          {insight && (
            <div className="bg-blue-600 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group border border-white/10 animate-fade-in-up text-left">
              <div className="absolute inset-0 bg-carbon opacity-10"></div>
              <div className="absolute top-0 right-0 p-8 opacity-20 transform -rotate-12 group-hover:scale-110 transition-transform duration-1000">
                <ArrowTrendingUpIcon className="h-48 w-48" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-4 opacity-70">Tactical Briefing</p>
              <h4 className="text-2xl font-black italic leading-tight text-left">"{insight}"</h4>
            </div>
          )}
        </div>

        <div className="lg:col-span-8 space-y-10">
          {isLoading ? (
            <div className="bg-slate-900 rounded-[5rem] border border-white/5 h-[600px] flex items-center justify-center shadow-inner relative overflow-hidden">
              <div className="absolute inset-0 bg-carbon opacity-20"></div>
              <div className="text-center animate-pulse">
                <div className="w-24 h-24 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-12 shadow-[0_0_40px_#2563eb]"></div>
                <p className="font-black text-slate-500 uppercase tracking-[0.8em] text-xs">Grounding Neural Response...</p>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up">
              {results.map((res, i) => (
                <div key={i} className="bg-slate-900 border border-white/5 p-10 rounded-[4rem] shadow-2xl relative overflow-hidden group hover:border-blue-500/50 transition-all duration-500">
                  <div className="absolute inset-0 bg-carbon opacity-5"></div>
                  <div className="flex justify-between items-start mb-8 relative z-10 text-left">
                    <div className="p-4 bg-blue-600/10 rounded-2xl shadow-inner border border-blue-500/20">
                      <BuildingStorefrontIcon className="h-8 w-8 text-blue-500" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 text-slate-500 rounded-full border border-white/10 italic">{res.location}</span>
                  </div>
                  <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2 leading-none text-left">{res.retailer}</h4>
                  <div className="flex items-baseline gap-4 mt-6">
                    <p className="text-5xl font-black text-blue-500 italic tracking-tighter leading-none text-left">{formatCurrency(res.price)}</p>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Base Rate</span>
                  </div>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-6 flex items-center gap-2 text-left">
                    <CheckCircleIcon className="h-4 w-4" /> {res.availability}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/50 border-4 border-dashed border-white/5 rounded-[5rem] h-[600px] flex flex-col items-center justify-center text-center opacity-30 group hover:opacity-50 transition-opacity duration-1000">
              <ChartBarIcon className="h-24 w-24 text-slate-700 mb-10 group-hover:scale-110 transition-transform duration-1000" />
              <p className="font-black uppercase tracking-[0.5em] text-sm text-slate-500 max-w-sm leading-loose italic text-left">"Awaiting operational identifier. Transmit material schematic to begin real-time regional grounding."</p>
            </div>
          )}

          {sources.length > 0 && (
            <div className="bg-slate-900 border border-white/5 p-10 rounded-[3rem] shadow-2xl animate-fade-in-up text-left">
              <h4 className="text-xs font-black text-blue-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-4 text-left">
                <div className="w-8 h-px bg-blue-600"></div>
                Verification Credentials
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {sources.map((source, i) => (
                  <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 bg-white/5 p-6 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all group/link shadow-inner text-left">
                    <div className="p-3 bg-blue-600/10 rounded-xl group-hover:link:bg-blue-600 transition-colors text-left">
                      <LinkIcon className="h-5 w-5 text-blue-400 group-hover:link:text-white" />
                    </div>
                    <span className="text-[11px] font-black text-slate-300 truncate uppercase tracking-widest group-hover:link:text-white text-left">{source.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="ferrari-watermark">PRICE_GRID</div>
    </div>
  );
};

export default NationalPriceWatch;