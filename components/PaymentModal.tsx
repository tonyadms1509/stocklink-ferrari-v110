
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
        const clientId = process.env.VITE_PAYPAL_CLIENT_ID || 'sb';
        const scriptId = 'paypal-js-sdk-payment';

        if (document.getElementById(scriptId)) {
            setScriptLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        script.onerror = () => showToast('Global Clearing Hub Offline', 'error');
        document.body.appendChild(script);
    }, [showToast]);

    useEffect(() => {
        const win = window as any;
        if (scriptLoaded && win.paypal && paypalContainerRef.current) {
            paypalContainerRef.current.innerHTML = '';
            
            try {
                const usdValue = (total / 18.5).toFixed(2);
                win.paypal.Buttons({
                    createOrder: (data: any, actions: any) => {
                        return actions.order.create({
                            purchase_units: [{
                                amount: { value: usdValue }
                            }]
                        });
                    },
                    onApprove: (data: any, actions: any) => {
                        return actions.order.capture().then(() => {
                            onSuccess();
                        });
                    },
                    style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }
                }).render(paypalContainerRef.current);
            } catch (e) {
                console.error('PayPal Initialization Error:', e);
            }
        }
    }, [scriptLoaded, total, onSuccess]);

    return <div ref={paypalContainerRef} className="w-full min-h-[150px]"></div>;
};

const PaymentModal: React.FC<PaymentModalProps> = ({ quote, total, onClose, onPaymentSuccess }) => {
    const { formatCurrency } = useCurrency();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [view, setView] = useState<PaymentView>('selecting');
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('Card');
    const [paystackLoaded, setPaystackLoaded] = useState(false);
    
    const paystackPublicKey = process.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_537c72530013553874157216c053021614313414';

    useEffect(() => {
        const scriptId = 'paystack-js-sdk-payment';
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

    const handlePaystack = () => {
        if (!user) return;
        const win = window as any;
        if (!paystackLoaded || typeof win.PaystackPop === 'undefined') {
            showToast('Gateway initialising. Standby...', 'info');
            return;
        }

        try {
            const handler = win.PaystackPop.setup({
                key: paystackPublicKey,
                email: user.email,
                amount: Math.round(total * 100),
                currency: 'ZAR',
                ref: 'ORD-FER-' + Date.now(),
                callback: (response: any) => {
                    setView('success');
                    setTimeout(onPaymentSuccess, 3000);
                },
                onClose: () => showToast('Transaction session terminated.', 'info')
            });
            handler.openIframe();
        } catch (e) {
            showToast('Grid Gateway Failure', 'error');
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-[130] p-4 backdrop-blur-md">
            <div className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full animate-fade-in-scale overflow-hidden">
                <div className="p-8 relative">
                    {view !== 'success' && (
                        <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors">
                            <XMarkIcon className="h-6 w-6"/>
                        </button>
                    )}
                    
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl border bg-emerald-50 border-emerald-100 text-emerald-600">
                            <ShieldCheckIcon className="h-6 w-6"/>
                        </div>
                        <div className="text-left">
                             <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] font-mono">Secure Settlement</p>
                             <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">Grid <span className="text-red-600">Gateway</span></h2>
                        </div>
                    </div>
                    
                    {view === 'selecting' && (
                        <div className="animate-fade-in-up">
                            <div className="text-center my-10 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Authorization Value</p>
                                <p className="text-5xl font-black text-slate-900 tracking-tighter italic">{formatCurrency(total)}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <PaymentMethodButton method="Card" icon={CreditCardIcon} selected={selectedMethod === 'Card'} onSelect={() => { setSelectedMethod('Card'); handlePaystack(); }} />
                                <PaymentMethodButton method="EFT" icon={BuildingLibraryIcon} selected={selectedMethod === 'EFT'} onSelect={() => { setSelectedMethod('EFT'); setView('processing'); setTimeout(() => setView('success'), 2000); }} />
                                <PaymentMethodButton method="PayPal" icon={GlobeAltIcon} selected={selectedMethod === 'PayPal'} onSelect={() => { setSelectedMethod('PayPal'); setView('paypal'); }} />
                            </div>
                        </div>
                    )}

                    {view === 'paypal' && (
                         <div className="animate-fade-in-up py-6">
                            <PayPalGridButton total={total} onSuccess={() => setView('success')} />
                            <button onClick={() => setView('selecting')} className="w-full mt-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900">Return to Grid</button>
                        </div>
                    )}

                    {view === 'processing' && (
                        <div className="text-center py-16">
                            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                            <p className="font-black text-slate-800 uppercase tracking-widest text-sm">Synchronizing Ledger...</p>
                        </div>
                    )}

                    {view === 'success' && (
                        <div className="text-center py-12">
                            <Confetti />
                            <CheckCircleIcon className="h-20 w-20 text-emerald-500 mx-auto mb-6 shadow-2xl rounded-full"/>
                            <p className="font-black text-slate-900 text-3xl italic uppercase tracking-tighter mb-2">Settlement <span className="text-emerald-500">Confirmed</span></p>
                            <p className="text-slate-500 font-medium">Updating national logistics nodes...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
