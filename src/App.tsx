import React, { useState, useCallback, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ChatPage from './features/chat/ChatPage';
import AnswerScreen from './components/AnswerScreen';
import PracticeScreen from './components/PracticeScreen';
import ExamModeScreen from './components/ExamModeScreen';
import { generateStory, generateVoice, generateImage, generateConcept, generatePractice, generateExamPrep } from './services/geminiService';
import { StoryRequest, Page, StudentContext } from './types';
import StoryGeneratorForm from './components/StoryGeneratorForm';
import StoryDisplay from './components/StoryDisplay';
import PWAInstallBanner from './components/PWAInstallBanner';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy-loaded pages — only fetched when the route is first visited
const AboutUs          = lazy(() => import('./pages/AboutUs'));
const Contact          = lazy(() => import('./pages/Contact'));
const PrivacyPolicy    = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfUse       = lazy(() => import('./pages/TermsOfUse'));
const Founder          = lazy(() => import('./pages/Founder'));
const Research         = lazy(() => import('./pages/Research'));
const PilotProgram     = lazy(() => import('./pages/PilotProgram'));
const InclusiveResearch = lazy(() => import('./pages/InclusiveResearch'));
const FAQ              = lazy(() => import('./pages/FAQ'));
const Teachers         = lazy(() => import('./pages/Teachers'));
const Parents          = lazy(() => import('./pages/Parents'));
const MyStories        = lazy(() => import('./components/MyStories'));
const GameMode         = lazy(() => import('./pages/GameMode'));
const ExamMock         = lazy(() => import('./pages/ExamMock'));
const StudentDashboard = lazy(() => import('./components/StudentDashboard'));
import { useAuth } from './context/AuthContext';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useStudentStore } from './stores/studentStore';
import { useSessionStore } from './stores/sessionStore';

const PAGE_TO_PATH: Record<Page, string> = {
    home: '/',
    chat: '/',
    answer: '/answer',
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
    'game': '/game',
'exam-mock': '/exam-mock',
    'admin-dashboard': '/admin',
};

/** Thin page shell — optional top nav bar for static info pages */
const PageShell: React.FC<{ children: React.ReactNode; showNav?: boolean }> = ({ children, showNav }) => {
    const nav = useNavigate();
    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors">
            {showNav && (
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <button
                        onClick={() => nav(-1)}
                        className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 text-sm font-medium transition-colors"
                    >
                        ← Back
                    </button>
                    <button
                        onClick={() => nav('/')}
                        className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 text-sm font-medium transition-colors"
                    >
                        🏠 Home
                    </button>
                </div>
            )}
            {children}
        </div>
    );
};

