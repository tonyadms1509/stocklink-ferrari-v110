import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, CheckCircleIcon, CreditCardIcon, BuildingLibraryIcon, ShieldCheckIcon, LockClosedIcon, GlobeAltIcon } from '@heroicons/react/24/solid';
import { useCurrency } from '../hooks/useCurrency';
import { QuoteRequest } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Confetti from './Confetti';

interface PaymentModalProps {
    quote: QuoteRequest;
    total: number;
    onClose: () => void;
    onPaymentSuccess: () => void;
}

type PaymentView = 'selecting' | 'processing' | 'success' | 'paypal';
type PaymentMethod = 'Card' | 'EFT' | 'PayPal';

const PaymentMethodButton: React.FC<{
    method: PaymentMethod;
    icon: React.ElementType;
    selected: boolean;
    onSelect: () => void;
}> = ({ method, icon: Icon, selected, onSelect }) => (
    <button
        onClick={onSelect}
        className={`w-full p-6 border-2 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
            selected ? 'border-red-600 bg-red-600/5 shadow-lg scale-105' : 'border-slate-100 bg-white hover:border-slate-200'
        }`}
    >
        <Icon className={`h-10 w-10 mb-3 ${selected ? 'text-red-600' : 'text-slate-400'}`} />
        <span className={`text-xs font-black uppercase tracking-widest ${selected ? 'text-red-700' : 'text-slate-500'}`}>{method}</span>
    </button>
);

const PayPalGridButton: React.FC<{ total: number; onSuccess: () => void }> = ({ total, onSuccess }) => {
    const paypalContainerRef = useRef<HTMLDivElement>(null);
    const { showToast } = useToast();
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        const clientId = (process.env as any).VITE_PAYPAL_CLIENT_ID || 'sb';
        const scriptId = 'paypal-js-sdk';

        let script = document.getElementById(scriptId) as HTMLScriptElement;

        if (script) {
            if ((window as any).paypal) {
                setScriptLoaded(true);
            } else {
                script.addEventListener('load', () => setScriptLoaded(true));
            }
            return;
        }

        script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
        script.async = true;
        script.crossOrigin = "anonymous";
        script.onload = () => setScriptLoaded(true);
        script.onerror = () => showToast('Failed to load PayPal Engine', 'error');
        document.body.appendChild(script);
    }, [showToast]);

    useEffect(() => {
        const win = window as any;
        if (scriptLoaded && win.paypal && paypalContainerRef.current) {
            paypalContainerRef.current.innerHTML = '';
            
            try {
                const paypalVal = (total / 18.5).toFixed(2);
                if (parseFloat(paypalVal) <= 0) return;

                win.paypal.Buttons({
                    createOrder: (data: any, actions: any) => {
                        return actions.order.create({
                            purchase_units: [{
                                amount: {
                                    value: paypalVal
                                }
                            }]
                        });
                    },
                    onApprove: (data: any, actions: any) => {
                        return actions.order.capture().then((details: any) => {
                            onSuccess();
                        });
                    },
                    onError: (err: any) => {
                        console.error('PayPal internal error:', err);
                        showToast('PayPal Handshake Failure', 'error');
                    },
                    style: {
                        layout: 'vertical',
                        color: 'black',
                        shape: 'rect',
                        label: 'pay',
                    }
                }).render(paypalContainerRef.current).catch((err: any) => {
                    console.warn('PayPal render aborted or failed:', err);
                });
            } catch (e) {
                console.error('Failed to initialize PayPal Buttons:', e);
            }
        }
    }, [scriptLoaded, total, onSuccess, showToast]);

    return (
        <div className="w-full">
            {!scriptLoaded && (
                <div className="flex flex-col items-center justify-center p-8 animate-pulse">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Loading Global Merchant...</p>
                </div>
            )}
            <div ref={paypalContainerRef} className="w-full min-h-[150px]"></div>
        </div>
    );
};

