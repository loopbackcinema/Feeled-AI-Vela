import React, { useState, useCallback } from 'react';
import { Story, StoryRequest, Page } from './types';
import { generateStory, generateVoice, generateImage } from './services/geminiService';
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
import { useAuth } from './context/AuthContext';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const App: React.FC = () => {
    const { user, loading } = useAuth();
    const [currentPage, setCurrentPage] = useState<Page>('generator');
    const [generatedStory, setGeneratedStory] = useState<Story | null>(null);
    const [base64Audio, setBase64Audio] = useState<string | null>(null);
    const [base64Image, setBase64Image] = useState<string | null>(null);
    const [imageMimeType, setImageMimeType] = useState<string | null>(null);
    const [lastLanguage, setLastLanguage] = useState<string>('English');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
    const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateStory = useCallback(async (request: StoryRequest) => {
        if (!user) {
            setError('Please log in to generate stories.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedStory(null);
        setBase64Audio(null);
        setBase64Image(null);
        setImageMimeType(null);
        setLastLanguage(request.language);

        try {
            const { story } = await generateStory(request);
            setGeneratedStory(story);
            setCurrentPage('story');
            setIsLoading(false);

            // Save story to Firestore
            try {
                await addDoc(collection(db, 'stories'), {
                    userId: user.uid,
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
                .then(({ base64Audio }) => setBase64Audio(base64Audio))
                .catch((e) => console.error("Audio synthesis failed:", e))
                .finally(() => setIsAudioLoading(false));

            generateImage(story)
                .then(({ base64Image, mimeType }) => {
                    setBase64Image(base64Image);
                    setImageMimeType(mimeType);
                })
                .catch((e) => console.error("Visual synthesis failed:", e))
                .finally(() => setIsImageLoading(false));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during pedagogical synthesis.');
            setIsLoading(false);
        }
    }, [user]);
    
    const navigateTo = (page: Page) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentPage(page);
    };

    const handleTryAnother = () => {
        setGeneratedStory(null);
        setBase64Audio(null);
        setBase64Image(null);
        setImageMimeType(null);
        setCurrentPage('generator');
    };

    const renderPage = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">Initializing pedagogical environment...</p>
                </div>
            );
        }

        switch (currentPage) {
            case 'generator':
                return <StoryGeneratorForm onSubmit={handleGenerateStory} isLoading={isLoading} error={error} />;
            case 'story':
                return generatedStory ? (
                    <StoryDisplay
                        story={generatedStory}
                        language={lastLanguage}
                        base64Audio={base64Audio}
                        isAudioLoading={isAudioLoading}
                        base64Image={base64Image}
                        imageMimeType={imageMimeType}
                        isImageLoading={isImageLoading}
                        onTryAnother={handleTryAnother}
                    />
                ) : <StoryGeneratorForm onSubmit={handleGenerateStory} isLoading={isLoading} error={error} />;
            case 'about': return <AboutUs onNavigate={navigateTo} />;
            case 'founder': return <Founder onNavigate={navigateTo} />;
            case 'research': return <Research onNavigate={navigateTo} />;
            case 'pilot': return <PilotProgram onNavigate={navigateTo} />;
            case 'contact': return <Contact onNavigate={navigateTo} />;
            case 'privacy': return <PrivacyPolicy onNavigate={navigateTo} />;
            case 'inclusive': return <InclusiveResearch onNavigate={navigateTo} />;
            case 'teachers': return <Teachers onNavigate={navigateTo} />;
            case 'parents': return <Parents onNavigate={navigateTo} />;
            case 'my-stories': return <div className="p-8 text-center"><h2 className="text-2xl font-bold mb-4">My Stories</h2><p>Coming soon: Your personal library of generated stories.</p></div>;
            case 'admin-dashboard': return <div className="p-8 text-center"><h2 className="text-2xl font-bold mb-4 text-red-600">Admin Dashboard</h2><p>Coming soon: Student analytics and story review.</p></div>;
            default: return <StoryGeneratorForm onSubmit={handleGenerateStory} isLoading={isLoading} error={error} />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
            <Header onNavigate={navigateTo} />
            <main className="flex-grow container mx-auto px-4 py-8 md:py-16 max-w-7xl">
                {renderPage()}
            </main>
            <Footer onNavigate={navigateTo} />
        </div>
    );
};

export default App;