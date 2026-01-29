
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../hooks/useLocalization';
import { Dispute, DisputeStatus, UserRole } from '../../types';
import { ShieldExclamationIcon } from '@heroicons/react/24/solid';
import DisputeThread from '../../components/DisputeThread';
import AIMediationModal from '../../components/AIMediationModal';

const getStatusColor = (status: DisputeStatus) => {
    switch (status) {
        case DisputeStatus.New: return 'bg-blue-100 text-blue-800';
        case DisputeStatus.SupplierResponded:
        case DisputeStatus.ContractorResponded:
             return 'bg-yellow-100 text-yellow-800';
        case DisputeStatus.UnderAdminReview: return 'bg-purple-100 text-purple-800';
        case DisputeStatus.Resolved: return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const DisputesPage: React.FC = () => {
    const { disputes, addDisputeMessage, users, getSupplierById, generateDisputeSuggestion, aiSuggestion, isSuggestionLoading, suggestionError, clearDisputeSuggestion } = useData();
    const { user } = useAuth();
    const { t } = useLocalization();
    const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);

    const myDisputes = useMemo(() => {
        if (!user) return [];
        return disputes
            .filter(d => d.participantIds.includes(user.id))
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [disputes, user]);

    const selectedDispute = useMemo(() => {
        return myDisputes.find(d => d.id === selectedDisputeId);
    }, [myDisputes, selectedDisputeId]);

    const handleSendMessage = (disputeId: string, text: string) => {
        addDisputeMessage(disputeId, text);
    };
    
    const handleProposeSuggestion = (suggestionText: string) => {
        if (selectedDisputeId) {
            handleSendMessage(selectedDisputeId, `AI Suggestion: "${suggestionText}"`);
            clearDisputeSuggestion();
        }
    };

    if (!user) return null;

    return (
        <>
             <div>
                 <h2 className="text-3xl font-bold mb-6">{t('disputesTitle')}</h2>
                 <div className="bg-white rounded-lg shadow-md h-[70vh] flex">
                    <aside className="w-1/3 border-r flex flex-col">
                        <div className="p-4 border-b">
                            <h3 className="font-bold">Open Disputes</h3>
                        </div>
                        <ul className="overflow-y-auto flex-1">
                            {myDisputes.map(d => {
                                const otherPartyName = user.role === UserRole.Contractor 
                                    ? getSupplierById(d.supplierId)?.name 
                                    : users.find(u => u.id === d.contractorId)?.name;
                                return (
                                    <li key={d.id}>
                                        <button onClick={() => setSelectedDisputeId(d.id)} className={`w-full text-left p-4 border-b hover:bg-base-100 ${selectedDisputeId === d.id ? 'bg-base-200' : ''}`}>
                                            <div className="flex justify-between items-center">
                                                <p className="font-semibold">vs {otherPartyName || 'Unknown'}</p>
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(d.status)}`}>{d.status}</span>
                                            </div>
                                            <p className="text-sm text-gray-500">Order #{d.orderNumber}</p>
                                            <p className="text-xs text-gray-400 mt-1">{d.createdAt.toLocaleDateString()}</p>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </aside>
                    <main className="w-2/3">
                        {selectedDispute ? (
                            <DisputeThread dispute={selectedDispute} onSendMessage={handleSendMessage} onGenerateSuggestion={generateDisputeSuggestion} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                <ShieldExclamationIcon className="h-24 w-24 mx-auto text-base-300"/>
                                <h2 className="mt-4 text-2xl font-bold text-gray-800">Select a dispute</h2>
                                <p className="mt-2 text-gray-500">Your dispute conversations will appear here.</p>
                            </div>
                        )}
                    </main>
                 </div>
            </div>
            {aiSuggestion && (
                <AIMediationModal 
                    isLoading={isSuggestionLoading}
                    error={suggestionError}
                    suggestion={aiSuggestion}
                    onClose={clearDisputeSuggestion}
                    onPropose={handleProposeSuggestion}
                />
            )}
        </>
    );
};

export default DisputesPage;
