import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { StockRequest, StockRequestResponse, RequestStatus } from '../../types';
import { ArrowLeftIcon, PlusIcon, XMarkIcon, DocumentMagnifyingGlassIcon, ChevronDownIcon, ChatBubbleLeftRightIcon, CalendarIcon, MapPinIcon, InboxIcon, SparklesIcon, TicketIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../hooks/useLocalization';
import { useCurrency } from '../../hooks/useCurrency';
import EmptyState from '../../components/EmptyState';

// Form Modal for creating a new request
const RequestForm: React.FC<{ onSave: (data: Omit<StockRequest, 'id' | 'contractorId' | 'contractorName' | 'status' | 'createdAt'>) => void; onCancel: () => void }> = ({ onSave, onCancel }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState({
        itemName: '',
        description: '',
        category: 'Building Materials',
        quantity: 1,
        requiredBy: new Date(),
        location: '',
        // Fix: initialize responses to 0 to match Omit requirement
        responses: 0
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? parseInt(value) || 1 : (type === 'date' ? new Date(value) : value) 
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-scale">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
                <div className="flex justify-between items-center mb-6 text-left">
                    <h2 className="text-2xl font-bold">{t('rfsCreateModalTitle')}</h2>
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="h-6 w-6"/>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="text-left">
                        <label className="block text-sm font-medium">{t('rfsItemName')}</label>
                        <input type="text" name="itemName" value={formData.itemName} onChange={handleChange} className="p-2 border rounded w-full mt-1" required />
                    </div>
                    <div className="text-left">
                        <label className="block text-sm font-medium">{t('rfsDescription')}</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="p-2 border rounded w-full mt-1" rows={4} required placeholder="Include details like size, material, brand, or specific requirements."/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        <div>
                            <label className="block text-sm font-medium">{t('rfsCategory')}</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="p-2 border rounded w-full mt-1">
                                <option>Building Materials</option>
                                <option>Plumbing Supplies</option>
                                <option>Hardware</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('rfsQuantity')}</label>
                            <input type="number" name="quantity" min="1" value={formData.quantity} onChange={handleChange} className="p-2 border rounded w-full mt-1" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium">{t('rfsRequiredBy')}</label>
                            <input type="date" name="requiredBy" value={formData.requiredBy.toISOString().split('T')[0]} onChange={handleChange} className="p-2 border rounded w-full mt-1" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('rfsLocation')}</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange} className="p-2 border rounded w-full mt-1" required placeholder="e.g. Sandton, Gauteng"/>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">{t('payoutCancel')}</button>
                        <button type="submit" className="bg-primary hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg">{t('rfsPostRequest')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const RequestTicket: React.FC<{ 
    request: StockRequest; 
    responses: StockRequestResponse[]; 
    isExpanded: boolean; 
    onToggle: () => void;
    onStartChat: (supplierId: string) => void;
}> = ({ request, responses, isExpanded, onToggle, onStartChat }) => {
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();

    const statusColors = {
        [RequestStatus.Open]: 'text-blue-600 border-blue-600',
        [RequestStatus.Responded]: 'text-green-600 border-green-600',
        [RequestStatus.Closed]: 'text-gray-500 border-gray-500',
    };

    return (
        <div className="relative drop-shadow-md filter">
            {/* Ticket Shape with Notches */}
            <div className={`bg-white ticket-notched p-6 transition-all duration-300 ${isExpanded ? 'pb-2' : ''}`}>
                {/* Ticket Header */}
                <div className="flex justify-between items-start mb-4 border-b border-dashed border-gray-200 pb-4 cursor-pointer" onClick={onToggle}>
                    <div className="flex-grow text-left">
                         <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight font-mono">{request.itemName}</h3>
                            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">{request.quantity} units</span>
                        </div>
                        <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">REQ-ID: {request.id.slice(-6)}</p>
                    </div>
                    
                    {/* Stamp Effect */}
                    <div className={`transform rotate-[-12deg] border-4 rounded-lg px-2 py-1 font-black text-sm uppercase opacity-80 mix-blend-multiply ${statusColors[request.status]}`}>
                        {request.status}
                    </div>
                </div>
                
                {/* Ticket Body (Always Visible Summary) */}
                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                     <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4 text-gray-400"/>
                        <span>Due: {request.requiredBy.toLocaleDateString()}</span>
                    </div>
                     <div className="flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4 text-gray-400"/>
                        <span>{request.location}</span>
                    </div>
                    <button onClick={onToggle} className="text-primary font-bold hover:underline text-xs uppercase flex items-center gap-1">
                        Details <ChevronDownIcon className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}/>
                    </button>
                </div>
                
                {/* Expanded Content */}
                {isExpanded && (
                    <div className="mt-4 pt-2 border-t border-gray-100 animate-fade-in-up text-left">
                        <p className="text-sm text-gray-700 mb-6 italic bg-gray-50 p-3 rounded border border-gray-100">"{request.description}"</p>
                        
                        <h4 className="font-bold text-sm uppercase text-gray-400 mb-3 tracking-wider">{t('rfsResponses')} ({responses.length})</h4>
                        {responses.length > 0 ? (
                            <div className="space-y-3 mb-4">
                                {responses.map(res => (
                                    <div key={res.id} className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{res.supplierName}</p>
                                            <p className="text-xs text-gray-600 mt-0.5">Lead Time: {res.leadTime}</p>
                                            {res.message && <p className="text-xs text-gray-500 italic mt-1">"{res.message}"</p>}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary text-lg">{formatCurrency(res.pricePerUnit)}</p>
                                            <p className="text-[10px] text-gray-400 uppercase">Per Unit</p>
                                            <button onClick={() => onStartChat(res.supplierId)} className="mt-1 bg-white border border-blue-200 text-blue-600 text-xs font-bold px-3 py-1 rounded-full hover:bg-blue-100">
                                                Chat
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-4 border-2 border-dashed border-gray-200 rounded-lg mb-4">
                                <p className="text-xs text-gray-400">Waiting for supplier quotes...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

interface RequestForStockProps {
    onStartChat: (supplierId: string, context?: { productId: string }) => void;
    onBack?: () => void;
}

const RequestForStock: React.FC<RequestForStockProps> = ({ onStartChat, onBack }) => {
    const { stockRequests, stockRequestResponses, createStockRequest } = useData();
    const { user } = useAuth();
    const { t } = useLocalization();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

    const myRequests = useMemo(() => {
        if (!user) return [];
        return (stockRequests || []).filter(r => r.contractorId === user.id)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }, [stockRequests, user]);
    
    const handleSaveRequest = (data: Omit<StockRequest, 'id' | 'contractorId' | 'contractorName' | 'status' | 'createdAt'>) => {
        createStockRequest(data);
        setIsModalOpen(false);
    }
    
    const toggleExpand = (requestId: string) => {
        setExpandedRequestId(prev => (prev === requestId ? null : requestId));
    }
    
    return (
        <div className="text-left">
            {onBack && (
                <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-4">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    {t('backToDashboard')}
                </button>
            )}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="text-left">
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        <TicketIcon className="h-8 w-8 text-primary" />
                        {t('rfsContractorTitle')}
                    </h2>
                    <p className="text-gray-600 mt-1">{t('rfsContractorDescription')}</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-secondary hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-md transform hover:-translate-y-0.5 transition-all">
                    <PlusIcon className="h-5 w-5" />
                    {t('rfsCreateNewRequest')}
                </button>
            </div>

            {myRequests.length === 0 ? (
                <EmptyState
                    icon={DocumentMagnifyingGlassIcon}
                    title={t('rfsNoRequests')}
                    message={t('rfsNoRequestsDesc')}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myRequests.map(request => {
                        const responses = (stockRequestResponses || []).filter(r => r.requestId === request.id);
                        return (
                             <RequestTicket 
                                key={request.id}
                                request={request}
                                responses={responses}
                                isExpanded={expandedRequestId === request.id}
                                onToggle={() => toggleExpand(request.id)}
                                onStartChat={onStartChat}
                             />
                        )
                    })}
                </div>
            )}

            {isModalOpen && <RequestForm onSave={handleSaveRequest} onCancel={() => setIsModalOpen(false)} />}
        </div>
    );
}

export default RequestForStock;
