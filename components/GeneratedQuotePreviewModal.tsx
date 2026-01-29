
import React from 'react';
import { ClientQuote } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { useCurrency } from '../hooks/useCurrency';
import { useAuth } from '../hooks/useAuth';
import { XMarkIcon, DocumentArrowDownIcon, LinkIcon, PrinterIcon } from '@heroicons/react/24/solid';
import { useToast } from '../hooks/useToast';

interface GeneratedQuotePreviewModalProps {
    quote: ClientQuote;
    onClose: () => void;
}

const GeneratedQuotePreviewModal: React.FC<GeneratedQuotePreviewModalProps> = ({ quote, onClose }) => {
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();
    const { user } = useAuth();
    const { showToast } = useToast();

    const subtotal = quote.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const vat = subtotal * quote.vatRate;
    const total = subtotal + vat;
    
    const publicQuoteUrl = `${window.location.origin}/#/quote/${quote.id}`;

    const handlePrint = () => {
        window.print();
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(publicQuoteUrl);
        showToast('Quote link copied to clipboard!', 'info');
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full flex flex-col h-[90vh]">
                <div className="p-4 bg-gray-100 flex justify-between items-center rounded-t-lg no-print">
                    <h2 className="text-xl font-bold text-primary">{t('generatedQuoteTitle')}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XMarkIcon className="h-6 w-6"/></button>
                </div>
                
                <div className="p-8 overflow-y-auto flex-grow print:p-0 print:overflow-visible" id="printable-document">
                    {/* Quote Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-3xl font-bold">{user?.name}</h3>
                            <p className="text-gray-500">{user?.email}</p>
                            <p className="text-gray-500">{user?.contact?.phone}</p>
                        </div>
                        <div className="text-right">
                            <h1 className="text-4xl font-extrabold text-gray-800">QUOTE</h1>
                            <p className="text-gray-500">#{quote.quoteNumber}</p>
                        </div>
                    </div>

                    {/* Client & Dates */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="font-bold text-gray-500 text-sm">BILL TO</p>
                            <p className="font-semibold text-lg">{quote.clientName}</p>
                            <p>{quote.clientAddress}</p>
                            <p>{quote.clientEmail}</p>
                        </div>
                        <div className="text-right">
                            <p><strong>Date Issued:</strong> {new Date(quote.createdAt).toLocaleDateString()}</p>
                            <p><strong>Valid Until:</strong> {quote.expiresAt ? new Date(quote.expiresAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <table className="w-full text-left mb-8 border-collapse">
                        <thead className="bg-gray-100 print:bg-gray-100">
                            <tr>
                                <th className="p-2 w-1/2 border-b border-gray-300">{t('clientQuoteItemDescription')}</th>
                                <th className="p-2 text-center border-b border-gray-300">{t('clientQuoteItemQty')}</th>
                                <th className="p-2 text-right border-b border-gray-300">{t('clientQuoteItemUnitPrice')}</th>
                                <th className="p-2 text-right border-b border-gray-300">{t('clientQuoteItemTotal')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quote.items.map(item => (
                                <tr key={item.id} className="border-b border-gray-200">
                                    <td className="p-2">{item.description}</td>
                                    <td className="p-2 text-center">{item.quantity}</td>
                                    <td className="p-2 text-right">{formatCurrency(item.unitPrice)}</td>
                                    <td className="p-2 text-right">{formatCurrency(item.quantity * item.unitPrice)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals and Notes */}
                    <div className="flex justify-between items-start">
                        <div className="w-1/2">
                            <h4 className="font-bold mb-2">{t('clientQuoteEditorNotes')}</h4>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.notes}</p>
                        </div>
                        <div className="w-1/3 space-y-2">
                             <div className="flex justify-between"><span>{t('clientQuoteEditorSubtotal')}</span><span>{formatCurrency(subtotal)}</span></div>
                            <div className="flex justify-between"><span>{t('clientQuoteEditorVAT', {rate: quote.vatRate * 100})}</span><span>{formatCurrency(vat)}</span></div>
                            <div className="flex justify-between font-bold text-xl border-t-2 border-gray-800 pt-2 mt-2"><span>{t('clientQuoteEditorTotal')}</span><span>{formatCurrency(total)}</span></div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-100 flex justify-end items-center gap-4 rounded-b-lg no-print">
                    <button onClick={handlePrint} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                        <PrinterIcon className="h-5 w-5"/>
                        {t('generatedQuoteDownload')} / Print
                    </button>
                    <button onClick={handleCopy} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><LinkIcon className="h-5 w-5"/>{t('generatedQuoteCopyLink')}</button>
                    <button onClick={onClose} className="bg-secondary text-white font-bold py-2 px-4 rounded-lg">{t('generatedQuoteDone')}</button>
                </div>
            </div>
        </div>
    );
};

export default GeneratedQuotePreviewModal;
