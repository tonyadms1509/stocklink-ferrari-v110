
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useDataContext';
import { useLocalization } from '../../hooks/useLocalization';
import { TrophyIcon, StarIcon, GiftIcon, SparklesIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/solid';
import { RewardOffer } from '../../types';
import EmptyState from '../../components/EmptyState';

const tierStyles: any = {
    'Gold': { 
        bg: 'bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-500', 
        text: 'text-yellow-900', 
        border: 'border-yellow-400',
        glow: 'shadow-[0_0_30px_rgba(234,179,8,0.4)]' 
    },
    'Silver': { 
        bg: 'bg-gradient-to-br from-gray-300 via-gray-100 to-gray-400', 
        text: 'text-gray-800', 
        border: 'border-gray-300',
        glow: 'shadow-[0_0_30px_rgba(156,163,175,0.4)]' 
    },
    'Bronze': { 
        bg: 'bg-gradient-to-br from-orange-700 via-orange-500 to-orange-800', 
        text: 'text-white', 
        border: 'border-orange-600',
        glow: 'shadow-[0_0_30px_rgba(194,65,12,0.4)]' 
    },
    'Unranked': { 
        bg: 'bg-gray-100', 
        text: 'text-gray-600', 
        border: 'border-gray-200',
        glow: '' 
    }
};

const RewardCard: React.FC<{ offer: RewardOffer, onRedeem: () => void, canAfford: boolean }> = ({ offer, onRedeem, canAfford }) => {
    const { t } = useLocalization();

    return (
        <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 group ${canAfford ? 'bg-white border-gray-200 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30' : 'bg-gray-50 border-gray-200 opacity-70 grayscale'}`}>
            {/* Decorative shine effect */}
            {canAfford && <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-yellow-200 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>}
            
            <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-full ${canAfford ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-500'}`}>
                        <GiftIcon className="h-6 w-6"/>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600">
                        <StarIcon className="h-3 w-3 text-yellow-500"/>
                        {offer.pointsRequired.toLocaleString()}
                    </div>
                </div>
                
                <h4 className="font-bold text-gray-900 text-lg mb-1">{offer.title}</h4>
                <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide font-semibold">{offer.supplierName}</p>
                <p className="text-sm text-gray-600 mb-6 flex-grow">{offer.description}</p>
                
                <button 
                    onClick={onRedeem} 
                    disabled={!canAfford}
                    className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        canAfford 
                        ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-md hover:shadow-lg active:scale-95' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    {canAfford ? <LockOpenIcon className="h-4 w-4"/> : <LockClosedIcon className="h-4 w-4"/>}
                    {canAfford ? t('rewardsRedeem') : 'Not Enough Points'}
                </button>
            </div>
        </div>
    );
};

const RewardsPage: React.FC = () => {
    const { currentCompany } = useAuth();
    const { rewardOffers, redeemReward } = useData();
    const { t } = useLocalization();

    const points = currentCompany?.loyaltyPoints || 0;
    const tier = currentCompany?.loyaltyTier || 'Unranked';
    const tierStyle = tierStyles[tier];

    return (
        <div className="space-y-8">
            {/* Hero Vault Header */}
            <div className="relative rounded-3xl overflow-hidden bg-gray-900 text-white shadow-2xl">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3"></div>

                <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2 text-gray-400 text-sm font-bold uppercase tracking-widest">
                            <TrophyIcon className="h-5 w-5 text-yellow-500"/>
                            StockLink Rewards Vault
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                            {t('rewardsYourPoints')}
                        </h2>
                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-sm">
                                {points.toLocaleString()}
                            </span>
                            <span className="text-xl text-gray-400 font-medium">pts</span>
                        </div>
                    </div>

                    {/* Tier Card */}
                    <div className={`relative w-full md:w-80 p-6 rounded-2xl border-2 ${tierStyle.border} ${tierStyle.bg} ${tierStyle.glow} transform md:rotate-3 transition-transform hover:rotate-0`}>
                        <div className="flex justify-between items-start mb-8">
                            <SparklesIcon className={`h-8 w-8 ${tier === 'Bronze' ? 'text-white' : 'text-white/80'}`}/>
                            <span className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded border ${tier === 'Bronze' ? 'border-white text-white' : 'border-black/10 text-black/60'}`}>Status</span>
                        </div>
                        <h3 className={`text-3xl font-black tracking-tighter uppercase ${tierStyle.text}`}>{t(`rewardsTier_${tier}` as any)}</h3>
                        <p className={`text-sm font-medium mt-1 opacity-80 ${tierStyle.text}`}>Member since 2023</p>
                    </div>
                </div>
            </div>

            <div className="py-4">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-1 bg-primary rounded-full"></div>
                    <h3 className="text-2xl font-bold text-gray-900">{t('rewardsAvailable')}</h3>
                </div>
                
                {rewardOffers.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {rewardOffers.map(offer => (
                            <RewardCard 
                                key={offer.id}
                                offer={offer}
                                onRedeem={() => redeemReward(offer)}
                                canAfford={points >= offer.pointsRequired}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={GiftIcon}
                        title={t('rewardsNoRewards')}
                        message="Suppliers haven't posted any rewards yet. Check back later or contact your suppliers!"
                    />
                )}
            </div>
        </div>
    );
};

export default RewardsPage;