const PaymentModal: React.FC<PaymentModalProps> = ({ quote, total, onClose, onPaymentSuccess }) => {
    const { formatCurrency } = useCurrency();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [view, setView] = useState<PaymentView>('selecting');
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('Card');
    const [paystackLoaded, setPaystackLoaded] = useState(false);
    
    const paystackPublicKey = (process.env as any).VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_537c72530013553874157216c053021614313414';

    useEffect(() => {
        const scriptId = 'paystack-js-sdk';
        if (document.getElementById(scriptId)) {
            setPaystackLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = "https://js.paystack.co/v1/inline.js";
        script.async = true;
        script.crossOrigin = "anonymous";
        // Call the properly scoped setPaystackLoaded
        script.onload = () => setPaystackLoaded(true);
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        let successTimer: any;
        if (view === 'success') {
            successTimer = setTimeout(() => {
                onPaymentSuccess();
            }, 3500);
        }
        return () => clearTimeout(successTimer);
    }, [view, onPaymentSuccess]);

    const handlePaystack = () => {
        if (!user) return;

        const win = window as any;
        if (!paystackLoaded || typeof win.PaystackPop === 'undefined') {
            showToast('Gateway initialising. Please wait...', 'info');
            return;
        }

        try {
            const handler = win.PaystackPop.setup({
                key: paystackPublicKey,
                email: user.email,
                amount: Math.round(total * 100),
                currency: 'ZAR',
                ref: 'SL-FER-' + Math.floor((Math.random() * 1e9) + 1),
                callback: (response: any) => {
                    setView('success');
                    showToast('Grid Settlement Confirmed.', 'success');
                },
                onClose: () => {
                    showToast('Transaction aborted.', 'info');
                }
            });
            handler.openIframe();
        } catch (e) {
            console.error('Paystack setup error:', e);
            showToast('Gateway Execution Failed', 'error');
        }
    };

    const renderContent = () => {
        switch (view) {
            case 'processing':
                return (
                    <div className="text-center py-16">
                         <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
                         </div>
                        <p className="font-black text-slate-800 uppercase tracking-widest text-sm">Synchronizing Ledger...</p>
                    </div>
                );
            case 'success':
                 return (
                    <div className="text-center py-12">
                        <Confetti />
                        <div className="animate-fade-in-scale">
                            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                                <CheckCircleIcon className="h-14 w-14 text-white"/>
                            </div>
                            <p className="font-black text-slate-900 text-3xl italic uppercase tracking-tighter mb-2">Settlement <span className="text-emerald-500">Confirmed</span></p>
                            <p className="text-slate-500 font-medium">Funds locked in escrow. Dispatch active.</p>
                        </div>
                    </div>
                );
            case 'paypal':
                return (
                    <div className="text-center py-6 animate-fade-in-up">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Global Clearing Network</p>
                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 mb-8">
                             <PayPalGridButton total={total} onSuccess={() => setView('success')} />
                        </div>
                         <button onClick={() => setView('selecting')} className="w-full text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
                            Back to Grid
                        </button>
                    </div>
                );
            case 'selecting':
            default:
                return (
                    <div className="animate-fade-in-up">
                        <div className="text-center my-10 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Authorization Value</p>
                            <p className="text-5xl font-black text-slate-900 tracking-tighter italic">{formatCurrency(total)}</p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                            <PaymentMethodButton method="Card" icon={CreditCardIcon} selected={selectedMethod === 'Card'} onSelect={() => { setSelectedMethod('Card'); handlePaystack(); }} />
                            <PaymentMethodButton method="EFT" icon={BuildingLibraryIcon} selected={selectedMethod === 'EFT'} onSelect={() => { setSelectedMethod('EFT'); setView('processing'); setTimeout(() => setView('success'), 2000); }} />
                            <PaymentMethodButton method="PayPal" icon={GlobeAltIcon} selected={selectedMethod === 'PayPal'} onSelect={() => setView('paypal')} />
                        </div>
                        
                         <div className="mt-10 flex justify-center items-center gap-6 opacity-40 grayscale group hover:grayscale-0 transition-all">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Paystack_Logo.png" alt="Paystack" className="h-4" />
                             <div className="w-px h-4 bg-slate-300"></div>
                             <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-3" />
                         </div>
                    </div>
                )
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-[130] p-4 backdrop-blur-md">
            <div className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full animate-fade-in-scale overflow-hidden">
                <div className="p-8 relative">
                    <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors" disabled={view === 'processing'}>
                        <XMarkIcon className="h-6 w-6"/>
                    </button>
                    
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-xl border bg-emerald-50 border-emerald-100 text-emerald-600`}>
                            <ShieldCheckIcon className="h-6 w-6"/>
                        </div>
                        <div>
                             <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] font-mono">Secure Settlement</p>
                             <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">Ferrari <span className="text-red-600">Gateway</span></h2>
                        </div>
                    </div>
                    
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
