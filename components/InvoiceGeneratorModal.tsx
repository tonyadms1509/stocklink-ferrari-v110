
import React, { useState, useMemo } from 'react';
import { Project, ProjectExpense, ProjectMaterial } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { useCurrency } from '../hooks/useCurrency';
import { XMarkIcon, SparklesIcon, DocumentArrowDownIcon, PaperAirplaneIcon, PrinterIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI, Type } from '@google/genai';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

interface InvoiceGeneratorModalProps {
    project: Project;
    expenses: ProjectExpense[];
    materials: ProjectMaterial[];
    onClose: () => void;
}

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    originalDescription?: string; // For reverting AI changes if needed
}

const InvoiceGeneratorModal: React.FC<InvoiceGeneratorModalProps> = ({ project, expenses, materials, onClose }) => {
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [isPolishing, setIsPolishing] = useState(false);
    const [markupPercent, setMarkupPercent] = useState(0);
    
    // Convert expenses and materials to uniform invoice items
    const initialItems: InvoiceItem[] = useMemo(() => {
        const expenseItems: InvoiceItem[] = expenses.map(e => ({
            id: e.id,
            description: e.description,
            quantity: 1,
            unitPrice: e.amount,
            total: e.amount,
            originalDescription: e.description
        }));

        const materialItems: InvoiceItem[] = materials.map(m => ({
            id: m.id,
            description: m.productName,
            quantity: m.quantity,
            unitPrice: m.pricePerUnit,
            total: m.quantity * m.pricePerUnit,
            originalDescription: m.productName
        }));

        return [...expenseItems, ...materialItems];
    }, [expenses, materials]);

    const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>(initialItems);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialItems.map(i => i.id)));

    // Calculate totals based on selection and markup
    const subtotal = useMemo(() => {
        return invoiceItems
            .filter(i => selectedIds.has(i.id))
            .reduce((sum, i) => sum + i.total, 0);
    }, [invoiceItems, selectedIds]);

    const markupAmount = subtotal * (markupPercent / 100);
    const total = subtotal + markupAmount;

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handlePrint = () => {
        window.print();
    }

    const handlePolishDescriptions = async () => {
        if (!process.env.API_KEY) {
            showToast("API Key required for AI Polish.", 'error');
            return;
        }
        setIsPolishing(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const itemsToPolish = invoiceItems.filter(i => selectedIds.has(i.id));
            
            const prompt = `
                You are a professional invoice editor for a construction company.
                Rewrite the following list of expense descriptions to be more professional and client-appropriate.
                For example, "Lunch for guys" -> "Crew Subsistence". "Builders Warehouse receipt" -> "Construction Materials".
                Keep quantities and prices unchanged.
                
                Input JSON:
                ${JSON.stringify(itemsToPolish.map(i => ({ id: i.id, description: i.description })))}

                Return a JSON array of objects with "id" and "newDescription".
            `;

            const responseSchema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        newDescription: { type: Type.STRING }
                    },
                    required: ['id', 'newDescription']
                }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: 'application/json', responseSchema }
            });

            const updates = JSON.parse(response.text);
            
            setInvoiceItems(prev => prev.map(item => {
                const update = updates.find((u: any) => u.id === item.id);
                return update ? { ...item, description: update.newDescription } : item;
            }));

        } catch (e) {
            console.error(e);
            showToast("Failed to polish descriptions.", 'error');
        } finally {
            setIsPolishing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[80] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden">
                {/* Left Sidebar: Configuration (Hidden on Print) */}
                <div className="w-1/3 bg-gray-50 border-r p-6 flex flex-col overflow-y-auto no-print">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-primary">{t('invoiceModalTitle')}</h2>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-bold text-gray-700 mb-2">{t('invoiceItems')}</h3>
                        <div className="space-y-2">
                            {invoiceItems.map(item => (
                                <div key={item.id} className="flex items-start gap-2 p-2 bg-white rounded border border-gray-200">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.has(item.id)} 
                                        onChange={() => toggleSelection(item.id)}
                                        className="mt-1 rounded text-primary focus:ring-primary"
                                    />
                                    <div className="flex-grow text-sm">
                                        <p className="font-medium">{item.description}</p>
                                        <p className="text-gray-500">{item.quantity} x {formatCurrency(item.unitPrice)}</p>
                                    </div>
                                    <p className="font-bold text-sm">{formatCurrency(item.total)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto space-y-4 pt-4 border-t">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('invoiceMarkup')}</label>
                            <input 
                                type="number" 
                                value={markupPercent} 
                                onChange={e => setMarkupPercent(parseFloat(e.target.value) || 0)}
                                className="w-full p-2 border rounded"
                                min="0"
                            />
                        </div>
                        <button 
                            onClick={handlePolishDescriptions} 
                            disabled={isPolishing || selectedIds.size === 0}
                            className="w-full flex items-center justify-center gap-2 bg-purple-100 text-purple-700 font-bold py-2 rounded-lg hover:bg-purple-200 disabled:opacity-50"
                        >
                            <SparklesIcon className={`h-5 w-5 ${isPolishing ? 'animate-spin' : ''}`} />
                            {isPolishing ? t('invoicePolishing') : t('invoiceAIPolish')}
                        </button>
                    </div>
                </div>

                {/* Right Panel: Preview (Printable Area) */}
                <div className="w-2/3 p-8 flex flex-col bg-gray-100 print:w-full print:bg-white print:p-0" id="printable-document">
                    <div className="bg-white shadow-lg rounded-lg p-8 flex-grow overflow-y-auto text-gray-800 font-sans relative print:shadow-none print:overflow-visible">
                         <div className="absolute top-0 right-0 bg-gray-200 text-xs font-bold px-2 py-1 rounded-bl-lg text-gray-500 uppercase no-print">
                            {t('invoicePreview')}
                         </div>

                        {/* Header */}
                        <div className="flex justify-between mb-8 border-b pb-6">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">INVOICE</h1>
                                <p className="font-bold">{user?.name}</p>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                                <p className="text-sm text-gray-500">{user?.contact?.phone}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Date: {new Date().toLocaleDateString()}</p>
                                <p className="text-sm text-gray-500">Project: {project.projectName}</p>
                                <div className="mt-4">
                                    <p className="font-bold text-gray-700">Bill To:</p>
                                    <p className="text-lg">{project.clientName}</p>
                                    <p className="text-sm text-gray-500">{project.address}</p>
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <table className="w-full text-left mb-8 border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-800">
                                    <th className="py-2">Description</th>
                                    <th className="py-2 text-right">Qty</th>
                                    <th className="py-2 text-right">Unit Price</th>
                                    <th className="py-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoiceItems.filter(i => selectedIds.has(i.id)).map(item => (
                                    <tr key={item.id} className="border-b border-gray-200">
                                        <td className="py-3">{item.description}</td>
                                        <td className="py-3 text-right">{item.quantity}</td>
                                        <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                                        <td className="py-3 text-right font-medium">{formatCurrency(item.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-1/2 space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                {markupPercent > 0 && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Markup ({markupPercent}%)</span>
                                        <span>{formatCurrency(markupAmount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-xl border-t-2 border-gray-800 pt-2 mt-2">
                                    <span>Total</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions (Hidden on Print) */}
                    <div className="mt-6 flex justify-end gap-4 no-print">
                        <button onClick={onClose} className="bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-400">
                            {t('payoutCancel')}
                        </button>
                        <button onClick={handlePrint} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                            <PrinterIcon className="h-5 w-5" />
                            Print / PDF
                        </button>
                        <button onClick={() => showToast('Invoice sent to client', 'success')} className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 hover:bg-green-700">
                            <PaperAirplaneIcon className="h-5 w-5" />
                            Send to Client
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceGeneratorModal;
