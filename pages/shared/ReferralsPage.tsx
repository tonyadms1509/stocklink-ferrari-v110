import React, { useState, useEffect } from 'react';
import { UserPlusIcon, GiftIcon, CheckCircleIcon, SparklesIcon, ClipboardDocumentIcon, PaperAirplaneIcon, TrophyIcon, BanknotesIcon, ArrowRightIcon, WalletIcon, UsersIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../../hooks/useLocalization';
import { useAuth } from '../../hooks/useAuth';
import { Referral, PayoutDetails } from '../../types';
import ReferralModal from '../../components/ReferralModal';
import { useToast } from '../../hooks/useToast';
import Confetti from '../../components/Confetti';
import { useCurrency } from '../../hooks/useCurrency';

const ReferralTicket: React.FC<{ referral: Referral }> = ({ referral }) => {
    const statusColors = {
        'Invited': 'bg-slate-100 text-slate-500 border-slate-200',
        'Signed Up': 'bg-blue-600 text-white border-blue-500',
        'Subscribed': 'bg-emerald-500 text-white border-emerald-400'
    };

    const statusConfig = statusColors[referral.status] || statusColors['Invited'];
    const { formatCurrency } = useCurrency();

    return (
        <div className="relative flex bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all group p-1">
            <div className={`w-2 rounded-l-2xl ${referral.status === 'Subscribed' ? 'bg-emerald-500' : referral.status === 'Signed Up' ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            
            <div className="flex-grow p-6 flex justify-between items-center text-left">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-300 text-xl border border-slate-100 group-hover:border-blue-500/30 transition-colors">
                        {referral.refereeName.charAt(0)}
                    </div>
                    <div className="text-left">
                        <h4 className="font-black text-slate-900 uppercase tracking-tight italic">{referral.refereeName}</h4>
                        <p className="text-xs text-slate-400 font-medium">{referral.refereeEmail}</p>
                        <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest mt-2 font-mono">Node ID: REF_{referral.id.slice(0,4)}</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${statusConfig}`}>
                        {referral.status}
                    </span>
                    {referral.status === 'Subscribed' && (
                        <div className="flex items-center gap-1 text-emerald-600 text-lg font-black mt-3 justify-end italic tracking-tighter">
                            +R50.00
                        </div>
                    )}
                </div>
            </div>
            
            <div className="w-6 flex flex-col justify-between py-4 items-center border-l-2 border-dashed border-slate-100 bg-slate-50/50">
                {[...Array(6)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full bg-slate-50 border border-slate-100"></div>)}
            </div>
        </div>
    );
}

const ReferralsPage: React.FC = () => {
    const { user, updateCurrentUser } = useAuth();
    const { showToast } = useToast();
    const { formatCurrency } = useCurrency();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (user && !user.referralCode) {
            const newCode = user.name.slice(0, 3).toUpperCase() + Math.floor(Math.random() * 10000);
            updateCurrentUser({ referralCode: newCode });
        }
    }, [user, updateCurrentUser]);

    const referrals: Referral[] = [
        { id: '1', referrerId: user?.id || '', refereeName: 'Cape Projects CC', refereeEmail: 'info@capeprojects.co.za', status: 'Subscribed', invitedAt: new Date(Date.now() - 86400000 * 2), commission: 50 },
        { id: '2', referrerId: user?.id || '', refereeName: 'Musa Brickworks', refereeEmail: 'sales@musa.com', status: 'Signed Up', invitedAt: new Date(Date.now() - 86400000 * 5) },
    ];
    
    const successfulReferrals = referrals.filter(r => r.status === 'Subscribed').length;
    const availableBalance = successfulReferrals * 50;

    const referralLink = `${window.location.origin}/#/signup?ref=${user?.referralCode || 'NODE'}`;

    const handleCopyLink = () => {
        if (!user?.referralCode) return;
        navigator.clipboard.writeText(referralLink);
        showToast('R50 Handshake Link Copied', 'success');
        setShowConfetti(true);
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 font-sans selection:bg-blue-500/20">
            {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
            
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 pb-10 mb-12">
                <div className="text-left">
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">The <span className="text-blue-600">Expansion</span></h2>
                    <p className="text-slate-500 font-mono text-xs mt-3 uppercase tracking-[0.4em]">Referral Protocol: R50 Handshake Active</p>
                </div>
                <div className="bg-emerald-600/10 text-emerald-600 px-6 py-3 rounded-full border border-emerald-500/20 font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-3">
                    <SparklesIcon className="h-4 w-4 animate-pulse" /> R50 Handshake: VERIFIED
                </div>
            </div>

            <div className="bg-slate-950 rounded-[3.5rem] p-12 text-white mb-12 relative overflow-hidden shadow-2xl border border-white/5 group">
                <div className="absolute inset-0 bg-carbon opacity-20"></div>
                <div className="absolute right-0 top-0 p-12 opacity-5 transform group-hover:scale-110 transition-transform duration-700">
                    <WalletIcon className="h-80 w-80 text-white"/>
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                    <div className="border-r border-white/5 pr-12 text-left">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Accrued Credit</p>
                        <h3 className="text-7xl font-black tracking-tighter italic">{formatCurrency(availableBalance)}</h3>
                        <button className="mt-10 bg-blue-600 hover:bg-blue-500 text-white font-black py-5 px-10 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-blue-900/40 transition-all transform active:scale-95 flex items-center justify-center gap-3 border border-white/10">
                            <BanknotesIcon className="h-4 w-4"/> Initialize Payout
                        </button>
                    </div>
                    <div className="border-r border-white/5 pr-12 text-left">
                         <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Verified Nodes</p>
                         <div className="flex items-baseline gap-3">
                            <p className="text-6xl font-black text-gray-100">{successfulReferrals}</p>
                            <span className="text-sm text-blue-400 font-black uppercase tracking-widest">Active Links</span>
                         </div>
                         <p className="text-xs text-slate-500 mt-6 leading-relaxed italic opacity-80">"Verified grid signups result in immediate R50 settlement for both nodes."</p>
                    </div>
                    <div className="bg-white/5 rounded-3xl p-8 border border-white/5 backdrop-blur-sm text-left">
                        <h4 className="font-black uppercase text-xs tracking-widest text-blue-400 mb-2">Network Pulse</h4>
                        <p className="text-sm text-slate-300 font-medium leading-relaxed">Referrals are processed in real-time. Minimum payout threshold is R500. Credits can also be applied to your operational subscription.</p>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200 group hover:shadow-2xl transition-all duration-500 text-left">
                        <h3 className="font-black text-slate-900 uppercase tracking-tighter italic text-2xl mb-8 flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                <PaperAirplaneIcon className="h-6 w-6"/>
                            </div>
                            The Handshake Link
                        </h3>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between mb-10 group/input">
                            <span className="text-xs text-slate-400 truncate font-mono mr-4 select-all">{referralLink}</span>
                            <button onClick={handleCopyLink} className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 text-blue-600 hover:bg-blue-50 transition-colors">
                                <ClipboardDocumentIcon className="h-5 w-5"/>
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mb-10 leading-relaxed italic">
                            Share this tactical link. When a colleague joins and subscribes, R50 is automatically credited to your node.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="bg-[#25D366] hover:bg-emerald-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all transform active:scale-95 shadow-lg shadow-emerald-500/20">
                                WhatsApp
                            </button>
                            <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all transform active:scale-95 shadow-xl">
                                Email
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-6">
                        <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter text-left">Handshake Ledger</h3>
                        <div className="flex items-center gap-2 bg-slate-100 text-slate-500 text-[10px] font-black px-4 py-2 rounded-full border border-slate-200 uppercase tracking-widest">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                            Uplink Status: NOMINAL
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        {referrals.map(ref => (
                            <ReferralTicket key={ref.id} referral={ref} />
                        ))}
                    </div>
                </div>
            </div>

            {isModalOpen && <ReferralModal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default ReferralsPage;