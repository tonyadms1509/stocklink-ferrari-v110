
import React, { useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { useLocalization } from '../../hooks/useLocalization';
import { useAuth } from '../../hooks/useAuth';
import { MegaphoneIcon, SparklesIcon, ClipboardDocumentIcon, DocumentArrowDownIcon, DevicePhoneMobileIcon, GlobeAltIcon, PhotoIcon } from '@heroicons/react/24/solid';
import { useToast } from '../../hooks/useToast';

const SocialPostPreview: React.FC<{ content: string, image?: string, platform: 'instagram' | 'facebook' | 'twitter', authorName: string }> = ({ content, image, platform, authorName }) => {
    return (
        <div className="mx-auto w-[320px] bg-white rounded-[30px] border-[8px] border-gray-800 shadow-2xl overflow-hidden h-[600px] relative flex flex-col">
            {/* Phone Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-gray-800 rounded-b-xl z-20"></div>
            
            {/* Status Bar */}
            <div className="h-8 bg-gray-100 w-full shrink-0"></div>

            {/* App Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${platform === 'instagram' ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600' : platform === 'facebook' ? 'bg-blue-600' : 'bg-sky-500'}`}>
                    {authorName.charAt(0)}
                 </div>
                 <span className="text-sm font-bold text-gray-800">{authorName}</span>
            </div>

            {/* Content Area */}
            <div className="flex-grow overflow-y-auto bg-white">
                {image ? (
                    <img src={image} alt="Post" className="w-full aspect-square object-cover bg-gray-100"/>
                ) : (
                    <div className="w-full aspect-square bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                        <PhotoIcon className="h-12 w-12 mb-2 opacity-50"/>
                        <span className="text-xs font-medium">Image Preview</span>
                    </div>
                )}
                
                <div className="p-4">
                    <div className="flex gap-3 mb-2">
                         <div className="h-6 w-6 rounded-full bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center"><span className="sr-only">Like</span>♥</div>
                         <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center"></div>
                         <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center"></div>
                    </div>
                    <p className="text-xs text-gray-800 leading-relaxed">
                        <span className="font-bold mr-1">{authorName}</span>
                        {content || <span className="text-gray-400 italic">Your caption will appear here...</span>}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2 uppercase">2 hours ago</p>
                </div>
            </div>
        </div>
    )
}

const MarketingAssistantPage: React.FC = () => {
    const { t } = useLocalization();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [goal, setGoal] = useState(t('marketingAIGoalSale'));
    const [description, setDescription] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [generatedImage, setGeneratedImage] = useState('');
    const [isTextLoading, setIsTextLoading] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [platform, setPlatform] = useState<'instagram' | 'facebook' | 'twitter'>('instagram');

    const goals = [
        t('marketingAIGoalSale'),
        t('marketingAIGoalProduct'),
        t('marketingAIGoalReEngage'),
    ];

    const handleGenerateText = async () => {
        if (!description.trim() || !process.env.API_KEY) return;
        setIsTextLoading(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = `You are a social media manager for a construction supplier. Write a caption for ${platform}. Goal: ${goal}. Keep it engaging, professional, and use appropriate emojis/hashtags.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: description,
                config: { systemInstruction }
            });
            setGeneratedContent(response.text.trim());
        } catch (err) {
            console.error(err);
            setError("Failed to generate text.");
        } finally {
            setIsTextLoading(false);
        }
    };

    const handleGenerateImage = async () => {
        if (!description.trim() || !process.env.API_KEY) return;
        setIsImageLoading(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image', // Or appropriate imagen model if available
                contents: { parts: [{ text: `Professional product photography for construction marketing: ${description}` }] },
                config: { responseModalities: [Modality.IMAGE] }
            });
            
            const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64) setGeneratedImage(`data:image/png;base64,${base64}`);
            else throw new Error("No image returned");

        } catch (err) {
            console.error(err);
            setError("Failed to generate image.");
        } finally {
            setIsImageLoading(false);
        }
    };
    
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(generatedContent);
        showToast('Caption copied!', 'info');
    };

    return (
        <div className="h-full flex flex-col">
            <div className="mb-8">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                    <MegaphoneIcon className="h-8 w-8 text-primary"/> {t('marketingAITitle')}
                </h2>
                <p className="text-gray-600 mt-1">{t('marketingAIDescription')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left Column: Studio Controls */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-8">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <SparklesIcon className="h-5 w-5 text-accent"/> Creative Brief
                        </h3>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Platform</label>
                                <div className="flex gap-2">
                                    {['instagram', 'facebook', 'twitter'].map(p => (
                                        <button 
                                            key={p}
                                            onClick={() => setPlatform(p as any)}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${platform === p ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('marketingAIGoal')}</label>
                                <select value={goal} onChange={e => setGoal(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-shadow">
                                    {goals.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('marketingAIDescribe')}</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={t('marketingAIPlaceholder')}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-shadow h-32 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={handleGenerateText}
                            disabled={isTextLoading || !description.trim()}
                            className="flex flex-col items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-4 rounded-xl transition-colors border border-blue-200 disabled:opacity-50"
                        >
                            {isTextLoading ? <div className="animate-spin h-6 w-6 border-2 border-blue-600 rounded-full border-t-transparent"></div> : <ClipboardDocumentIcon className="h-6 w-6" />}
                            Generate Copy
                        </button>
                        <button
                            onClick={handleGenerateImage}
                            disabled={isImageLoading || !description.trim()}
                            className="flex flex-col items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold py-4 rounded-xl transition-colors border border-purple-200 disabled:opacity-50"
                        >
                            {isImageLoading ? <div className="animate-spin h-6 w-6 border-2 border-purple-600 rounded-full border-t-transparent"></div> : <PhotoIcon className="h-6 w-6" />}
                            Generate Image
                        </button>
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</p>}

                    {generatedContent && (
                        <div className="bg-gray-900 text-gray-300 p-4 rounded-xl font-mono text-xs relative group">
                            <button onClick={handleCopyToClipboard} className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <ClipboardDocumentIcon className="h-4 w-4"/>
                            </button>
                            <div className="whitespace-pre-wrap">{generatedContent}</div>
                        </div>
                    )}
                </div>

                {/* Right Column: Live Preview */}
                <div className="flex flex-col items-center justify-center bg-gray-100 rounded-2xl border border-gray-200 p-8 min-h-[700px]">
                    <h3 className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-6">Live Preview</h3>
                    <SocialPostPreview 
                        content={generatedContent} 
                        image={generatedImage} 
                        platform={platform}
                        authorName={user?.name || 'My Store'}
                    />
                </div>
            </div>
        </div>
    );
};

export default MarketingAssistantPage;
