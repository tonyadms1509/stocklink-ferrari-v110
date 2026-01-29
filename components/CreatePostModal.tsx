
import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { PostType } from '../types';
import { XMarkIcon, SparklesIcon, PhotoIcon } from '@heroicons/react/24/solid';
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
            const prompt = `Analyze this post for a construction community and suggest 3-5 relevant hashtags. Return a JSON array of strings (e.g. ["Plumbing", "DIY"]). Post content: "${content}"`;
            
            const responseSchema = {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: 'application/json', responseSchema }
            });
            
            const suggestedTags = JSON.parse(response.text);
            // Merge unique tags
            setTags(prev => Array.from(new Set([...prev, ...suggestedTags])));

        } catch (e) {
            console.error("AI Tagging Error", e);
            showToast("Could not suggest tags.", 'error');
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
    
    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = e.currentTarget.value.trim();
            if(val && !tags.includes(val)) {
                setTags([...tags, val]);
                e.currentTarget.value = '';
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[70] p-4 animate-fade-in-scale">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full relative overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">{t('hubPostTitle')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6"/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('hubPostType')}</label>
                        <div className="flex gap-2">
                            {Object.values(PostType).map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setType(t)}
                                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${type === t ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
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
                            placeholder={t('hubPostContentPlaceholder')}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('hubPostImage')}</label>
                        <div className="flex items-center gap-2">
                             <PhotoIcon className="h-5 w-5 text-gray-400"/>
                             <input 
                                type="text" 
                                value={imageUrl} 
                                onChange={e => setImageUrl(e.target.value)} 
                                placeholder="https://..." 
                                className="flex-grow p-2 border rounded-md text-sm"
                             />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Tags</label>
                            <button 
                                type="button" 
                                onClick={handleSuggestTags} 
                                disabled={isTagging || !content}
                                className="text-xs flex items-center gap-1 text-purple-600 font-bold hover:text-purple-800 disabled:opacity-50"
                            >
                                <SparklesIcon className={`h-3 w-3 ${isTagging ? 'animate-spin' : ''}`}/>
                                {t('hubSuggestTags')}
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map(tag => (
                                <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                    #{tag}
                                    <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-500"><XMarkIcon className="h-3 w-3"/></button>
                                </span>
                            ))}
                        </div>
                        <input 
                            type="text" 
                            onKeyDown={handleAddTag}
                            placeholder={t('hubTagsPlaceholder') + " (Press Enter)"}
                            className="w-full p-2 border rounded-md text-sm"
                        />
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            className="w-full bg-secondary hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-colors"
                        >
                            {t('hubPostButton')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostModal;
