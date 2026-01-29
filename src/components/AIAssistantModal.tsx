import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useData } from '../hooks/useDataContext';
import { SparklesIcon, XMarkIcon, MicrophoneIcon, StopCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { useLocalization } from '../hooks/useLocalization';

declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (searchTerm: string) => void;
  initialQuery?: string;
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, onSearch, initialQuery }) => {
  const { products } = useData();
  const { locale } = useLocalization();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const hasSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  // Sync initial query from search bar
  useEffect(() => {
    if (isOpen && initialQuery) {
      setQuery(initialQuery);
    }
  }, [isOpen, initialQuery]);

  // Handle Voice Input Setup
  useEffect(() => {
    if (!hasSpeechRecognition) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    
    recognition.continuous = false;
    recognition.lang = locale === 'af' ? 'af-ZA' : locale === 'zu' ? 'zu-ZA' : 'en-ZA';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
        const speechResult = event.results[0][0].transcript;
        setQuery(speechResult);
    };
    
    recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setError('Microphone error or access denied.');
        setIsListening(false);
    };

    recognition.onend = () => {
        setIsListening(false);
    };
    
    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };
  }, [locale, hasSpeechRecognition]);

  const handleVoiceInput = () => {
    if (isLoading || !recognitionRef.current) return;
    
    if (isListening) {
        recognitionRef.current.stop();
    } else {
        setQuery('');
        setError(null);
        recognitionRef.current.start();
        setIsListening(true);
    }
  };
  
  const handleAskAI = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const win = window as any;

    if (!process.env.API_KEY) {
        if (win.aistudio) {
            const hasKey = await win.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await win.aistudio.openSelectKey();
            }
        } else {
            setError('API key not configured.');
            return;
        }
    }

    if (!query.trim()) {
      setError('Please say or type something.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const uniqueBrands = [...new Set(products.map(p => p.brand))].slice(0, 20).join(', ');
      const uniqueCategories = [...new Set(products.map(p => p.category))].join(', ');

      const prompt = `You are an expert procurement assistant for the South African construction industry. 
      A contractor is searching for: "${query}".
      
      Your goal is to convert natural language requests into specific, technical search terms used by local suppliers like BuildIt or Builders Warehouse.
      
      CONTEXT:
      - Available Brands: ${uniqueBrands}
      - Available Categories: ${uniqueCategories}
      
      RULES:
      - If they mention "foundation", suggest 42.5N grade structural cement.
      - If they mention "brickwork", suggest 32.5N grade masonry cement.
      - If they mention "SANS", prioritize compliant brands.
      - Respond with ONLY the single most relevant technical search term (e.g. "PPC Cement 42.5N" or "Cobra 15mm Copper Pipe"). No conversational filler.`;

      const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt
      });

      const searchTerm = response.text?.trim();

      if (searchTerm) {
        onSearch(searchTerm);
        onClose();
      } else {
        setError('I couldn\'t process that request. Try again?');
      }

    } catch (err: any) {
      console.error("AI Agent Error:", err);
      const win = window as any;
      if (err.message?.includes('Requested entity was not found')) {
          if (win.aistudio) await win.aistudio.openSelectKey();
      }
      setError('Neural link interrupted. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl transition-opacity duration-500" aria-modal="true" role="dialog">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
            <XMarkIcon className="h-8 w-8"/>
        </button>

        <div className="relative flex flex-col items-center w-full max-w-2xl px-4">
            
            <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20 blur-3xl transition-all duration-1000 ${isListening || isLoading ? 'scale-150 opacity-40' : 'scale-100'}`}></div>
                
                <div className={`relative w-32 h-32 rounded-full bg-black border border-white/20 shadow-[0_0_50px_rgba(59,130,246,0.5)] flex items-center justify-center transition-all duration-500 ${isListening ? 'scale-110 border-blue-400/50' : ''}`}>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600/20 to-purple-600/20 animate-spin-slow"></div>
                    {isLoading ? (
                        <ArrowPathIcon className="h-12 w-12 text-blue-400 animate-spin relative z-10" />
                    ) : (
                        <SparklesIcon className={`h-12 w-12 text-white/80 relative z-10 transition-all duration-300 ${isListening ? 'text-blue-400' : ''}`} />
                    )}
                </div>

                <div className="absolute inset-0 border border-white/10 rounded-full w-full h-full animate-[spin_10s_linear_infinite]"></div>
            </div>

            <div className="w-full space-y-6 text-center">
                <div className="h-16 flex items-center justify-center">
                    {error ? (
                        <p className="text-red-400 font-mono text-lg animate-pulse">{error}</p>
                    ) : (
                        <p className="text-2xl font-light text-white/90 font-sans tracking-wide">
                            {query || (isLoading ? "Optimizing Query..." : (isListening ? "Listening..." : "How can I refine your search?"))}
                            <span className="animate-pulse">|</span>
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-center gap-4">
                     <form onSubmit={handleAskAI} className="relative w-full max-w-md">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g., foundation cement"
                            className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all backdrop-blur-md"
                            autoFocus
                            disabled={isLoading || isListening}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                             {hasSpeechRecognition && (
                                <button
                                    type="button"
                                    onClick={handleVoiceInput}
                                    className={`p-2 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'hover:bg-white/10 text-white/50 hover:text-white'}`}
                                >
                                    {isListening ? <StopCircleIcon className="h-6 w-6"/> : <MicrophoneIcon className="h-6 w-6"/>}
                                </button>
                            )}
                            <button
                                type="submit"
                                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors shadow-lg"
                                disabled={isLoading || isListening || !query.trim()}
                            >
                                <ArrowPathIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </form>
                </div>
                
                <div className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] mt-8">
                    South African Material Intelligence Ready
                </div>
            </div>
        </div>
    </div>
  );
};

export default AIAssistantModal;