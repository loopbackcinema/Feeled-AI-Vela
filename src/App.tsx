import React, { useState, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HomeScreen from './components/HomeScreen';
import AnswerScreen from './components/AnswerScreen';
import PracticeScreen from './components/PracticeScreen';
import ExamModeScreen from './components/ExamModeScreen';
import { generateStory, generateVoice, generateImage, generateConcept, generatePractice, generateExamPrep } from './services/geminiService';
import { StoryRequest, Page, StudentContext } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import StoryGeneratorForm from './components/StoryGeneratorForm';
import StoryDisplay from './components/StoryDisplay';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Founder from './pages/Founder';
import Research from './pages/Research';
import PilotProgram from './pages/PilotProgram';
import InclusiveResearch from './pages/InclusiveResearch';
import Teachers from './pages/Teachers';
import Parents from './pages/Parents';
import MyStories from './components/MyStories';
import StudentDashboard from './components/StudentDashboard';
import { useAuth } from './context/AuthContext';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useStudentStore } from './stores/studentStore';
import { useSessionStore } from './stores/sessionStore';

const PAGE_TO_PATH: Record<Page, string> = {
    home: '/',
    answer: '/chat',
    story: '/story',
    generator: '/generator',
    exam: '/exam',
    practice: '/practice',
    'student-dashboard': '/dashboard',
    'my-stories': '/my-stories',
    about: '/about',
    teachers: '/teachers',
    parents: '/parents',
    research: '/research',
    pilot: '/pilot',
    contact: '/contact',
    founder: '/founder',
    privacy: '/privacy',
    inclusive: '/inclusive',
    'admin-dashboard': '/admin',
};

