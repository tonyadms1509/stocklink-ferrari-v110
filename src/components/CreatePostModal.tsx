import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { PostType } from '../types';
import { XMarkIcon, SparklesIcon, PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI, Type } from '@google/genai';
import { useToast } from '../hooks/useToast';

interface CreatePostModalProps {
    onClose: () => void;
    onPost: (content: string, type: PostType, tags: string[], imageUrl?: string) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose, onPost }) => {
    const { t } = useLocalization();
    const { showToast } = useToast();
    const [content, setContent] = useState('');
    const [type, setType] = useState<PostType>(PostType.Showcase);
    const [tags, setTags] = useState<string[]>([]);
    const [imageUrl, setImageUrl] = useState('');
    const [isTagging, setIsTagging] = useState(false);

    const handleSuggestTags = async () => {
        if (!content.trim() || !process.env.API_KEY) return;
        setIsTagging(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Analyze this construction post and suggest 4 relevant hashtags for the national grid. Return a JSON array of strings. Content: "${content}"`;
            
            const responseSchema = {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: { responseMimeType: 'application/json', responseSchema }
            });
            
            const suggestedTags = JSON.parse(response.text || '[]');
            setTags(prev => Array.from(new Set([...prev, ...suggestedTags])));
            showToast("Neural Tags Synchronized", "info");
        } catch (e) {
            console.error(e);
        } finally {
            setIsTagging(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            onPost(content, type, tags, imageUrl);
            onClose();
        }
    };
    
    return (
        <div className="fixed inset-0 bg-slate-950/90 z-[140] flex items-center justify-center p-4 animate-fade-in backdrop-blur-md">
            <div className="bg-white rounded-[3rem] shadow-2xl max-w-xl w-full relative overflow-hidden border border-white/20">
                <div className="p-6 border-b bg-slate-50 flex justify-between items-center text-left">
                    <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">Broadcasting <span className="text-blue-600">Signal</span></h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900"><XMarkIcon className="h-6 w-6"/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-10 space-y-6 text-left">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Transmission Class</label>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.values(PostType).map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`p-3 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${type === t ? 'bg-blue-600 border-blue-500 text-white shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-500/20'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Share site telemetry, technical inquiries, or inventory surplus..."
                            className="w-full p-6 border-2 border-slate-100 rounded-3xl bg-slate-50 focus:border-blue-600 outline-none text-sm min-h-[150px] resize-none font-medium italic"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Visual Packet URL (Optional)</label>
                        <div className="relative group">
                             <PhotoIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300"/>
                             <input 
                                type="text" 
                                value={imageUrl} 
                                onChange={e => setImageUrl(e.target.value)} 
                                placeholder="https://picsum.photos/..." 
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-mono focus:border-blue-600 outline-none"
                             />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">Metadata Tags</label>
                            <button 
                                type="button" 
                                onClick={handleSuggestTags} 
                                disabled={isTagging || !content}
                                className="text-[10px] flex items-center gap-2 text-blue-600 font-black uppercase hover:text-blue-800 disabled:opacity-30"
                            >
                                {isTagging ? <ArrowPathIcon className="h-3 w-3 animate-spin"/> : <SparklesIcon className="h-3 w-3" />}
                                Optimize for Grid
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4 min-h-[40px] p-2 bg-slate-50 rounded-2xl border border-slate-100">
                            {tags.map(tag => (
                                <span key={tag} className="bg-white border border-slate-200 text-slate-600 text-[9px] font-black uppercase px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm">
                                    #{tag}
                                    <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="text-red-400 hover:text-red-600"><XMarkIcon className="h-3 w-3"/></button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-slate-900 hover:bg-black text-white font-black py-6 rounded-[2.5rem] uppercase tracking-[0.4em] text-xs transition-all shadow-2xl transform active:scale-95 border-4 border-slate-950"
                    >
                        Commit to Hub
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePostModal;