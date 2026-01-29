import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { SparklesIcon, XMarkIcon, ChatBubbleLeftRightIcon, CpuChipIcon, MapIcon } from '@heroicons/react/24/solid';

interface WhatsNewModalProps {
    onClose: () => void;
}

const FeatureItem: React.FC<{ icon: React.ElementType, title: string, description: string }> = ({ icon: Icon, title, description }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
            <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
            <h4 className="font-bold text-gray-800">{title}</h4>
            <p className="text-sm text-gray-600">{description}</p>
        </div>
    </div>
);

const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ onClose }) => {
    const { t } = useLocalization();
    const { user } = useAuth();

    const contractorFeatures = [
        { icon: CpuChipIcon, title: t('whatsNewProjectAsstTitle'), description: t('whatsNewProjectAsstDesc') },
        { icon: SparklesIcon, title: t('whatsNewSourcingAsstTitle'), description: t('whatsNewSourcingAsstDesc') },
    ];
    
    const supplierFeatures = [
        { icon: ChatBubbleLeftRightIcon, title: t('whatsNewBizAnalystTitle'), description: t('whatsNewBizAnalystDesc') },
        { icon: MapIcon, title: t('whatsNewRoutePlannerTitle'), description: t('whatsNewRoutePlannerDesc') },
    ];

    const featuresToShow = user?.role === UserRole.Supplier ? supplierFeatures : contractorFeatures;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-scale">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-6 w-6"/>
                </button>
                <div className="text-center">
                    <SparklesIcon className="h-12 w-12 text-accent mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-primary">{t('whatsNewTitle')}</h2>
                    <p className="text-gray-600 mt-2 mb-6">{t('whatsNewSubtitle')}</p>
                </div>

                <div className="space-y-6">
                    {featuresToShow.map(feature => (
                        <FeatureItem key={feature.title} {...feature} />
                    ))}
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-8 bg-secondary hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg"
                >
                    {t('whatsNewGotIt')}
                </button>
            </div>
        </div>
    );
};

export default WhatsNewModal;