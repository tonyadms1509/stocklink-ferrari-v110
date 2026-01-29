
import React, { useState, useEffect } from 'react';
import { UserPlusIcon, GiftIcon, CheckCircleIcon, SparklesIcon, ClipboardDocumentIcon, PaperAirplaneIcon, TrophyIcon, BanknotesIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../../hooks/useLocalization';
import { useAuth } from '../../hooks/useAuth';
import { Referral, PayoutDetails } from '../../types';
import ReferralModal from '../../components/ReferralModal';
import { useToast } from '../../hooks/useToast';
import Confetti from '../../components/Confetti';
import { useCurrency } from '../../hooks/useCurrency';

// Add Bank Details Modal (Internal Component)
const BankDetailsModal: React.FC<{ onClose: () => void, onSave: (details: PayoutDetails) => void }> = ({ onClose, onSave }) => {
    const { t } = useLocalization();
    const [details, setDetails] = useState<PayoutDetails>({
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        branchCode: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(details);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDetails({...details, [e.target.name]: e.target.value});
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full animate-fade-in-scale">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <BanknotesIcon className="h-6 w-6 text-green-600"/>
                    Add Payout Method
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('payoutBankName')}</label>
                        <input type="text" name="bankName" value={details.bankName} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" required placeholder="e.g. FNB" />
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">{t('payoutAccountHolder')}</label>
                        <input type="text" name="accountHolderName" value={details.accountHolderName} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" required />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{t('payoutAccountNumber')}</label>
                            <input type="text" name="accountNumber" value={details.accountNumber} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{t('payoutBranchCode')}</label>
                            <input type="text" name="branchCode" value={details.branchCode} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" required />
                        </div>
                     </div>
                     <div className="flex justify-end gap-3 pt-4">
                         <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 font-bold">Cancel</button>
                         <button type="submit" className="bg-primary text-white font-bold py-2 px-6 rounded-lg">Save Details</button>
                     </div>
                </form>
            </div>
        </div>
    )
}

const ReferralTicket: React.FC<{ referral: Referral }> = ({ referral }) => {
    const statusColors = {
        'Invited': 'bg-gray-100 text-gray-500 border-gray-200',
        'Signed Up': 'bg-blue-50 text-blue-600 border-blue-100',
        'Subscribed': 'bg-green-50 text-green-600 border-green-100'
    };

    const statusConfig = statusColors[referral.status] || statusColors['Invited'];
    const { formatCurrency } = useCurrency();

    return (
        <div className="relative flex bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            {/* Ticket stub visual */}
            <div className={`w-3 bg-${referral.status === 'Subscribed' ? 'green' : referral.status === 'Signed Up' ? 'blue' : 'gray'}-500`}></div>
            
            <div className="flex-grow p-4 flex justify-between items-center">
                <div>
                    <h4 className="font-bold text-gray-800">{referral.refereeName}</h4>
                    <p className="text-xs text-gray-500">{referral.refereeEmail}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Invited: {referral.invitedAt.toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConfig}`}>
                        {referral.status}
                    </span>
                    {referral.commission && (
                        <div className="flex items-center gap-1 text-green-600 text-sm font-extrabold mt-2 justify-end">
                            <GiftIcon className="h-4 w-4"/> {formatCurrency(referral.commission)}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Perforated edge effect */}
            <div className="w-4 flex flex-col justify-between py-2 items-center border-l border-dashed border-gray-200 bg-gray-50">
                {[...Array(6)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white border border-gray-200 mb-1"></div>)}
            </div>
        </div>
    );
}

const ReferralsPage: React.FC = () => {
    const { t } = useLocalization();
    const { user, updateCurrentUser } = useAuth();
    const { showToast } = useToast();
    const { formatCurrency } = useCurrency();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);

    // Ensure referral code exists for legacy users or edge cases
    useEffect(() => {
        if (user && !user.referralCode) {
            const newCode = user.name.slice(0, 3).toUpperCase() + Math.floor(Math.random() * 10000);
            updateCurrentUser({ referralCode: newCode });
        }
    }, [user, updateCurrentUser]);

    // Mock data - In real app, fetch from API
    const referrals: Referral[] = [
        { id: '1', referrerId: user?.id || '', refereeName: 'John Doe', refereeEmail: 'john@test.com', status: 'Subscribed', invitedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), commission: 150 },
        { id: '2', referrerId: user?.id || '', refereeName: 'Jane Smith', refereeEmail: 'jane@test.com', status: 'Signed Up', invitedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        { id: '3', referrerId: user?.id || '', refereeName: 'Peter Jones', refereeEmail: 'peter@test.com', status: 'Invited', invitedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    ];
    
    const successfulReferrals = referrals.filter(r => r.status === 'Subscribed').length;
    const pendingBalance = referrals.reduce((sum, r) => sum + (r.commission || 0), 0); // Total accumulated (mock logic)
    const paidOut = 0; // Mock paid out amount
    const availableBalance = pendingBalance - paidOut;

    const referralLink = `${window.location.origin}/#/signup?ref=${user?.referralCode || 'LOADING'}`;

    const handleCopyLink = () => {
        if (!user?.referralCode) return;
        navigator.clipboard.writeText(referralLink);
        showToast('Referral link copied to clipboard!', 'success');
        setShowConfetti(true);
    };

    const handleSaveBankDetails = (details: PayoutDetails) => {
        // In real app: API call to save user profile
        showToast("Bank details saved successfully.", "success");
        setIsBankModalOpen(false);
    }
    
    const handleRequestPayout = () => {
        if (availableBalance < 500) {
            showToast("Minimum payout amount is R500.00", "warning");
            return;
        }
        showToast("Payout request submitted!", "success");
        // Logic to clear balance or create payout record
    }

    return (
        <>
            <div className="max-w-6xl mx-auto pb-12">
                {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
                
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center justify-center gap-3">
                        <SparklesIcon className="h-8 w-8 text-yellow-400"/>
                        Partner Dashboard
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">Promote StockLink and earn recurring revenue.</p>
                </div>

                {/* Earnings Wallet Card */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white mb-10 relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <div className="absolute right-0 top-0 p-8 opacity-10">
                        <BanknotesIcon className="h-64 w-64 text-white"/>
                    </div>

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="border-r border-white/10 pr-8">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Available Balance</p>
                            <h3 className="text-5xl font-black tracking-tight">{formatCurrency(availableBalance)}</h3>
                            <button 
                                onClick={handleRequestPayout}
                                className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full text-sm transition-colors shadow-lg shadow-green-900/20 flex items-center gap-2"
                            >
                                <BanknotesIcon className="h-4 w-4"/> Request Payout
                            </button>
                        </div>
                        <div className="border-r border-white/10 pr-8">
                             <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Earnings</p>
                             <p className="text-3xl font-bold text-gray-200">{formatCurrency(pendingBalance)}</p>
                             <p className="text-sm text-gray-500 mt-1">Lifetime Commission</p>
                        </div>
                        <div>
                             <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Conversions</p>
                             <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold text-gray-200">{successfulReferrals}</p>
                                <span className="text-sm text-green-400 font-bold">Signups</span>
                             </div>
                             <p className="text-sm text-gray-500 mt-1">Total Clicks: 142 (Simulated)</p>
                        </div>
                    </div>
                    
                    {/* Bank Details Status */}
                    <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 p-2 rounded-full">
                                <BanknotesIcon className="h-5 w-5 text-yellow-400"/>
                            </div>
                            <span className="text-sm font-medium text-gray-300">Payout Method: <span className="text-white font-bold">Standard Bank (**** 4582)</span></span>
                        </div>
                        <button onClick={() => setIsBankModalOpen(true)} className="text-xs font-bold text-blue-400 hover:text-white underline">
                            Update Details
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Invite Tools */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <PaperAirplaneIcon className="h-5 w-5 text-primary"/> Your Tracking Link
                            </h3>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between mb-4">
                                <span className="text-xs text-gray-500 truncate mr-2 select-all font-mono">{referralLink}</span>
                                <button onClick={handleCopyLink} className="p-2 bg-white rounded-md shadow-sm hover:bg-blue-50 text-primary border border-gray-200 transition-colors">
                                    <ClipboardDocumentIcon className="h-4 w-4"/>
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mb-4">
                                Share this link. When users sign up, they are automatically attributed to you.
                            </p>
                            <div className="flex gap-2">
                                <button className="flex-1 bg-[#1DA1F2] hover:bg-[#1a91da] text-white py-2 rounded-lg text-sm font-bold transition-colors">
                                    Twitter
                                </button>
                                <button className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white py-2 rounded-lg text-sm font-bold transition-colors">
                                    WhatsApp
                                </button>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center">
                            <UserPlusIcon className="h-12 w-12 text-blue-300 mx-auto mb-3"/>
                            <h3 className="font-bold text-blue-900 mb-2">Email Invite</h3>
                            <p className="text-sm text-blue-700 mb-4">Send a personal invite directly to their inbox.</p>
                            <button onClick={() => setIsModalOpen(true)} className="w-full bg-white text-blue-600 border border-blue-200 font-bold py-2.5 rounded-lg hover:bg-blue-100 transition-colors shadow-sm">
                                {t('referralsInviteFormTitle')}
                            </button>
                        </div>
                    </div>

                    {/* Referral List */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Performance Report</h3>
                            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">{referrals.length} Referrals</span>
                        </div>
                        
                        <div className="space-y-3">
                            {referrals.map(ref => (
                                <ReferralTicket key={ref.id} referral={ref} />
                            ))}
                        </div>
                    </div>
                </div>

            </div>
            {isModalOpen && <ReferralModal onClose={() => setIsModalOpen(false)} />}
            {isBankModalOpen && <BankDetailsModal onClose={() => setIsBankModalOpen(false)} onSave={handleSaveBankDetails} />}
        </>
    );
};

export default ReferralsPage;
