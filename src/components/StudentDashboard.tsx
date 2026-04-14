import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { Book, School, GraduationCap, Heart, Save, Loader2, Award, Clock } from 'lucide-react';

const StudentDashboard: React.FC<{ onNavigate: (page: any) => void }> = ({ onNavigate }) => {
    const { user, userProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [stats, setStats] = useState({ totalStories: 0, recentStories: [] as any[] });
    
    // Profile form state
    const [formData, setFormData] = useState({
        displayName: userProfile?.displayName || '',
        standard: userProfile?.standard || '',
        school: userProfile?.school || '',
        interests: userProfile?.interests?.join(', ') || ''
    });

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            try {
                const q = query(collection(db, 'stories'), where('userId', '==', user.uid));
                const snapshot = await getDocs(q);
                
                const recentQ = query(
                    collection(db, 'stories'), 
                    where('userId', '==', user.uid),
                    orderBy('createdAt', 'desc'),
                    limit(3)
                );
                const recentSnapshot = await getDocs(recentQ);
                const recent = recentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                setStats({
                    totalStories: snapshot.size,
                    recentStories: recent
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };
        fetchStats();
    }, [user]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        setIsSaving(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                displayName: formData.displayName,
                standard: formData.standard,
                school: formData.school,
                interests: formData.interests.split(',').map((i: string) => i.trim()).filter((i: string) => i !== '')
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-600"></div>
                        <div className="px-6 pb-6">
                            <div className="relative -mt-16 mb-4">
                                <img 
                                    src={user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=student'} 
                                    alt="Profile" 
                                    className="w-32 h-32 rounded-2xl border-4 border-white dark:border-slate-900 shadow-lg object-cover bg-white"
                                />
                                <div className="absolute bottom-2 right-2 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900"></div>
                            </div>
                            
                            {!isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{userProfile?.displayName || user?.displayName}</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">{user?.email}</p>
                                    </div>
                                    
                                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                            <GraduationCap className="w-5 h-5 text-indigo-500" />
                                            <span>Standard: {userProfile?.standard || 'Not set'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                            <School className="w-5 h-5 text-indigo-500" />
                                            <span>School: {userProfile?.school || 'Not set'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                            <Heart className="w-5 h-5 text-indigo-500" />
                                            <span className="line-clamp-1">Interests: {userProfile?.interests?.join(', ') || 'Not set'}</span>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="w-full mt-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium py-2 rounded-xl transition-colors"
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSaveProfile} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</label>
                                        <input 
                                            type="text" 
                                            value={formData.displayName}
                                            onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Standard / Grade</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. 10th Standard"
                                            value={formData.standard}
                                            onChange={(e) => setFormData({...formData, standard: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">School Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. KV School"
                                            value={formData.school}
                                            onChange={(e) => setFormData({...formData, school: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Interests (comma separated)</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Science, Space, History"
                                            value={formData.interests}
                                            onChange={(e) => setFormData({...formData, interests: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button 
                                            type="submit" 
                                            disabled={isSaving}
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-xl flex items-center justify-center gap-2"
                                        >
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Save
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats & Activity */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl">
                                    <Book className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Stories Created</p>
                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalStories}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl">
                                    <Award className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Current Level</p>
                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                                        {stats.totalStories > 10 ? 'Explorer' : stats.totalStories > 0 ? 'Novice' : 'Beginner'}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-500" />
                                Recent Pedagogical Journeys
                            </h3>
                            <button 
                                onClick={() => onNavigate('my-stories')}
                                className="text-indigo-600 text-sm font-semibold hover:underline"
                            >
                                View All
                            </button>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {stats.recentStories.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-slate-500 dark:text-slate-400">No stories yet. Start your first journey!</p>
                                    <button 
                                        onClick={() => onNavigate('generator')}
                                        className="mt-4 text-indigo-600 font-semibold"
                                    >
                                        Create Story →
                                    </button>
                                </div>
                            ) : (
                                stats.recentStories.map((story) => (
                                    <div key={story.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-slate-900 dark:text-white">{story.title}</h4>
                                            <span className="text-xs text-slate-400">
                                                {story.createdAt?.toDate().toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">Topic: {story.topic}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 text-[10px] font-bold rounded uppercase tracking-wider">
                                                {story.language}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Action */}
                    <div className="bg-indigo-600 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-indigo-200 dark:shadow-none">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Ready for a new lesson?</h3>
                            <p className="text-indigo-100">Turn any complex topic into an emotional story in seconds.</p>
                        </div>
                        <button 
                            onClick={() => onNavigate('generator')}
                            className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors whitespace-nowrap"
                        >
                            Start Generating
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
