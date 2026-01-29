
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
    CreditCardIcon, CheckCircleIcon, ShieldCheckIcon, SparklesIcon, 
    InformationCircleIcon, BuildingStorefrontIcon, WrenchScrewdriverIcon, 
    TruckIcon, ArrowPathIcon, LockClosedIcon, ShieldExclamationIcon,
    GlobeAltIcon, BanknotesIcon, ArrowRightIcon, RocketLaunchIcon
} from '@heroicons/react/24/solid';
import { UserRole } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
import { useToast } from '../../hooks/useToast';
import AnimatedNumber from '../../components/AnimatedNumber';

const MembershipCard: React.FC<{ user: any, planName: string, amount: number, isPremium: boolean, role: UserRole }> = ({ user, planName, amount, isPremium, role }) => {
    const isLogistics = role === UserRole.Logistics;
    const { formatCurrency } = useCurrency();
    
    return (
        <div className={`relative w-full h-72 rounded-[3rem] p-10 text-white shadow-2xl overflow-hidden transform transition-all hover:scale-[1.02] duration-700 ${isPremium ? 'bg-slate-900 border border-white/10' : isLogistics ? 'bg-gradient-to-br from-cyan-600 to-indigo-800 border border-cyan-400/30' : 'bg-gradient-to-br from-blue-600 to-indigo-900 border border-blue-400/30'}`}>
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-[100px]"></div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                    <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/50 mb-2">StockLink {isLogistics ? 'Fleet' : 'Registry'}</p>
                        <h3 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                            {planName}
                            {(isPremium || isLogistics) && <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_15px_#60a5fa]"></div>}
                        </h3>
                    </div>
                    <div className="italic font-black text-2xl opacity-20 tracking-tighter text-white uppercase leading-none">V110</div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-4 rounded-3xl shadow-inner border border-white/5">
                            <div className="w-12 h-8 rounded-lg bg-gradient-to-br from-yellow-200 to-yellow-600 shadow-xl"></div>
                        </div>
                        <div className="text-left">
                             <span className="block text-[9px] font-black uppercase tracking-[0.4em] text-white/40 mb-1">Authorization Value</span>
                             <span className="font-mono text-2xl tracking-tighter font-black text-white/90">{formatCurrency(amount)} <span className="text-[10px] opacity-40 uppercase tracking-widest">/ Month</span></span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-end border-t border-white/10 pt-6">
                    <div className="text-left">
                        <p className="text-[9px] font-black uppercase text-white/40 mb-1">Entity Head</p>
                        <p className="font-black tracking-widest uppercase text-sm italic">{user.name}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black uppercase text-white/40 mb-1">Registry Node</p>
                        <p className="font-black text-xs uppercase text-emerald-400 tracking-widest">ID_{user.id.slice(-6).toUpperCase()}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

const PayPalSubButton: React.FC<{ price: number; onSuccess: () => void }> = ({ price, onSuccess }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const scriptId = 'paypal-js-sdk-sub';
        if (document.getElementById(scriptId)) {
            setLoaded(true);
            return;
        }
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.VITE_PAYPAL_CLIENT_ID || 'sb'}&currency=USD`;
        script.async = true;
        script.onload = () => setLoaded(true);
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        const win = window as any;
        if (loaded && win.paypal && containerRef.current) {
            containerRef.current.innerHTML = '';
            win.paypal.Buttons({
                createOrder: (data: any, actions: any) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: { value: (price / 18.5).toFixed(2) }
                        }]
                    });
                },
                onApprove: (data: any, actions: any) => {
                    return actions.order.capture().then(onSuccess);
                },
                style: { layout: 'horizontal', color: 'blue', shape: 'pill', label: 'subscribe', height: 50 }
            }).render(containerRef.current);
        }
    }, [loaded, price, onSuccess]);

    return <div ref={containerRef} className="w-full"></div>;
};

const BillingPage: React.FC = () => {
    const { user, subscribeUser, currentCompany } = useAuth();
    const { formatCurrency } = useCurrency();
    const { showToast } = useToast();
    const [selectedPlan, setSelectedPlan] = useState<'standard' | 'premium'>('standard');
    const [gateway, setGateway] = useState<'Paystack' | 'PayPal'>('Paystack');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paystackLoaded, setPaystackLoaded] = useState(false);

    useEffect(() => {
        const scriptId = 'paystack-js-sdk-billing';
        if (document.getElementById(scriptId)) {
            setPaystackLoaded(true);
            return;
        }
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = "https://js.paystack.co/v1/inline.js";
        script.async = true;
        script.onload = () => setPaystackLoaded(true);
        document.body.appendChild(script);
    }, []);
    
    if (!user || !currentCompany) return null;

    const prices = {
        contractor: 199,
        supplier: 499,
        supplierPremium: 799,
        logistics: 399
    };

    const isSupplier = user.role === UserRole.Supplier;
    const isLogistics = user.role === UserRole.Logistics;
    const isContractor = user.role === UserRole.Contractor;
    
    const getPlanName = () => {
        if (isSupplier) return selectedPlan === 'premium' ? 'Premium Supplier' : 'Supplier Core';
        if (isLogistics) return 'Fleet Controller';
        return 'Contractor Core';
    }

    const getCurrentPrice = () => {
        if (isSupplier) return selectedPlan === 'premium' ? prices.supplierPremium : prices.supplier;
        if (isLogistics) return prices.logistics;
        return prices.contractor;
    }

    const planName = getPlanName();
    const currentPrice = getCurrentPrice();

    const handleActivation = () => {
        if (gateway === 'PayPal') return; 
        
        setIsProcessing(true);
        const win = window as any;
        if (!paystackLoaded || !win.PaystackPop) {
            showToast("Settlement Hub Offline. Retrying...", "error");
            setIsProcessing(false);
            return;
        }

        const handler = win.PaystackPop.setup({
            key: process.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_537c72530013553874157216c053021614313414',
            email: user.email,
            amount: currentPrice * 100,
            currency: 'ZAR',
            ref: 'ACT-' + Date.now(),
            callback: () => {
                setIsProcessing(false);
                subscribeUser();
                showToast("Node Activated. Welcome to the Grid.", "success");
            },
            onClose: () => setIsProcessing(false)
        });
        handler.openIframe();
    }

    return (
        <div className="animate-fade-in pb-20 font-sans selection:bg-red-600/30">
            <div className="flex justify-between items-end mb-12 border-b border-white/5 pb-10">
                <div className="text-left">
                    <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">Operational <span className="text-blue-600">Ledger</span></h2>
                    <p className="text-slate-500 font-mono text-xs mt-4 uppercase tracking-[0.4em]">Neural Billing Protocol v80.5 REDLINE</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
                
                <div className="lg:col-span-4 space-y-10">
                    <MembershipCard 
                        user={user} 
                        planName={planName} 
                        amount={currentPrice}
                        isPremium={selectedPlan === 'premium' || (currentCompany.subscriptionStatus === 'active' && isSupplier)} 
                        role={user.role}
                    />

                    <div className="bg-slate-900 border border-white/5 p-8 rounded-[3rem] shadow-xl relative overflow-hidden group">
                         <div className="absolute inset-0 bg-carbon opacity-5"></div>
                         <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mb-4 flex items-center gap-3">
                             <BanknotesIcon className="h-4 w-4 text-emerald-500" />
                             Monthly Commitment
                         </h4>
                         <div className="flex justify-between items-end">
                             <div>
                                 <p className="text-4xl font-black text-white italic tracking-tighter leading-none">{formatCurrency(currentPrice)}</p>
                                 <p className="text-[9px] font-bold text-slate-500 uppercase mt-2">Recurring Settlement Node</p>
                             </div>
                             <div className="text-right">
                                 <p className="text-xs font-black text-emerald-400 italic">No Contracts</p>
                                 <p className="text-[9px] font-bold text-slate-600 uppercase">Cancel Anytime</p>
                             </div>
                         </div>
                    </div>
                    
                    {currentCompany.subscriptionStatus === 'active' ? (
                        <div className="bg-slate-900 border border-emerald-500/20 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 text-white"><CheckCircleIcon className="h-48 w-48"/></div>
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="p-4 bg-emerald-500 rounded-[1.5rem] shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                                    <ShieldCheckIcon className="h-8 w-8 text-white"/>
                                </div>
                                <div>
                                    <p className="font-black uppercase italic tracking-tighter text-2xl leading-none">GRID ACTIVE</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em] mt-3 font-mono">UPLINK SECURE</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                         <div className="bg-slate-900 border border-amber-500/30 rounded-[3rem] p-10 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><ArrowPathIcon className="h-32 w-32 animate-spin-slow text-white" /></div>
                             <div className="flex items-center gap-4 mb-8">
                                 <div className="p-3 bg-amber-500/20 rounded-xl text-amber-500">
                                    <InformationCircleIcon className="h-6 w-6"/>
                                 </div>
                                 <p className="font-black text-amber-500 uppercase text-xs tracking-widest">Trial Protocol Active</p>
                             </div>
                             <p className="text-xl text-slate-100 font-black italic leading-relaxed uppercase tracking-tighter">
                                {currentCompany.trialEndDate ? `Handover Expiry: ${new Date(currentCompany.trialEndDate).toLocaleDateString()}` : 'Awaiting Synchronization'}
                             </p>
                             <div className="w-full bg-white/5 h-1.5 rounded-full mt-10 overflow-hidden border border-white/5">
                                 <div className="bg-amber-500 h-full w-2/3 animate-pulse shadow-[0_0_10px_orange]"></div>
                             </div>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-8">
                    <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-200 p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-5"><SparklesIcon className="h-80 w-80 text-blue-600" /></div>
                        
                        <div className="flex items-center gap-5 mb-12">
                            <div className="p-4 bg-slate-900 rounded-[1.5rem] shadow-xl">
                                <RocketLaunchIcon className="h-8 w-8 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                                    {currentCompany.subscriptionStatus === 'active' ? 'Manage Node Tier' : 'Initialize Deployment'}
                                </h3>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Node Handshake Protocol: {planName}</p>
                            </div>
                        </div>
                        
                        {isSupplier && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                                <button 
                                    onClick={() => setSelectedPlan('standard')}
                                    className={`relative p-10 rounded-[3rem] border-4 text-left transition-all duration-700 ${selectedPlan === 'standard' ? 'border-red-600 bg-red-50/30 scale-[1.02] shadow-2xl' : 'border-slate-100 hover:border-slate-200 opacity-60'}`}
                                >
                                    <div className="bg-white p-4 rounded-2xl w-fit border border-slate-100 mb-8 shadow-sm">
                                        <BuildingStorefrontIcon className="h-10 w-10 text-slate-800"/>
                                    </div>
                                    <h4 className="font-black text-slate-900 uppercase tracking-tighter italic text-2xl">Standard</h4>
                                    <p className="text-4xl font-black text-red-600 my-4 tracking-tighter">{formatCurrency(prices.supplier)}<span className="text-[10px] text-slate-400 font-black uppercase ml-2">/mo</span></p>
                                </button>

                                <button 
                                    onClick={() => setSelectedPlan('premium')}
                                    className={`relative p-10 rounded-[3rem] border-4 text-left transition-all duration-700 ${selectedPlan === 'premium' ? 'border-blue-600 bg-blue-50/30 scale-[1.02] shadow-2xl' : 'border-slate-100 hover:border-slate-200 opacity-60'}`}
                                >
                                    <div className="bg-blue-600 p-4 rounded-2xl w-fit mb-8 shadow-2xl">
                                        <SparklesIcon className="h-10 w-10 text-white animate-pulse"/>
                                    </div>
                                    <h4 className="font-black text-slate-900 uppercase tracking-tighter italic text-2xl">Premium</h4>
                                    <p className="text-4xl font-black text-blue-600 my-4 tracking-tighter">{formatCurrency(prices.supplierPremium)}<span className="text-[10px] text-slate-400 font-black uppercase ml-2">/mo</span></p>
                                </button>
                            </div>
                        )}

                        {isContractor && (
                             <div className="mb-12 p-8 bg-blue-50 rounded-[3rem] border-4 border-blue-100 flex flex-col md:flex-row items-center justify-between gap-8 group">
                                <div className="text-left flex-grow">
                                    <h4 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Contractor Core <span className="text-blue-600">Active</span></h4>
                                    <p className="text-slate-500 font-medium italic mt-2">"Full national sourcing and structural telemetry included."</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-5xl font-black text-blue-600 tracking-tighter italic">{formatCurrency(prices.contractor)}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Monthly Dues</p>
                                </div>
                             </div>
                        )}

                        {currentCompany.subscriptionStatus !== 'active' ? (
                            <>
                                <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 mb-12">
                                    <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8">Clearing Handshake</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                            <button 
                                            onClick={() => setGateway('Paystack')}
                                            className={`p-6 rounded-3xl border-2 flex items-center justify-center transition-all ${gateway === 'Paystack' ? 'bg-white border-red-600 shadow-xl scale-105' : 'bg-transparent border-slate-200 grayscale opacity-40'}`}
                                            >
                                                <img src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Paystack_Logo.png" alt="Paystack" className="h-6" />
                                            </button>
                                            <button 
                                            onClick={() => setGateway('PayPal')}
                                            className={`p-6 rounded-3xl border-2 flex items-center justify-center transition-all ${gateway === 'PayPal' ? 'bg-white border-blue-600 shadow-xl scale-105' : 'bg-transparent border-slate-200 grayscale opacity-40'}`}
                                            >
                                                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5" />
                                            </button>
                                    </div>
                                </div>

                                {gateway === 'Paystack' ? (
                                    <button 
                                        onClick={handleActivation}
                                        disabled={isProcessing}
                                        className="w-full bg-slate-950 hover:bg-black text-white font-black py-8 rounded-[2.5rem] flex items-center justify-center gap-6 transition-all transform active:scale-95 shadow-2xl border-4 border-slate-800 uppercase tracking-[0.4em] text-sm"
                                    >
                                        {isProcessing ? <ArrowPathIcon className="h-6 w-6 animate-spin"/> : <LockClosedIcon className="h-6 w-6 text-red-600"/>}
                                        Execute Activation Sequence
                                    </button>
                                ) : (
                                    <div className="animate-fade-in-up">
                                        <PayPalSubButton price={currentPrice} onSuccess={() => { subscribeUser(); showToast("PayPal Handshake Confirmed", "success"); }} />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-emerald-50 border-2 border-emerald-500/20 p-8 rounded-[3rem] text-center">
                                <p className="text-emerald-700 font-black uppercase italic tracking-tighter text-xl">Protocol Status: ACTIVE</p>
                                <p className="text-emerald-600 font-bold italic mt-2">Node Tier synchronized. Your next settlement is automated via the grid.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

             <div className="mt-20">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-10 flex items-center gap-4 text-left">
                    <BanknotesIcon className="h-8 w-8 text-slate-700" />
                    Registry <span className="text-slate-700">Events</span>
                </h3>
                <div className="bg-slate-900 border border-white/5 rounded-[4rem] p-24 text-center flex flex-col items-center shadow-inner">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 text-slate-800 border border-white/5">
                        <InformationCircleIcon className="h-12 w-12"/>
                    </div>
                    <p className="text-slate-600 font-black uppercase tracking-[0.6em] text-[10px]">No historical fiscal events identified on grid registry.</p>
                </div>
            </div>
            
            <div className="fixed bottom-10 right-10 pointer-events-none opacity-5 -z-10 rotate-90 select-none">
                <span className="text-[140px] font-black tracking-tighter text-white uppercase italic leading-none">THE LEDGER</span>
            </div>
        </div>
    );
};

export default BillingPage;