const App: React.FC = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    // Global stores
    const { board, standard, subject, language, learningMode, goal, setContext } = useStudentStore();
    const studentContext: StudentContext = { board, standard, subject, language, learningMode, goal };
    const setSession = useSessionStore(state => state.set);
    const {
        currentQuestion,
        conceptData,
        practiceData,
        examData,
        generatedStory,
        base64Audio,
        base64Image,
        imageMimeType,
        lastLanguage,
    } = useSessionStore();

    // UI-only state stays local
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
    const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const navigateTo = useCallback((page: Page) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate(PAGE_TO_PATH[page]);
    }, [navigate]);

    const handleGenerateStory = useCallback(async (request: StoryRequest) => {
        if (!user) {
            setError('Please log in to generate stories.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSession({ generatedStory: null, base64Audio: null, base64Image: null, imageMimeType: null, lastLanguage: request.language });

        try {
            const { story } = await generateStory(request);
            setSession({ generatedStory: story });
            navigate('/story');
            setIsLoading(false);

            try {
                await addDoc(collection(db, 'stories'), {
                    userId: user.uid,
                    userEmail: user.email || (user as any).email || 'No Email',
                    title: story.title,
                    content: `${story.introduction}\n\n${story.concept_explanation}\n\n${story.resolution}`,
                    language: request.language,
                    topic: request.topic,
                    createdAt: serverTimestamp()
                });
            } catch (e) {
                console.error("Failed to save story to Firestore:", e);
            }

            setIsAudioLoading(true);
            setIsImageLoading(true);

            generateVoice(story, request)
                .then(({ base64Audio }) => setSession({ base64Audio }))
                .catch((e) => console.error("Audio synthesis failed:", e))
                .finally(() => setIsAudioLoading(false));

            generateImage(story)
                .then(({ base64Image, mimeType }) => setSession({ base64Image, imageMimeType: mimeType }))
                .catch((e) => console.error("Visual synthesis failed:", e))
                .finally(() => setIsImageLoading(false));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during pedagogical synthesis.');
            setIsLoading(false);
        }
    }, [user, navigate, setSession]);

    const handleTryAnother = () => {
        setSession({ generatedStory: null, base64Audio: null, base64Image: null, imageMimeType: null });
        navigate('/generator');
    };

    const logStudyActivity = async (type: string, topic: string, subject: string) => {
        if (!user) return;
        try {
            await addDoc(collection(db, 'study_activity'), {
                userId: user.uid,
                type,
                topic,
                subject,
                createdAt: serverTimestamp()
            });
        } catch (e) {
            console.error("Failed to log study activity:", e);
        }
    };

    const formatError = (err: any): string => {
        if (typeof err === 'string') return err;
        if (err.message) {
            try {
                const parsed = JSON.parse(err.message);
                if (parsed.error && parsed.error.message) return parsed.error.message;
            } catch (e) {
                // not JSON
            }
            return err.message;
        }
        return 'An unexpected error occurred.';
    };

    const handleAskQuestion = async (question: string, context: StudentContext) => {
        setIsLoading(true);
        setError(null);
        setSession({ currentQuestion: question, base64Image: null, imageMimeType: null });
        setContext(context);

        try {
            const data = await generateConcept(question, context);
            setSession({ conceptData: data });
            navigate('/chat');
            await logStudyActivity('concept', question, context.subject);

            if (context.learningMode === 'Junior') {
                setIsImageLoading(true);
                generateImage({
                    title: question,
                    introduction: data.simpleExplanation,
                    concept_explanation: '',
                    resolution: ''
                } as any)
                    .then(({ base64Image, mimeType }) => setSession({ base64Image, imageMimeType: mimeType }))
                    .catch(e => console.error("Visual synthesis failed:", e))
                    .finally(() => setIsImageLoading(false));
            }
        } catch (err: any) {
            setError(formatError(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartPractice = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await generatePractice(currentQuestion, studentContext);
            setSession({ practiceData: data });
            navigate('/practice');
        } catch (err: any) {
            setError(formatError(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleExamMode = async (topic: string, context: StudentContext) => {
        setIsLoading(true);
        setError(null);
        setContext(context);
        try {
            const data = await generateExamPrep(topic, context);
            setSession({ examData: data });
            navigate('/exam');
            await logStudyActivity('exam', topic, context.subject);
        } catch (err: any) {
            setError(formatError(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleLearnWithStory = () => navigate('/generator');

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-slate-950">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">Initializing pedagogical environment...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 md:py-16 max-w-7xl">
                <Routes>
                    <Route path="/" element={
                        <HomeScreen onAskQuestion={handleAskQuestion} onExamMode={handleExamMode} onLearnWithStory={handleLearnWithStory} isLoading={isLoading} error={error} />
                    } />
                    <Route path="/chat" element={
                        conceptData
                            ? <AnswerScreen concept={conceptData} question={currentQuestion} context={studentContext} onBack={() => navigate('/')} onPractice={handleStartPractice} onStory={handleLearnWithStory} base64Image={base64Image} imageMimeType={imageMimeType} isImageLoading={isImageLoading} />
                            : <Navigate to="/" />
                    } />
                    <Route path="/story" element={
                        generatedStory
                            ? <StoryDisplay story={generatedStory} language={lastLanguage} base64Audio={base64Audio} isAudioLoading={isAudioLoading} base64Image={base64Image} imageMimeType={imageMimeType} isImageLoading={isImageLoading} onTryAnother={handleTryAnother} />
                            : <Navigate to="/generator" />
                    } />
                    <Route path="/generator" element={
                        <StoryGeneratorForm onSubmit={handleGenerateStory} isLoading={isLoading} error={error} />
                    } />
                    <Route path="/exam" element={
                        examData
                            ? <ExamModeScreen examPrep={examData} topic={studentContext.subject} context={studentContext} onBack={() => navigate('/')} />
                            : <Navigate to="/" />
                    } />
                    <Route path="/practice" element={
                        practiceData
                            ? <PracticeScreen questions={practiceData} topic={currentQuestion} subject={studentContext.subject} onBack={() => navigate('/chat')} />
                            : <Navigate to="/" />
                    } />
                    <Route path="/dashboard" element={<StudentDashboard onNavigate={navigateTo} />} />
                    <Route path="/my-stories" element={<MyStories onNavigate={navigateTo} />} />
                    <Route path="/about" element={<AboutUs onNavigate={navigateTo} />} />
                    <Route path="/teachers" element={<Teachers onNavigate={navigateTo} />} />
                    <Route path="/parents" element={<Parents onNavigate={navigateTo} />} />
                    <Route path="/research" element={<Research onNavigate={navigateTo} />} />
                    <Route path="/pilot" element={<PilotProgram onNavigate={navigateTo} />} />
                    <Route path="/contact" element={<Contact onNavigate={navigateTo} />} />
                    <Route path="/founder" element={<Founder onNavigate={navigateTo} />} />
                    <Route path="/privacy" element={<PrivacyPolicy onNavigate={navigateTo} />} />
                    <Route path="/inclusive" element={<InclusiveResearch onNavigate={navigateTo} />} />
                    <Route path="/admin" element={
                        <div className="p-8 text-center">
                            <h2 className="text-2xl font-bold mb-4 text-red-600">Admin Dashboard</h2>
                            <p>Coming soon: Student analytics and story review.</p>
                        </div>
                    } />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
};

export default App;
