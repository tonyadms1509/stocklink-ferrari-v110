
import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { User, PortfolioProject } from '../types';
import { XMarkIcon, SparklesIcon, GlobeAltIcon, DevicePhoneMobileIcon, ComputerDesktopIcon, PaintBrushIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI, Type } from '@google/genai';

interface WebsitePreviewModalProps {
    user: User;
    portfolio: PortfolioProject[];
    onClose: () => void;
}

interface GeneratedContent {
    headline: string;
    subheadline: string;
    aboutUs: string;
    services: { title: string; desc: string }[];
    testimonials: { name: string; text: string }[];
    callToAction: string;
}

type Theme = 'modern' | 'industrial' | 'eco';

const themes: Record<Theme, { bg: string; text: string; accent: string; font: string; radius: string; nav: string }> = {
    modern: {
        bg: 'bg-white',
        text: 'text-slate-900',
        accent: 'bg-blue-600',
        font: 'font-sans',
        radius: 'rounded-2xl',
        nav: 'bg-white/80 backdrop-blur-md border-b border-gray-100'
    },
    industrial: {
        bg: 'bg-zinc-50',
        text: 'text-zinc-900',
        accent: 'bg-yellow-500',
        font: 'font-mono',
        radius: 'rounded-none',
        nav: 'bg-zinc-900 text-white'
    },
    eco: {
        bg: 'bg-stone-50',
        text: 'text-stone-800',
        accent: 'bg-emerald-600',
        font: 'font-serif',
        radius: 'rounded-lg',
        nav: 'bg-emerald-900 text-white'
    }
};

