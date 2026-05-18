import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Book, School, GraduationCap, Heart, Save, Loader2, Award, Target, TrendingUp, Activity, Flame, BookOpen, MessageSquare } from 'lucide-react';

interface ActivityLog {
    id: string;
    type: string;
    topic: string;
    subject: string;
    createdAt: any;
}

interface PracticeScore {
    id: string;
    topic: string;
    subject: string;
    score: number;
    total: number;
    createdAt: any;
}

const StudentDashboard: React.FC<{ onNavigate: (page: any) => void }> = ({ onNavigate }) => {
    const { user, userProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [scores, setScores] = useState<PracticeScore[]>([]);
    const [storiesCount, setStoriesCount] = useState(0);
    const [chatSessionsCount, setChatSessionsCount] = useState(0);
    const [mockTestCount, setMockTestCount] = useState(0);
    const [isLoadingData, setIsLoadingData] = useState(true);
    
    // Profile form state
    const [formData, setFormData] = useState({
        displayName: userProfile?.displayName || '',
        standard: userProfile?.standard || '',
        school: userProfile?.school || '',
        interests: userProfile?.interests?.join(', ') || ''
    });

    useEffect(() => {
        if (userProfile) {
            setFormData({
                displayName: userProfile.displayName || '',
                standard: userProfile.standard || '',
                school: userProfile.school || '',
                interests: userProfile.interests?.join(', ') || ''
            });
        }
    }, [userProfile]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;
            try {
                // Fetch recent activities
                const activityQ = query(collection(db, 'study_activity'), where('userId', '==', user.uid));
                const activitySnap = await getDocs(activityQ);
                const fetchedActivities: ActivityLog[] = [];
                activitySnap.forEach(doc => fetchedActivities.push({ id: doc.id, ...doc.data() } as ActivityLog));
                fetchedActivities.sort((a, b) => {
                    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                    return timeB - timeA;
                });
                setActivities(fetchedActivities.slice(0, 5));

                // Fetch recent scores
                const scoreQ = query(collection(db, 'practice_scores'), where('userId', '==', user.uid));
                const scoreSnap = await getDocs(scoreQ);
                const fetchedScores: PracticeScore[] = [];
                scoreSnap.forEach(doc => fetchedScores.push({ id: doc.id, ...doc.data() } as PracticeScore));
                fetchedScores.sort((a, b) => {
                    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                    return timeB - timeA;
                });
                setScores(fetchedScores.slice(0, 5));

                // Count stories
                const storiesQ = query(collection(db, 'stories'), where('userId', '==', user.uid));
                const storiesSnap = await getDocs(storiesQ);
                setStoriesCount(storiesSnap.size);

                // Count chat sessions
                const chatsQ = query(collection(db, 'chat_sessions'), where('userId', '==', user.uid));
                const chatsSnap = await getDocs(chatsQ);
                setChatSessionsCount(chatsSnap.size);

                // Count mock tests
                const mockTestQ = query(collection(db, 'practice_scores'), where('userId', '==', user.uid), where('examType', '==', 'mock-test'));
                const mockTestSnap = await getDocs(mockTestQ);
                setMockTestCount(mockTestSnap.size);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchDashboardData();
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-2xl text-indigo-600 dark:text-indigo-400">
                        <GraduationCap className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Student Dashboard</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Track your progress and manage your profile</p>
                    </div>
                </div>
                <button 
                    onClick={() => onNavigate('home')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-bold transition-colors shadow-lg"
                >
                    Start Studying
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-xl text-blue-600 dark:text-blue-400 flex-shrink-0">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Topics Studied</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{isLoadingData ? '…' : activities.length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Chat Sessions</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{isLoadingData ? '…' : chatSessionsCount}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-xl text-purple-600 dark:text-purple-400 flex-shrink-0">
                        <Book className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Stories Made</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{isLoadingData ? '…' : storiesCount}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-xl text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Avg. Score</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                            {isLoadingData ? '…' : scores.length > 0
                                ? Math.round((scores.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / scores.length) * 100) + '%'
                                : 'N/A'}
                        </p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                    <div className="bg-orange-100 dark:bg-orange-900/50 p-3 rounded-xl text-orange-600 dark:text-orange-400 flex-shrink-0">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Mock Tests</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{isLoadingData ? '…' : mockTestCount}</p>
                    </div>
                </div>
            </div>

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
                    
                    {/* Recent Practice Scores */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                            <Award className="w-6 h-6 text-emerald-600" />
                            Recent Practice Scores
                        </h2>
                        {isLoadingData ? (
                            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                        ) : scores.length > 0 ? (
                            <div className="space-y-4">
                                {scores.map((score) => (
                                    <div key={score.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{score.topic}</p>
                                            <p className="text-xs text-slate-500">{score.subject}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-black rounded-full">
                                                {score.score} / {score.total}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <p>No practice tests taken yet.</p>
                                <button onClick={() => onNavigate('home')} className="text-indigo-600 font-bold mt-2 hover:underline">Start a practice test</button>
                            </div>
                        )}
                    </div>

                    {/* Study History */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                            <Activity className="w-6 h-6 text-blue-600" />
                            Recently Studied Topics
                        </h2>
                        {isLoadingData ? (
                            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                        ) : activities.length > 0 ? (
                            <div className="space-y-4">
                                {activities.map((activity) => (
                                    <div key={activity.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className={`p-2 rounded-lg ${activity.type === 'exam' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {activity.type === 'exam' ? <Flame className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{activity.topic}</p>
                                            <p className="text-xs text-slate-500">{activity.subject} • {activity.type === 'exam' ? 'Exam Prep' : 'Concept Learning'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <p>No topics studied yet.</p>
                                <button onClick={() => onNavigate('home')} className="text-indigo-600 font-bold mt-2 hover:underline">Ask a question</button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
