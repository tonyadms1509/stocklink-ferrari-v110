
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useData } from '../hooks/useDataContext';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../hooks/useLocalization';
import { useCurrency } from '../hooks/useCurrency';

interface AINegotiatorModalProps {
  quoteId: string;
  onClose: () => void;
  onSuggestion: (suggestionText: string) => void;
}

const AINegotiatorModal: React.FC<AINegotiatorModalProps> = ({ quoteId, onClose, onSuggestion }) => {
  const { getQuoteById, getSupplierById } = useData();
  const { t } = useLocalization();
  const { formatCurrency } = useCurrency();

  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState('');

  const quote = getQuoteById(quoteId);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !process.env.API_KEY || !quote) {
      setError('Please enter a query. API key and quote context are required.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAiResponse('');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const supplier = getSupplierById(quote.supplierId);

      const itemsSummary = quote.items.map(item => 
        `- ${item.quantity} x ${item.product.name} @ ${formatCurrency(item.quotedPrice || item.originalPrice)} each`
      ).join('\n');

      const prompt = `You are an expert procurement and negotiation assistant for a building contractor in South Africa. Your goal is to help the contractor get the best possible price and terms.

        **Quote Context:**
        - Supplier Name: ${supplier?.name}
        - Quote Number: ${quote.quoteNumber}
        - Total Quoted Price: ${formatCurrency(quote.quotedTotal || quote.total)}
        - Items:
          ${itemsSummary}

        **Contractor's Question:**
        "${query}"

        **Your Task:**
        Based on the quote context and the contractor's question, provide tactical advice.
        - If they ask for a counter-offer, suggest a reasonable percentage discount to ask for (e.g., 5-10%) and calculate the new total.
        - If they ask you to draft a message, write a short, professional, and polite message to the supplier.
        - If they ask if a price is good, give a general assessment (e.g., "The discount on RhinoBoard is significant, but there might be room to negotiate on the bulk brick order.").
        - Keep your response concise, actionable, and formatted with simple newlines for readability. Do not use markdown.`;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
      });

      /* Fix: add null safety for response.text property access to avoid potential crash if text is undefined */
      setAiResponse(response.text?.trim() || '');

    } catch (err) {
      console.error("AI Negotiator Error:", err);
      setError('An error occurred while contacting the AI assistant. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!quote) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full transform transition-all relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6"/>
        </button>
        <div className="flex items-center gap-3 mb-2">
            <SparklesIcon className="h-8 w-8 text-accent"/>
            <h2 className="text-2xl font-bold text-primary">{t('negotiatorTitle')}</h2>
        </div>
        <p className="text-gray-600 mb-4">{t('negotiatorDescription')}</p>
        
        <form onSubmit={handleAskAI}>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('negotiatorPlaceholder')}
            className="w-full p-2 border-2 border-base-300 rounded-lg focus:ring-primary focus:border-primary transition-colors resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="w-full mt-2 bg-primary hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? t('negotiatorThinking') : t('negotiatorGetSuggestion')}
          </button>
        </form>

        {(aiResponse || error) && (
            <div className="mt-4 p-4 bg-base-100 rounded-lg border max-h-60 overflow-y-auto">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {aiResponse && (
                    <p className="text-gray-800 whitespace-pre-wrap">{aiResponse}</p>
                )}
            </div>
        )}

        {aiResponse && (
             <button 
                onClick={() => onSuggestion(aiResponse)} 
                className="w-full mt-4 bg-secondary hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg"
            >
                {t('negotiatorInsertSuggestion')}
            </button>
        )}
      </div>
    </div>
  );
};

export default AINegotiatorModal;
