import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useAuth } from '../../hooks/useAuth';
import { useLocalization } from '../../hooks/useLocalization';
import { CommunityPost, PostType } from '../../types';
import { 
    PlusIcon, 
    UserCircleIcon, 
    HeartIcon, 
    ChatBubbleLeftIcon, 
    SparklesIcon,
    MagnifyingGlassIcon,
    ArrowLeftIcon,
    MegaphoneIcon,
    FireIcon,
    RadioIcon,
    SignalIcon,
    PaperAirplaneIcon,
    TrophyIcon
} from '@heroicons/react/24/solid';
import CreatePostModal from '../../components/CreatePostModal';
import { GoogleGenAI } from '@google/genai';
import EmptyState from '../../components/EmptyState';
import { createCommunityPostInDb, likePostInDb, addCommentToPostInDb } from '../../services/mockApi';

const PostCard: React.FC<{ post: CommunityPost, currentUserId: string }> = ({ post, currentUserId }) => {
    const { t } = useLocalization();
    const [liked, setLiked] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');

    const handleLike = () => {
        if(!liked) {
            setLiked(true);
            likePostInDb(post.id);
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!newComment.trim()) return;
        await addCommentToPostInDb(post.id, { authorName: 'Me', text: newComment });
        setNewComment('');
    };

    return (
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-8 mb-8 hover:shadow-2xl transition-all duration-700 relative overflow-hidden group">
            <div className={`absolute top-0 left-0 w-1.5 h-full transition-all ${post.type === PostType.Question ? 'bg-red-600' : post.type === PostType.Marketplace ? 'bg-emerald-500' : 'bg-blue-600'}`}></div>
            
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-5">
                     <div className="relative">
                        <img 
                            src={post.authorLogo || `https://ui-avatars.com/api/?name=${post.authorName}&background=random&color=fff`} 
                            className="w-14 h-14 rounded-2xl object-cover border-4 border-white shadow-xl bg-slate-100"
                            alt=""
                        />
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
                     </div>
                     <div className="text-left">
                         <p className="font-black text-slate-900 text-lg italic uppercase tracking-tighter hover:text-blue-600 transition-colors">{post.authorName}</p>
                         <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            <span>{post.timestamp.toLocaleDateString()}</span>
                            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                            <span className={`italic underline decoration-2 underline-offset-4 ${
                                post.type === PostType.Question ? 'decoration-red-600 text-red-600' : 
                                post.type === PostType.Marketplace ? 'decoration-emerald-500 text-emerald-600' : 
                                'decoration-blue-600 text-blue-600'
                            }`}>
                                {post.type}
                            </span>
                         </div>
                     </div>
                </div>
            </div>

            <div className="mb-8 text-left">
                <p className="text-slate-800 text-lg font-medium italic leading-relaxed whitespace-pre-wrap font-serif">"{post.content}"</p>
            </div>
            
            {post.imageUrl && (
                <div className="mb-8 rounded-[2rem] overflow-hidden border border-slate-100 shadow-2xl relative group/img">
                    <img src={post.imageUrl} alt="" className="w-full h-auto max-h-[500px] object-cover grayscale group-hover/img:grayscale-0 transition-all duration-1000"/>
                    <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover/img:opacity-100 transition-opacity"></div>
                </div>
            )}

            {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8 text-left">
                    {post.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-black text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 hover:border-blue-500/40 cursor-pointer transition-all">
                            #{tag.toUpperCase()}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                <div className="flex gap-4">
                    <button 
                        onClick={handleLike}
                        className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all p-3 rounded-2xl hover:bg-red-50 ${liked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}
                    >
                        <HeartIcon className={`h-6 w-6 ${liked ? 'fill-current shadow-[0_0_15px_rgba(239,68,68,0.5)]' : ''}`}/> 
                        <span>{post.likes + (liked ? 1 : 0)} Sentiment</span>
                    </button>
                     <button 
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-3 rounded-2xl transition-all"
                    >
                        <ChatBubbleLeftIcon className="h-6 w-6"/> 
                        <span>{post.comments.length} Entries</span>
                    </button>
                </div>
                <div className="p-3 bg-white/5 border border-slate-100 rounded-2xl shadow-inner">
                    <SparklesIcon className="h-5 w-5 text-blue-500 animate-pulse"/>
                </div>
            </div>

            {showComments && (
                <div className="mt-8 pt-8 border-t border-slate-100 animate-fade-in-up space-y-6">
                    <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar pr-4 text-left">
                        {post.comments.map(comment => (
                            <div key={comment.id} className={`p-6 rounded-[2rem] border ${comment.isAiExpert ? 'bg-blue-600/5 border-blue-500/20' : 'bg-slate-50 border-slate-200 shadow-inner'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`font-black text-xs uppercase tracking-tight flex items-center gap-2 ${comment.isAiExpert ? 'text-blue-600' : 'text-slate-900'}`}>
                                        {comment.isAiExpert && <SparklesIcon className="h-4 w-4 animate-pulse"/>}
                                        {comment.authorName}
                                    </span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">{comment.timestamp.toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-slate-700 italic font-medium leading-relaxed">"{comment.text}"</p>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleComment} className="flex gap-4 items-center relative group">
                        <input 
                            type="text" 
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            placeholder="Add to the technical discussion..." 
                            className="flex-grow p-5 pl-8 pr-20 text-sm border-2 border-slate-100 rounded-[2rem] bg-white focus:border-blue-600 outline-none transition-all italic font-medium shadow-inner"
                        />
                        <button type="submit" className="absolute right-3 p-3 bg-slate-950 text-white rounded-2xl hover:bg-black disabled:opacity-30 transition-all transform active:scale-95 shadow-xl" disabled={!newComment.trim()}>
                             <PaperAirplaneIcon className="h-5 w-5 -rotate-90 translate-x-0.5"/>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

const BuildersHubPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { t } = useLocalization();
    const { user } = useAuth();
    const { communityPosts = [] } = useData();
    const [filter, setFilter] = useState<'All' | PostType>('All');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPosts = useMemo(() => {
        let posts = Array.isArray(communityPosts) ? [...communityPosts] : [];
        if (filter !== 'All') posts = posts.filter(p => p.type === filter);
        if (searchTerm) {
            const query = searchTerm.toLowerCase();
            posts = posts.filter(p => 
                p.content.toLowerCase().includes(query) || 
                p.tags.some(t => t.toLowerCase().includes(query))
            );
        }
        return posts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }, [communityPosts, filter, searchTerm]);

    const handleCreatePost = async (content: string, type: PostType, tags: string[], imageUrl?: string) => {
        if (!user) return;
        const newPost = await createCommunityPostInDb({ authorId: user.id, authorName: user.name, authorLogo: user.companyLogoUrl, content, type, tags, imageUrl });
        
        if (type === PostType.Question && process.env.API_KEY) {
             try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({ 
                    model: 'gemini-3-flash-preview', 
                    contents: `You are an expert South African structural engineer. Provide technical advice for: "${content}"` 
                });
                await addCommentToPostInDb(newPost.id, { authorName: "Grid Expert AI", text: response.text.trim(), isAiExpert: true });
             } catch (e) {
                 console.error("AI commentary failure", e);
             }
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-50/50 min-h-screen -m-12 p-12 pb-32 font-sans selection:bg-blue-600/20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8 max-w-7xl mx-auto w-full">
                 <div className="text-left">
                    <div className="flex items-center gap-3 mb-4">
                        <SignalIcon className="h-8 w-8 text-blue-600 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400">National Builders Hub Core v62</span>
                    </div>
                    <h2 className="text-7xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">THE <span className="text-blue-600">COLLECTIVE</span></h2>
                    <p className="text-gray-500 mt-4 font-medium text-lg italic">"A high-fidelity social grid for South African construction professionals."</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="relative group min-w-[300px]">
                        <MagnifyingGlassIcon className="h-6 w-6 text-slate-300 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 transition-colors"/>
                        <input 
                            type="text" 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            placeholder="Intercept Discussion Nodes..." 
                            className="w-full pl-14 pr-4 py-4 bg-white border-2 border-slate-100 rounded-[2rem] text-sm font-bold shadow-sm outline-none focus:border-blue-600 transition-all italic"
                        />
                    </div>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)} 
                        className="bg-slate-950 hover:bg-black text-white font-black py-5 px-10 rounded-3xl flex items-center justify-center gap-4 shadow-2xl transition-all transform active:scale-95 uppercase text-xs tracking-widest border-4 border-slate-800"
                    >
                        <PlusIcon className="h-5 w-5 text-blue-400"/>
                        Initialize Transmission
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-7xl mx-auto w-full">
                <div className="lg:col-span-3 space-y-4 sticky top-24 hidden lg:block text-left">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-6 border-b border-slate-200 pb-2 ml-4">Protocol Filter</h3>
                    <div className="space-y-2">
                        {['All', ...Object.values(PostType)].map(f => (
                            <button 
                                key={f} 
                                onClick={() => setFilter(f as any)} 
                                className={`w-full text-left px-8 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-between group ${filter === f ? 'bg-white text-blue-600 shadow-xl border border-slate-100 translate-x-4 scale-105' : 'text-slate-400 hover:text-slate-900 hover:bg-white/50'}`}
                            >
                                <span>{f}</span>
                                {filter === f && <RadioIcon className="h-4 w-4 animate-pulse"/>}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="lg:col-span-6 w-full">
                    {filteredPosts.length === 0 ? (
                        <EmptyState icon={MegaphoneIcon} title="GRID IDLE" message="Neural Core scanning for relevant transmissions. Standby." />
                    ) : (
                        <div className="space-y-4">
                            {filteredPosts.map(post => <PostCard key={post.id} post={post} currentUserId={user?.id || ''} />)}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-3 space-y-8 sticky top-24 hidden lg:block text-left">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8">
                        <h4 className="font-black text-slate-900 uppercase italic text-lg mb-8 flex items-center gap-3">
                            <FireIcon className="h-6 w-6 text-orange-600 animate-pulse"/> 
                            Node <span className="text-orange-600">Trends</span>
                        </h4>
                        <ul className="space-y-6 text-left">
                            {["#SANS_10400", "#SolarIncentives", "#GautengCement", "#NHBRC_2025"].map(t => (
                                <li key={t} className="text-xs font-black text-slate-500 uppercase tracking-widest hover:text-blue-600 cursor-pointer transition-all flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                    {t}
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group border border-white/5">
                        <div className="absolute inset-0 bg-carbon opacity-10"></div>
                        <h4 className="font-black italic uppercase tracking-tighter text-xl mb-4 relative z-10 flex items-center gap-3 text-left">
                            <TrophyIcon className="h-6 w-6 text-yellow-400"/>
                            Leaderboard
                        </h4>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-6 relative z-10 text-left">Top Verified Nodes</p>
                        <div className="space-y-4 relative z-10">
                            {[1,2,3].map(i => (
                                <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-default">
                                    <span className="text-[10px] font-black text-slate-400">0{i} NODE_ELITE</span>
                                    <div className="w-6 h-1 bg-blue-600 rounded-full"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {isCreateModalOpen && <CreatePostModal onClose={() => setIsCreateModalOpen(false)} onPost={handleCreatePost} />}
        </div>
    );
};

export default BuildersHubPage;