
import React from 'react';
import { useData } from '../../hooks/useDataContext.tsx';
import { useLocalization } from '../../hooks/useLocalization.tsx';
import { Lead, LeadType, ContractorLeadType, ContractorLead } from '../../types';
import { PresentationChartLineIcon, SparklesIcon, BriefcaseIcon, DocumentMagnifyingGlassIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import EmptyState from '../../components/EmptyState.tsx';

const getLeadIcon = (type: LeadType | ContractorLeadType) => {
    switch (type) {
        case LeadType.TrendingProduct:
            return SparklesIcon;
        case LeadType.NewProject:
        case ContractorLeadType.PrivateDevelopment:
            return BriefcaseIcon;
        case LeadType.DirectOpportunity:
        case ContractorLeadType.PublicTender:
            return DocumentMagnifyingGlassIcon;
        default:
            return PresentationChartLineIcon;
    }
};

const leadStyles: Record<string, any> = {
    [LeadType.TrendingProduct]: {
        card: 'border-blue-200',
        iconContainer: 'bg-blue-100',
        icon: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-800',
        badgeText: 'Trending Product',
    },
    [LeadType.NewProject]: {
        card: 'border-purple-200',
        iconContainer: 'bg-purple-100',
        icon: 'text-purple-600',
        badge: 'bg-purple-100 text-purple-800',
        badgeText: 'New Project',
    },
    [LeadType.DirectOpportunity]: {
        card: 'border-2 border-amber-500',
        iconContainer: 'bg-amber-100',
        icon: 'text-amber-600',
        badge: 'bg-yellow-100 text-yellow-800',
        badgeText: 'Direct Opportunity',
    }
};

interface SalesLeadsPageProps {
    onNavigate: (tab: any) => void;
}

const SalesLeadsPage: React.FC<SalesLeadsPageProps> = ({ onNavigate }) => {
    // leads comes from useData which returns contractorLeads (ContractorLead[])
    const { leads } = useData();
    const { t } = useLocalization();

    const handleActionClick = (lead: ContractorLead) => {
        if (lead.action.target) {
            onNavigate(lead.action.target);
        }
    };

    return (
        <div className="text-left">
            <h2 className="text-3xl font-bold text-left">{t('navSalesLeads')}</h2>
            <p className="text-gray-600 mb-6 text-left">{t('leadsDescription')}</p>

            {leads.length === 0 ? (
                <EmptyState
                    icon={PresentationChartLineIcon}
                    title={t('leadsNoLeads')}
                    message={t('leadsNoLeadsDesc')}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {leads.map(lead => {
                        const type = lead.type as any;
                        const styles = leadStyles[type] || leadStyles[LeadType.TrendingProduct];
                        const Icon = getLeadIcon(type);
                        
                        return (
                            <div key={lead.id} className={`bg-white rounded-lg shadow-md p-6 flex flex-col h-full justify-between group transition-shadow duration-300 hover:shadow-xl border-t-4 ${styles.card} text-left`}>
                                <div className="text-left">
                                    <div className={`p-3 rounded-full w-fit mb-4 ${styles.iconContainer}`}>
                                        <Icon className={`h-8 w-8 ${styles.icon}`}/>
                                    </div>
                                    <h4 className="font-bold text-gray-800 text-left">{lead.title}</h4>
                                    <p className="text-sm text-gray-600 mt-2 flex-grow text-left">{lead.summary}</p>
                                </div>
                                <button
                                    onClick={() => handleActionClick(lead)}
                                    className="mt-6 w-full bg-slate-900 text-white font-black py-2.5 px-3 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-black transition-colors"
                                >
                                    {lead.action.label}
                                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1"/>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SalesLeadsPage;
