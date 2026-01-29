
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { StockRequest, StockRequestResponse, RequestStatus, AIDraftedResponse } from '../../types';
import { PlusIcon, XMarkIcon, DocumentMagnifyingGlassIcon, ChevronDownIcon, ChatBubbleLeftRightIcon, CalendarIcon, MapPinIcon, InboxIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
import EmptyState from '../../components/EmptyState';

// Form Modal for responding to a request
const ResponseForm: React.FC<{ request: StockRequest, onSave: (data: Omit<StockRequestResponse, 'id' | 'supplierId' | 'supplierName' | 'createdAt'>) => void; onCancel: () => void }> = ({ request, onSave, onCancel }) => {
    const { t } = useLocalization();
    // Fix: access current currency if needed, but usually we just use formatCurrency
    const { currency } = useCurrency();
    const [formData, setFormData] = useState({
        requestId: request.id,
        pricePerUnit: '',
        leadTime: '',
        message: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'pricePerUnit') {
            if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            pricePerUnit: parseFloat(formData.pricePerUnit) || 0,
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-scale">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
                <div className="flex justify-between items-center mb-6 text-left">
                    <h2 className="text-2xl font-bold">{t('rfsResponseModalTitle')}</h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="h-6 w-6"/>
                    </button>
                </div>
                 <div className="mb-4 p-3 bg-gray-50 rounded-md border text-left">
                    <p className="text-sm text-gray-500">Responding to request for:</p>
                    <p className="font-bold text-primary">{request.itemName}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                         <div>
                            <label className="block text-sm font-medium">{t('rfsYourPricePerUnit', { currency })}</label>
                            <input type="text" inputMode="decimal" name="pricePerUnit" value={formData.pricePerUnit} onChange={handleChange} className="p-2 border rounded w-full mt-1" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('rfsYourLeadTime')}</label>
                            <input type="text" name="leadTime" value={formData.leadTime} onChange={handleChange} className="p-2 border rounded w-full mt-1" required placeholder="e.g. In Stock, 2-3 days"/>
                        </div>
                    </div>
                    <div className="text-left">
                        <label className="block text-sm font-medium">{t('rfsYourMessage')}</label>
                        <textarea name="message" value={formData.message} onChange={handleChange} className="p-2 border rounded w-full mt-1" rows={3} placeholder="Provide additional details if needed."/>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">{t('payoutCancel')}</button>
                        <button type="submit" className="bg-secondary hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg">{t('rfsSubmitQuote')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface ViewStockRequestsProps {
    onStartChat: (contractorId: string) => void;
}

const ViewStockRequests: React.FC<ViewStockRequestsProps> = ({ onStartChat }) => {
    const { stockRequests, respondToStockRequest, isAgentEnabled, toggleAIAgent, aiDraftedResponses, sendAIDraftedResponse, dismissAIDraftedResponse } = useData();
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(null);

    const openRequests = useMemo(() => {
        return (stockRequests || [])
            .filter(r => r.status === RequestStatus.Open)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [stockRequests]);

    const handleOpenModal = (request: StockRequest) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedRequest(null);
        setIsModalOpen(false);
    };
    
    const handleSaveResponse = (data: Omit<StockRequestResponse, 'id' | 'supplierId' | 'supplierName' | 'createdAt'>) => {
        respondToStockRequest(data);
        handleCloseModal();
    }

    return (
        <div className="text-left">
            <div className="mb-6">
                <h2 className="text-3xl font-bold">{t('rfsSupplierTitle')}</h2>
                <p className="text-gray-600 mt-1">{t('rfsSupplierDescription')}</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="flex justify-between items-center">
                    <div className="text-left">
                        <h3 className="text-xl font-bold flex items-center gap-2"><SparklesIcon className="h-6 w-6 text-primary" />{t('aiAgentTitle')}</h3>
                        <p className="text-sm text-gray-600 mt-1">{t('aiAgentDescription')}</p>
                    </div>
                    <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 mr-3">{t('aiAgentEnable')}</span>
                        <button
                            type="button"
                            className={`${isAgentEnabled ? 'bg-primary' : 'bg-gray-200'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
                            onClick={toggleAIAgent}
                            aria-checked={isAgentEnabled}
                            role="switch"
                        >
                            <span className={`${isAgentEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}/>
                        </button>
                    </div>
                </div>
            </div>

            {isAgentEnabled && (
                <div className="mb-8 text-left">
                    <h3 className="text-2xl font-bold mb-4">{t('aiAgentDraftsTitle')}</h3>
                    {(aiDraftedResponses || []).length > 0 ? (
                        <div className="space-y-4">
                           {aiDraftedResponses.map(draft => (
                               <div key={draft.draftId} className="bg-yellow-50 p-4 rounded-lg border-2 border-dashed border-yellow-400">
                                   <p className="text-sm font-semibold">AI draft for: "{draft.stockRequest.itemName}" from {draft.stockRequest.contractorName}</p>
                                    <div className="mt-2 text-sm">
                                        <p><strong>Price:</strong> {formatCurrency(draft.pricePerUnit)}</p>
                                        <p><strong>Lead Time:</strong> {draft.leadTime}</p>
                                        <p><strong>Message:</strong> "{draft.message}"</p>
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <button onClick={() => sendAIDraftedResponse(draft.draftId)} className="bg-secondary text-white text-xs font-bold py-1 px-3 rounded-full">{t('aiAgentSendResponse')}</button>
                                        <button onClick={() => dismissAIDraftedResponse(draft.draftId)} className="bg-gray-200 text-gray-700 text-xs font-bold py-1 px-3 rounded-full">{t('aiAgentDismiss')}</button>
                                    </div>
                               </div>
                           ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">{t('aiAgentNoDrafts')}</p>
                    )}
                </div>
            )}

            <h3 className="text-2xl font-bold mb-4">Public Requests</h3>
            {openRequests.length === 0 ? (
                <EmptyState
                    icon={InboxIcon}
                    title={t('rfsNoPublicRequests')}
                    message="Check back later for new opportunities."
                />
            ) : (
                <div className="space-y-4">
                    {openRequests.map(request => (
                        <div key={request.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
                            <div className="flex-grow">
                                <h3 className="text-lg font-bold text-primary">{request.itemName}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {t('rfsPostedBy')} <span className="font-semibold">{request.contractorName}</span> | {t('rfsQuantity')}: {request.quantity} | {t('rfsLocation')}: {request.location}
                                </p>
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{request.description}</p>
                            </div>
                            <div className="flex-shrink-0">
                                <button onClick={() => handleOpenModal(request)} className="bg-primary hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg">
                                    {t('rfsRespondWithQuote')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {isModalOpen && selectedRequest && (
                <ResponseForm 
                    request={selectedRequest}
                    onSave={handleSaveResponse}
                    onCancel={handleCloseModal}
                />
            )}
        </div>
    );
};

export default ViewStockRequests;
