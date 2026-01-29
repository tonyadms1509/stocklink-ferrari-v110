
import React, { useState } from 'react';
import { ArrowLeftIcon, CpuChipIcon, ShieldCheckIcon, DocumentTextIcon, ChatBubbleBottomCenterTextIcon, ScaleIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../../hooks/useLocalization';
import AITenderAssistant from '../../components/AITenderAssistant';
import AIClientCommunicator from '../../components/AIClientCommunicator';
import AIBusinessNameGenerator from '../../components/AIBusinessNameGenerator';
import AILegalAssistant from '../../components/AILegalAssistant';
import AISafetyAuditor from '../../components/AISafetyAuditor';

interface AICopilotPageProps {
    onBack?: () => void;
}

type ActiveTool = 'none' | 'safety' | 'tender' | 'client' | 'brand' | 'legal';

const AgentCard: React.FC<{ 
    title: string; 
    role: string; 
    description: string; 
    icon: React.ElementType; 
    gradient: string;
    onClick: () => void;
    isActive: boolean;
}> = ({ title, role, description, icon: Icon, gradient, onClick, isActive }) => (
    <button 
        onClick={onClick}
        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 text-left w-full h-full group ${isActive ? 'ring-4 ring-offset-2 ring-blue-100 border-primary shadow-xl scale-[1.02]' : 'border-gray-200 hover:border-gray-300 hover:shadow-lg hover:-translate-y-1'}`}
    >
        <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${gradient}`}></div>
        <div className="p-6 relative z-10 flex flex-col h-full">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${gradient} text-white shadow-md`}>
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{role}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
    </button>
);

const AICopilotPage: React.FC<AICopilotPageProps> = ({ onBack }) => {
    const { t } = useLocalization();
    const [activeTool, setActiveTool] = useState<ActiveTool>('none');

    const agents = [
        {
            id: 'safety' as ActiveTool,
            title: 'Site Safety Officer',
            role: 'Compliance & Risk',
            description: 'Audit site photos for hazards and generate toolbox talks.',
            icon: ShieldCheckIcon,
            gradient: 'from-green-500 to-emerald-700'
        },
        {
            id: 'tender' as ActiveTool,
            title: 'Bid Writer',
            role: 'Sales & Estimation',
            description: 'Draft winning tender proposals tailored to requirements.',
            icon: DocumentTextIcon,
            gradient: 'from-blue-500 to-indigo-700'
        },
        {
            id: 'client' as ActiveTool,
            title: 'Comms Manager',
            role: 'Client Relations',
            description: 'Write professional emails, updates, and reminders.',
            icon: ChatBubbleBottomCenterTextIcon,
            gradient: 'from-purple-500 to-violet-700'
        },
        {
            id: 'legal' as ActiveTool,
            title: 'Legal Counsel',
            role: 'Contracts & Risk',
            description: 'Analyze contracts and highlight potential risks.',
            icon: ScaleIcon,
            gradient: 'from-slate-600 to-gray-800'
        },
        {
            id: 'brand' as ActiveTool,
            title: 'Brand Strategist',
            role: 'Marketing',
            description: 'Brainstorm business names and taglines.',
            icon: SparklesIcon,
            gradient: 'from-pink-500 to-rose-700'
        }
    ];

    return (
        <div className="pb-12">
            {onBack && (
                <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-6 font-medium">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    {t('backToDashboard')}
                </button>
            )}
            
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-gradient-to-br from-primary to-blue-600 rounded-lg shadow-sm">
                            <CpuChipIcon className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900">{t('copilotTitle')}</h2>
                    </div>
                    <p className="text-gray-600">{t('copilotDescription')}</p>
                </div>
                <div className="text-sm text-gray-500 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 self-start md:self-center">
                    <span className="relative inline-block w-2 h-2 bg-green-500 rounded-full mr-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                    </span>
                    AI Agents Ready
                </div>
            </div>

            {/* Agent Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {agents.map(agent => (
                    <AgentCard 
                        key={agent.id}
                        {...agent}
                        isActive={activeTool === agent.id}
                        onClick={() => setActiveTool(activeTool === agent.id ? 'none' : agent.id)}
                    />
                ))}
            </div>

            {/* Active Tool Area */}
            <div className="transition-all duration-500 ease-in-out">
                {activeTool === 'none' && (
                    <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                        <CpuChipIcon className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-400">Select an AI Agent above to begin</h3>
                    </div>
                )}

                {activeTool === 'safety' && (
                    <div className="animate-fade-in-up">
                        <AISafetyAuditor />
                    </div>
                )}
                {activeTool === 'tender' && (
                    <div className="animate-fade-in-up">
                        <AITenderAssistant />
                    </div>
                )}
                {activeTool === 'client' && (
                    <div className="animate-fade-in-up">
                        <AIClientCommunicator />
                    </div>
                )}
                {activeTool === 'brand' && (
                    <div className="animate-fade-in-up">
                        <AIBusinessNameGenerator />
                    </div>
                )}
                {activeTool === 'legal' && (
                    <div className="animate-fade-in-up">
                        <AILegalAssistant />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AICopilotPage;
