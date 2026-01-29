
import React from 'react';
import { useData } from '../../hooks/useDataContext';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
import { ContractorLead, ContractorLeadType, ContractorTab } from '../../types';
import { ArrowLeftIcon, PresentationChartLineIcon, SparklesIcon, BuildingLibraryIcon, MapPinIcon, CurrencyDollarIcon, CalendarDaysIcon, GlobeAltIcon, ArrowRightIcon, LightBulbIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import EmptyState from '../../components/EmptyState';

const getLeadIcon = (type: ContractorLeadType) => {
    switch (type) {
        case ContractorLeadType.PublicTender:
            return BuildingLibraryIcon;
        case ContractorLeadType.MunicipalPlanning:
            return MapPinIcon;
        case ContractorLeadType.PrivateDevelopment:
            return CurrencyDollarIcon;
        default:
            return PresentationChartLineIcon;
    }
};

const leadStyles: Record<string, any> = {
    [ContractorLeadType.PublicTender]: {
        badge: 'bg-blue-100 text-blue-800',
        badgeText: 'Public Tender',
        borderLeft: 'border-l-blue-500'
    },
    [ContractorLeadType.MunicipalPlanning]: {
        badge: 'bg-yellow-100 text-yellow-800',
        badgeText: 'Municipal',
        borderLeft: 'border-l-yellow-500'
    },
    [ContractorLeadType.PrivateDevelopment]: {
        badge: 'bg-emerald-100 text-emerald-800',
        badgeText: 'Private Dev',
        borderLeft: 'border-l-emerald-500'
    },
    [ContractorLeadType.Recommendation]: {
        badge: 'bg-purple-100 text-purple-800',
        badgeText: 'AI Pick',
        borderLeft: 'border-l-purple-500'
    }
};

interface AILeadsPageProps {
    onNavigate: (tab: ContractorTab) => void;
    onBack?: () => void;
}

const AILeadsPage: React.FC<AILeadsPageProps> = ({ onNavigate, onBack }) => {
    // leads comes from useData
    const { contractorLeads, isAILoading, generateDailyBriefing } = useData();
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();

    const handleActionClick = (lead: ContractorLead) => {
        onNavigate(lead.action.target);
    };
    
    const LeadIcon = () => (
        <div className="relative inline-block">
            <LightBulbIcon className="h-24 w-24 mx-auto text-gray-200" />
            <SparklesIcon className="h-10 w-10 absolute -bottom-2 -right-2 text-yellow-400 animate-pulse" />
        </div>
    );

    const getMatchScore = (lead: ContractorLead) => {
        const score = 85 + (lead.title.length % 15); 
        return score;
    }

    return (
        <div className="pb-12 text-left">
            {onBack && (
                <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-4 font-medium">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    {t('backToDashboard')}
                </button>
            )}
            
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <PresentationChartLineIcon className="h-8 w-8 text-primary"/> {t('aiLeadsTitle')}
                    </h2>
                    <p className="text-gray-600 mt-1">Discover new tenders, projects, and leads tailored for your business.</p>
                </div>
                <button 
                    onClick={() => generateDailyBriefing(true)} 
                    disabled={isAILoading.leads}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg transform transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                >
                    {isAILoading.leads ? (
                         <><SparklesIcon className="h-5 w-5 animate-spin"/> Scanning...</>
                    ) : (
                         <><SparklesIcon className="h-5 w-5"/> Scan for Opportunities</>
                    )}
                </button>
            </div>

            {isAILoading.leads ? (
                <div className="text-center p-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                         <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                         <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                         <SparklesIcon className="absolute inset-0 m-auto h-10 w-10 text-primary animate-pulse"/>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">AI Agent is Scanning...</h3>
                    <p className="mt-2 text-gray-500">Analyzing public tenders, municipal records, and private listings.</p>
                </div>
            ) : contractorLeads.length === 0 ? (
                <EmptyState
                    icon={LeadIcon}
                    title={t('aiLeadsNoLeads')}
                    message="Check back later for new opportunities."
                    action={
                        <button onClick={() => generateDailyBriefing(true)} className="mt-4 text-primary font-bold hover:underline">
                            Run Scanner Now
                        </button>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contractorLeads.map((lead, index) => {
                        const Icon = getLeadIcon(lead.type);
                        const styles = leadStyles[lead.type] || leadStyles[ContractorLeadType.Recommendation];
                        const score = getMatchScore(lead);
                        
                        return (
                            <div 
                                key={lead.id} 
                                className={`bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 border-l-[6px] ${styles.borderLeft} p-6 flex flex-col h-full justify-between group transition-all duration-300 hover:-translate-y-1 relative overflow-hidden animate-fade-in-up`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="absolute top-4 right-4 flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-full border border-green-100 shadow-sm">
                                    <CheckBadgeIcon className="h-3 w-3"/>
                                    {score}% Match
                                </div>

                                <div className="text-left">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-gray-50 p-3 rounded-xl">
                                            <Icon className="h-6 w-6 text-gray-700"/>
                                        </div>
                                    </div>
                                    
                                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md mb-2 ${styles.badge}`}>
                                        {styles.badgeText}
                                    </span>

                                    <h4 className="font-bold text-lg text-gray-900 leading-tight mb-3 group-hover:text-primary transition-colors">{lead.title}</h4>
                                    
                                    <div className="text-sm text-gray-500 space-y-2 mb-4">
                                        <p className="flex items-center gap-2"><MapPinIcon className="h-4 w-4 text-gray-400"/> {lead.location}</p>
                                        {lead.estimatedValue && <p className="flex items-center gap-2 font-semibold text-gray-700"><CurrencyDollarIcon className="h-4 w-4 text-gray-400"/> {formatCurrency(lead.estimatedValue)}</p>}
                                        <div className="flex justify-between text-xs text-gray-400 pt-2 border-t border-dashed">
                                             <span className="flex items-center gap-1"><GlobeAltIcon className="h-3 w-3"/> {lead.source}</span>
                                             <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 line-clamp-3 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                                        "{lead.summary}"
                                    </p>
                                </div>
                                
                                <button
                                    onClick={() => handleActionClick(lead)}
                                    className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-primary transition-colors shadow-lg"
                                >
                                    {lead.action.label}
                                    <ArrowRightIcon className="h-4 w-4"/>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AILeadsPage;
