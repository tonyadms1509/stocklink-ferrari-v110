
import React, { useState } from 'react';
import { UserRole } from '../types';
import { 
    ShieldCheckIcon, StarIcon, WrenchScrewdriverIcon, 
    BuildingStorefrontIcon, SparklesIcon, CheckCircleIcon, 
    ArrowPathIcon, ArrowRightIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useLocalization } from '../hooks/useLocalization';
import { useCurrency } from '../hooks/useCurrency';

interface SubscriptionModalProps {
  onSubscribe: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onSubscribe }) => {
  const { user } = useAuth();
  const { t } = useLocalization();
  const { formatCurrency } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
        if (!process.env.API_KEY && (window as any).aistudio) {
             if (!(await (window as any).aistudio.hasSelectedApiKey())) {
                await (window as any).aistudio.openSelectKey();
            }
        }
        onSubscribe();
    } catch (e) {
        console.error("API key selection failed", e);
        onSubscribe(); 
    } finally {
        setIsLoading(false);
    }
  };
  
  const isContractor = user?.role === UserRole.Contractor;

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-[100] p-4 font-sans text-left">
      {/* Carbon Background */}
      <div className="absolute inset-0 bg-carbon opacity-20 pointer-events-none"></div>
      
      <div className="bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(37,99,235,0.2)] max-w-2xl w-full animate-fade-in-scale overflow-hidden border border-white/10 relative">
        <div className="p-12 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-8">
            <SparklesIcon className="h-4 w-4 animate-pulse" />
            Activation Protocol Required
          </div>
          
          <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">
            7-DAY <span className="text-blue-600">FREE</span> TRIAL
          </h2>
          <p className="text-slate-400 text-lg mb-12 max-w-md mx-auto font-medium">
            Activate your node to synchronize with the national construction grid. No settlement required for 7 days.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] text-left group hover:bg-white/10 transition-all">
                <div className="p-3 bg-blue-600 rounded-2xl w-fit mb-6 shadow-xl">
                    {isContractor ? <WrenchScrewdriverIcon className="h-6 w-6 text-white"/> : <BuildingStorefrontIcon className="h-6 w-6 text-white"/>}
                </div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tight mb-2">
                    {isContractor ? 'Contractor' : 'Supplier'} Core
                </h3>
                <p className="text-3xl font-black text-blue-500 tracking-tighter mb-4">
                    {formatCurrency(isContractor ? 199 : 499)}<span className="text-xs text-slate-500 font-bold uppercase tracking-widest ml-1">/mo</span>
                </p>
                <ul className="space-y-3">
                    {[
                        isContractor ? "National Sourcing" : "Inventory Ledger",
                        isContractor ? "AI Estimator" : "Sales Analytics",
                        isContractor ? "SANS Compliance" : "Dispatch Grid"
                    ].map(f => (
                        <li key={f} className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <CheckCircleIcon className="h-4 w-4 text-blue-500" /> {f}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="bg-blue-600 rounded-[2.5rem] p-8 text-left text-white shadow-2xl relative overflow-hidden flex flex-col justify-center">
                 <div className="absolute top-0 right-0 p-4 opacity-20 transform rotate-12"><StarIcon className="h-32 w-32" /></div>
                 <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-2 opacity-70">Grid Benefit</p>
                 <h4 className="text-3xl font-black italic leading-[0.9] uppercase tracking-tighter mb-4">Zero Risk. <br/> Elite Output.</h4>
                 <p className="text-xs font-medium text-blue-100 leading-relaxed">Cancel any time before trial expiry via the Operational Ledger.</p>
            </div>
          </div>

          <button 
              onClick={handleSubscribe} 
              disabled={isLoading}
              className="w-full bg-white text-slate-950 font-black py-6 rounded-[2rem] text-sm uppercase tracking-[0.3em] transition-all transform active:scale-95 shadow-2xl hover:bg-slate-100 disabled:opacity-50 flex items-center justify-center gap-4"
          >
              {isLoading ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
              ) : (
                  <>Initialise 7-Day Trial <ArrowRightIcon className="h-4 w-4"/></>
              )}
          </button>
        </div>
        
        <div className="bg-slate-950/50 p-6 text-center border-t border-white/5">
             <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">
                Secure Auth Node: STOCKLINK_G7_ACTIVATION
             </p>
        </div>
      </div>
      
      {/* Decorative Ferrari Elements */}
      <div className="fixed bottom-10 left-10 pointer-events-none opacity-5 rotate-90">
          <span className="text-[140px] font-black tracking-tighter text-white uppercase">ACTIVATION</span>
      </div>
    </div>
  );
};

export default SubscriptionModal;
