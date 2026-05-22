import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Calendar, ChevronRight, Clock, X } from 'lucide-react';

interface SavedStory {
    id: string;
    title: string;
    topic: string;
    content: string;
    language: string;
    createdAt: Timestamp;
}

interface MyStoriesProps {
    onNavigate: (page: any) => void;
}

const MyStories: React.FC<MyStoriesProps> = ({ onNavigate }) => {
    const { user } = useAuth();
    const [stories, setStories] = useState<SavedStory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStory, setSelectedStory] = useState<SavedStory | null>(null);
    const [toast, setToast] = useState('');

    useEffect(() => {
        if (!selectedStory) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedStory(null); };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [selectedStory]);

    const handleShare = async (story: SavedStory) => {
        const shareText = `${story.title}\n\n${story.content}\n\n— via FeelEd AI`;
        try {
            if (navigator.share) {
                await navigator.share({ title: story.title, text: shareText });
            } else {
                await navigator.clipboard.writeText(shareText);
                setToast('Story copied to clipboard ✓');
                setTimeout(() => setToast(''), 2000);
            }
        } catch { /* user cancelled */ }
    };

    useEffect(() => {
        if (!user) return;

        setLoading(true);
        // Simple query first to avoid index issues initially
        const q = query(
            collection(db, 'stories'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedStories: SavedStory[] = [];
            querySnapshot.forEach((doc) => {
                fetchedStories.push({ id: doc.id, ...doc.data() } as SavedStory);
            });
            setStories(fetchedStories);
            setLoading(false);
            setError(null);
        }, (err: any) => {
            console.error("Error fetching stories:", err);
            setError(err.message);
            setLoading(false);
            
            // If it's an index error, try a simpler query without orderBy
            if (err.code === 'failed-precondition') {
                const simpleQ = query(
                    collection(db, 'stories'),
                    where('userId', '==', user.uid)
                );
                onSnapshot(simpleQ, (snap) => {
                    const simpleStories: SavedStory[] = [];
                    snap.forEach((doc) => {
                        simpleStories.push({ id: doc.id, ...doc.data() } as SavedStory);
                    });
                    // Sort manually in memory as a fallback
                    simpleStories.sort((a, b) => {
                        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                        return timeB - timeA;
                    });
                    setStories(simpleStories);
                });
            }
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <BookOpen className="text-indigo-600" />
                    My Story Library
                </h2>
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                    {stories.length} Stories
                </span>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                    <p className="font-bold mb-1">Notice:</p>
                    <p>{error.includes('index') ? 'The library is being optimized. Your stories will appear shortly. Please try refreshing in a minute.' : error}</p>
                </div>
            )}

            {stories.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">No stories yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Generate your first story! 📖</p>
                    <button 
                        onClick={() => onNavigate('generator')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Create a Story
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {stories.map((story) => (
                        <button
                            key={story.id}
                            type="button"
                            onClick={() => setSelectedStory(story)}
                            className="text-left bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-600 hover:scale-[1.01] transition-all group cursor-pointer w-full"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                                        <span>{story.language}</span>
                                        <span className="text-slate-300 dark:text-slate-700">•</span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {story.createdAt?.toDate ? story.createdAt.toDate().toLocaleDateString() : 'Recently'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {story.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-500 mb-2">
                                        Topic: {story.topic}
                                    </p>
                                    {story.content && (
                                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2 text-sm mb-4">
                                            {story.content.slice(0, 120)}{story.content.length > 120 ? '…' : ''}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {story.createdAt?.toDate ? story.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                        <span className="font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                                            Read →
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors flex-shrink-0">
                                    <ChevronRight className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Story modal */}
            {selectedStory && (
                <div
                    onClick={() => setSelectedStory(null)}
                    className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6"
                    style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="relative w-full max-w-[700px] max-h-[90vh] bg-white dark:bg-[#0d0d1c] rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-indigo-900/40"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
                                    <span>{selectedStory.language}</span>
                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                    <span>{selectedStory.createdAt?.toDate ? selectedStory.createdAt.toDate().toLocaleDateString() : 'Recently'}</span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{selectedStory.title}</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Topic: {selectedStory.topic}</p>
                            </div>
                            <button
                                onClick={() => setSelectedStory(null)}
                                aria-label="Close"
                                className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {selectedStory.content ? (
                                <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                    {selectedStory.content}
                                </p>
                            ) : (
                                <p className="text-sm text-slate-500 dark:text-slate-500 italic">
                                    Story content unavailable for this entry.
                                </p>
                            )}
                        </div>

                        {/* Footer actions */}
                        <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                            <button
                                onClick={() => handleShare(selectedStory)}
                                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
                            >
                                🔗 Share
                            </button>
                            <button
                                onClick={() => setSelectedStory(null)}
                                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: '90px', left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#1a1040', border: '0.5px solid #4f46e5',
                    color: '#c4b5fd', padding: '10px 20px',
                    borderRadius: '12px', fontSize: '13px',
                    zIndex: 2000, boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
                }}>{toast}</div>
            )}
        </div>
    );
};

export default MyStories;