const WebsitePreviewModal: React.FC<WebsitePreviewModalProps> = ({ user, portfolio, onClose }) => {
    const { t } = useLocalization();
    const [content, setContent] = useState<GeneratedContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [theme, setTheme] = useState<Theme>('modern');

    useEffect(() => {
        const generateContent = async () => {
            if (!process.env.API_KEY) {
                // Fallback content if no API key
                setContent({
                    headline: "Building Your Vision",
                    subheadline: "Professional construction services you can trust.",
                    aboutUs: user.bio || "We are dedicated to quality craftsmanship and reliability.",
                    services: (user.specialties || ['General Construction']).map(s => ({ title: s, desc: "Expert services provided." })),
                    testimonials: [{ name: "Happy Client", text: "Great work, highly recommended!" }],
                    callToAction: "Get a Quote"
                });
                setIsLoading(false);
                return;
            }

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const prompt = `
                    Generate website copy for a contractor named "${user.name}".
                    Specialties: ${user.specialties?.join(', ')}.
                    Bio: ${user.bio}.
                    Location: ${user.serviceAreas?.[0]?.cities.join(', ')}.
                    
                    Return JSON with:
                    - headline (Catchy, max 6 words)
                    - subheadline (Value prop, max 15 words)
                    - aboutUs (Professional summary, max 40 words)
                    - services (Array of 3 objects: {title, desc})
                    - testimonials (Array of 2 fictional but realistic objects: {name, text})
                    - callToAction (Short button text)
                `;

                const responseSchema = {
                    type: Type.OBJECT,
                    properties: {
                        headline: { type: Type.STRING },
                        subheadline: { type: Type.STRING },
                        aboutUs: { type: Type.STRING },
                        services: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { title: { type: Type.STRING }, desc: { type: Type.STRING } },
                                required: ['title', 'desc']
                            } 
                        },
                        testimonials: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { name: { type: Type.STRING }, text: { type: Type.STRING } },
                                required: ['name', 'text']
                            } 
                        },
                        callToAction: { type: Type.STRING }
                    },
                    required: ['headline', 'subheadline', 'aboutUs', 'services', 'testimonials', 'callToAction']
                };

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: { responseMimeType: 'application/json', responseSchema }
                });

                setContent(JSON.parse(response.text || '{}'));

            } catch (e) {
                console.error("Website Gen Error", e);
            } finally {
                setIsLoading(false);
            }
        };

        generateContent();
    }, [user]);

    const activeTheme = themes[theme];

    return (
        <div className="fixed inset-0 bg-gray-900/95 flex items-center justify-center z-[80] p-4 backdrop-blur-sm animate-fade-in-scale">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden border border-gray-800">
                {/* Editor Toolbar */}
                <div className="bg-gray-900 text-white p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-800 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg">
                            <SparklesIcon className="h-6 w-6 text-white"/>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Instant Site Builder</h2>
                            <p className="text-xs text-gray-400">AI-Generated for {user.name}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                         {/* Theme Switcher */}
                        <div className="flex items-center gap-2 bg-gray-800 p-1 rounded-lg">
                            {(Object.keys(themes) as Theme[]).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTheme(t)}
                                    className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${theme === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        {/* View Toggle */}
                        <div className="flex bg-gray-800 rounded-lg p-1">
                            <button onClick={() => setViewMode('desktop')} className={`p-2 rounded ${viewMode === 'desktop' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}><ComputerDesktopIcon className="h-5 w-5"/></button>
                            <button onClick={() => setViewMode('mobile')} className={`p-2 rounded ${viewMode === 'mobile' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}><DevicePhoneMobileIcon className="h-5 w-5"/></button>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors">Close</button>
                        <button className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 shadow-lg shadow-green-900/20 transition-all transform hover:-translate-y-0.5">
                            <GlobeAltIcon className="h-5 w-5"/> Publish
                        </button>
                    </div>
                </div>

                {/* Preview Canvas */}
                <div className="flex-grow bg-gray-200 overflow-hidden flex justify-center items-center relative">
                    <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-50"></div>
                    
                    {isLoading ? (
                        <div className="flex flex-col items-center animate-pulse">
                            <SparklesIcon className="h-16 w-16 text-blue-500 mb-4 animate-spin"/>
                            <h3 className="text-xl font-bold text-gray-600">Drafting your website...</h3>
                            <p className="text-gray-500">Writing copy & selecting layouts</p>
                        </div>
                    ) : content ? (
                        <div 
                            className={`bg-white shadow-2xl transition-all duration-500 ease-in-out overflow-y-auto h-full scrollbar-hide ${viewMode === 'mobile' ? 'w-[375px] h-[90%] rounded-[40px] border-8 border-gray-800' : 'w-full'}`}
                        >
                            {/* Website Content */}
                            <div className={`${activeTheme.font} ${activeTheme.bg} ${activeTheme.text} min-h-full`}>
                                
                                {/* Nav */}
                                <nav className={`px-8 py-5 flex justify-between items-center sticky top-0 z-50 ${activeTheme.nav}`}>
                                    <span className="text-xl font-black tracking-tight">{user.name}</span>
                                    <div className="hidden md:flex gap-6 text-sm font-semibold opacity-90">
                                        <a href="#" className="hover:opacity-100">Home</a>
                                        <a href="#" className="hover:opacity-100">Services</a>
                                        <a href="#" className="hover:opacity-100">Portfolio</a>
                                        <a href="#" className="hover:opacity-100">Contact</a>
                                    </div>
                                    <button className={`${activeTheme.accent} ${theme === 'industrial' ? 'text-black' : 'text-white'} px-5 py-2 ${activeTheme.radius} text-sm font-bold shadow-md hover:opacity-90`}>
                                        {user.contact?.phone || "Call Us"}
                                    </button>
                                </nav>

                                {/* Hero */}
                                <header className="relative py-24 px-8 text-center overflow-hidden">
                                    {theme === 'modern' && <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50 to-white -z-10"></div>}
                                    {theme === 'industrial' && <div className="absolute top-0 right-0 w-64 h-full bg-yellow-400 -skew-x-12 -z-10 opacity-20"></div>}
                                    
                                    <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight max-w-4xl mx-auto">
                                        {content.headline}
                                    </h1>
                                    <p className="text-xl md:text-2xl opacity-70 mb-10 max-w-2xl mx-auto leading-relaxed">
                                        {content.subheadline}
                                    </p>
                                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                                        <button className={`${activeTheme.accent} ${theme === 'industrial' ? 'text-black' : 'text-white'} px-8 py-4 ${activeTheme.radius} text-lg font-bold shadow-lg hover:scale-105 transition-transform`}>
                                            {content.callToAction}
                                        </button>
                                        <button className={`px-8 py-4 ${activeTheme.radius} text-lg font-bold border-2 border-current opacity-70 hover:opacity-100 transition-opacity`}>
                                            View Portfolio
                                        </button>
                                    </div>
                                </header>

                                {/* Services */}
                                <section className="py-20 px-8">
                                    <div className="max-w-6xl mx-auto">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            {content.services.map((service, i) => (
                                                <div key={i} className={`p-8 border ${theme === 'modern' ? 'border-gray-100 shadow-sm' : 'border-current'} ${activeTheme.radius} hover:shadow-lg transition-shadow bg-white/50`}>
                                                    <div className={`w-12 h-12 ${activeTheme.accent} mb-6 ${activeTheme.radius} flex items-center justify-center text-white text-xl font-bold`}>{i+1}</div>
                                                    <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                                                    <p className="opacity-70 leading-relaxed">{service.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                {/* About */}
                                <section className={`${theme === 'modern' ? 'bg-gray-900 text-white' : theme === 'eco' ? 'bg-stone-200' : 'bg-zinc-800 text-white'} py-20 px-8`}>
                                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
                                        <div className="flex-1">
                                            <h2 className="text-3xl font-bold mb-6">About Us</h2>
                                            <p className="text-lg leading-relaxed opacity-90">{content.aboutUs}</p>
                                            
                                            <div className="mt-8 flex gap-8">
                                                <div>
                                                    <p className="text-3xl font-black">100+</p>
                                                    <p className="text-sm uppercase tracking-wider opacity-70">Projects</p>
                                                </div>
                                                <div>
                                                    <p className="text-3xl font-black">5.0</p>
                                                    <p className="text-sm uppercase tracking-wider opacity-70">Rating</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1 relative">
                                            {portfolio.length > 0 ? (
                                                <img src={portfolio[0].imageUrls[0]} className={`w-full aspect-video object-cover ${activeTheme.radius} shadow-2xl`} alt="About Us" />
                                            ) : (
                                                <div className={`w-full aspect-video bg-white/10 flex items-center justify-center ${activeTheme.radius} border-2 border-dashed border-white/30`}>
                                                    <p className="font-bold opacity-50">Portfolio Image</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                {/* Testimonials */}
                                <section className="py-20 px-8">
                                    <h2 className="text-3xl font-bold text-center mb-12">What Clients Say</h2>
                                    <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                                        {content.testimonials.map((t, i) => (
                                            <div key={i} className={`p-8 ${theme === 'industrial' ? 'bg-yellow-50' : 'bg-white shadow-sm'} border ${activeTheme.radius}`}>
                                                <div className="flex text-yellow-400 mb-4">★★★★★</div>
                                                <p className="text-lg italic mb-4 opacity-80">"{t.text}"</p>
                                                <p className="font-bold">— {t.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Footer */}
                                <footer className="bg-black text-white py-12 px-8 text-center">
                                    <h2 className="text-2xl font-bold mb-8">{user.name}</h2>
                                    <div className="flex justify-center gap-6 mb-8 text-sm opacity-70">
                                        {user.contact?.email && <span>{user.contact.email}</span>}
                                        {user.contact?.phone && <span>{user.contact.phone}</span>}
                                    </div>
                                    <p className="text-xs opacity-40">&copy; {new Date().getFullYear()} {user.name}. Powered by StockLink.</p>
                                </footer>

                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default WebsitePreviewModal;
