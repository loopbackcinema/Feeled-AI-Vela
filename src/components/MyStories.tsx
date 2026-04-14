import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Calendar, ChevronRight, Clock } from 'lucide-react';

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
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Start your pedagogical journey by creating your first story!</p>
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
                        <div 
                            key={story.id}
                            className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 uppercase tracking-wider mb-2">
                                        <span>{story.language}</span>
                                        <span className="text-slate-300">•</span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {story.createdAt?.toDate ? story.createdAt.toDate().toLocaleDateString() : 'Recently'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">
                                        {story.title}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 line-clamp-2 text-sm mb-4">
                                        Topic: {story.topic}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {story.createdAt?.toDate ? story.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                                    <ChevronRight className="text-slate-400 group-hover:text-indigo-600" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyStories;