const App: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

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

    const [isLoading, setIsLoading]           = useState(false);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [error, setError]                   = useState<string | null>(null);

    const navigateTo = useCallback((page: Page) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate(PAGE_TO_PATH[page]);
    }, [navigate]);

    const formatError = (err: any): string => {
        if (typeof err === 'string') return err;
        if (err?.message) {
            try { const p = JSON.parse(err.message); if (p?.error?.message) return p.error.message; } catch (e) { console.warn('FeelEd:', e); }
            return err.message;
        }
        return 'An unexpected error occurred.';
    };

    const logStudyActivity = async (type: string, topic: string, subj: string) => {
        if (!user) return;
        try {
            await addDoc(collection(db, 'study_activity'), { userId: user.uid, type, topic, subject: subj, createdAt: serverTimestamp() });
        } catch (e) { console.warn('FeelEd:', e); }
    };

    const handleGenerateStory = useCallback(async (request: StoryRequest) => {
        if (!user) { setError('Please log in to generate stories.'); return; }
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
                    userId: user.uid, userEmail: user.email || 'No Email',
                    title: story.title,
                    content: `${story.introduction}\n\n${story.concept_explanation}\n\n${story.resolution}`,
                    language: request.language, topic: request.topic, createdAt: serverTimestamp(),
                });
            } catch (e) { console.warn('FeelEd:', e); }
            setIsAudioLoading(true);
            setIsImageLoading(true);
            generateVoice(story, request)
                .then(({ base64Audio }) => setSession({ base64Audio }))
                .catch(() => {})
                .finally(() => setIsAudioLoading(false));
            generateImage(story)
                .then(({ base64Image, mimeType }) => setSession({ base64Image, imageMimeType: mimeType }))
                .catch(() => {})
                .finally(() => setIsImageLoading(false));
        } catch (err) {
            setError(formatError(err));
            setIsLoading(false);
        }
    }, [user, navigate, setSession]);

    const handleTryAnother = () => {
        setSession({ generatedStory: null, base64Audio: null, base64Image: null, imageMimeType: null });
        navigate('/generator');
    };

    const handleAskQuestion = async (question: string, context: StudentContext) => {
        setIsLoading(true); setError(null);
        setSession({ currentQuestion: question, base64Image: null, imageMimeType: null });
        setContext(context);
        try {
            const data = await generateConcept(question, context);
            setSession({ conceptData: data });
            navigate('/answer');
            await logStudyActivity('concept', question, context.subject);
            if (context.learningMode === 'Junior') {
                setIsImageLoading(true);
                generateImage({ title: question, introduction: data.simpleExplanation, concept_explanation: '', resolution: '' } as any)
                    .then(({ base64Image, mimeType }) => setSession({ base64Image, imageMimeType: mimeType }))
                    .catch(() => {})
                    .finally(() => setIsImageLoading(false));
            }
        } catch (err: any) { setError(formatError(err)); }
        finally { setIsLoading(false); }
    };

    const handleStartPractice = async () => {
        setIsLoading(true); setError(null);
        try {
            const data = await generatePractice(currentQuestion, studentContext);
            setSession({ practiceData: data });
            navigate('/practice');
        } catch (err: any) { setError(formatError(err)); }
        finally { setIsLoading(false); }
    };

    const handleExamMode = async (topic: string, context: StudentContext) => {
        setIsLoading(true); setError(null); setContext(context);
        try {
            const data = await generateExamPrep(topic, context);
            setSession({ examData: data });
            navigate('/exam');
            await logStudyActivity('exam', topic, context.subject);
        } catch (err: any) { setError(formatError(err)); }
        finally { setIsLoading(false); }
    };

    const PageLoader = () => (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#060610' }}>
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <>
            <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* ── Protected core app routes ── */}
                <Route path="/" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                <Route path="/chat" element={<Navigate to="/" replace />} />

                <Route path="/answer" element={
                    <ProtectedRoute>
                        {conceptData
                            ? <PageShell><AnswerScreen concept={conceptData} question={currentQuestion} context={studentContext} onBack={() => navigate('/')} onPractice={handleStartPractice} onStory={() => navigate('/generator')} base64Image={base64Image} imageMimeType={imageMimeType} isImageLoading={isImageLoading} /></PageShell>
                            : <Navigate to="/" />}
                    </ProtectedRoute>
                } />
                <Route path="/story" element={
                    <ProtectedRoute>
                        {generatedStory
                            ? <PageShell><StoryDisplay story={generatedStory} language={lastLanguage} base64Audio={base64Audio} isAudioLoading={isAudioLoading} base64Image={base64Image} imageMimeType={imageMimeType} isImageLoading={isImageLoading} onTryAnother={handleTryAnother} /></PageShell>
                            : <Navigate to="/generator" />}
                    </ProtectedRoute>
                } />
                <Route path="/generator" element={
                    <ProtectedRoute>
                        <StoryGeneratorForm onSubmit={handleGenerateStory} isLoading={isLoading} error={error} />
                    </ProtectedRoute>
                } />
                <Route path="/exam" element={
                    <ProtectedRoute>
                        {examData
                            ? <PageShell><ExamModeScreen examPrep={examData} topic={studentContext.subject} context={studentContext} onBack={() => navigate('/')} /></PageShell>
                            : <Navigate to="/" />}
                    </ProtectedRoute>
                } />
                <Route path="/practice" element={
                    <ProtectedRoute>
                        {practiceData
                            ? <PageShell><PracticeScreen questions={practiceData} topic={currentQuestion} subject={studentContext.subject} onBack={() => navigate('/answer')} /></PageShell>
                            : <Navigate to="/" />}
                    </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <PageShell showNav><div className="container mx-auto px-4 py-8 max-w-7xl"><StudentDashboard onNavigate={navigateTo} /></div></PageShell>
                    </ProtectedRoute>
                } />
                <Route path="/my-stories" element={
                    <ProtectedRoute>
                        <PageShell showNav><div className="container mx-auto px-4 py-8 max-w-7xl"><MyStories onNavigate={navigateTo} /></div></PageShell>
                    </ProtectedRoute>
                } />
                <Route path="/game"      element={<ProtectedRoute><GameMode /></ProtectedRoute>} />
                <Route path="/exam-mock" element={<ProtectedRoute><ExamMock /></ProtectedRoute>} />

                {/* ── Public informational pages (no login required) ── */}
                <Route path="/about"     element={<PageShell showNav><AboutUs onNavigate={navigateTo} /></PageShell>} />
                <Route path="/teachers"  element={<PageShell showNav><Teachers onNavigate={navigateTo} /></PageShell>} />
                <Route path="/parents"   element={<PageShell showNav><Parents onNavigate={navigateTo} /></PageShell>} />
                <Route path="/research"  element={<PageShell showNav><Research onNavigate={navigateTo} /></PageShell>} />
                <Route path="/pilot"     element={<PageShell showNav><PilotProgram onNavigate={navigateTo} /></PageShell>} />
                <Route path="/contact"   element={<PageShell showNav><Contact onNavigate={navigateTo} /></PageShell>} />
                <Route path="/founder"   element={<PageShell showNav><Founder onNavigate={navigateTo} /></PageShell>} />
                <Route path="/privacy"   element={<PageShell showNav><PrivacyPolicy onNavigate={navigateTo} /></PageShell>} />
                <Route path="/terms"    element={<PageShell showNav><TermsOfUse onNavigate={navigateTo} /></PageShell>} />
                <Route path="/inclusive" element={<PageShell showNav><InclusiveResearch onNavigate={navigate} /></PageShell>} />
                <Route path="/faq"      element={<PageShell showNav><FAQ onNavigate={navigate} /></PageShell>} />

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            </Suspense>
            </ErrorBoundary>
            <PWAInstallBanner />
        </>
    );
};

export default App;
