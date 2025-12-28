import React, { useState, useCallback, useMemo } from 'react';
import { Story, StoryRequest, Page } from './types';
import { generateStory, generateVoice, generateImage } from './services/geminiService';
import Header from './components/Header';
import Footer from './components/Footer';
import StoryGeneratorForm from './components/StoryGeneratorForm';
import StoryDisplay from './components/StoryDisplay';
import StudentDashboard from './pages/StudentDashboard';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Founder from './pages/Founder';
import Research from './pages/Research';
import PilotProgram from './pages/PilotProgram';
import InclusiveResearch from './pages/InclusiveResearch';
import Teachers from './pages/Teachers';
import Parents from './pages/Parents';

const App: React.FC = () => {
    // FORCE DEFAULT TO DASHBOARD
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [generatedStory, setGeneratedStory] = useState<Story | null>(null);
    const [base64Audio, setBase64Audio] = useState<string | null>(null);
    const [base64Image, setBase64Image] = useState<string | null>(null);
    const [imageMimeType, setImageMimeType] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
    const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateStory = useCallback(async (request: StoryRequest) => {
        setIsLoading(true);
        setError(null);
        setGeneratedStory(null);
        setBase64Audio(null);
        setBase64Image(null);
        setImageMimeType(null);

        try {
            const { story } = await generateStory(request);
            setGeneratedStory(story);
            setCurrentPage('story');
            setIsLoading(false);

            setIsAudioLoading(true);
            setIsImageLoading(true);

            generateVoice(story, request)
                .then(({ base64Audio }) => setBase64Audio(base64Audio))
                .catch((e) => console.error("Audio failed:", e))
                .finally(() => setIsAudioLoading(false));

            generateImage(story)
                .then(({ base64Image, mimeType }) => {
                    setBase64Image(base64Image);
                    setImageMimeType(mimeType);
                })
                .catch((e) => console.error("Visual failed:", e))
                .finally(() => setIsImageLoading(false));

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Synthesis failed.');
            setIsLoading(false);
        }
    }, []);
    
    const navigateTo = useCallback((page: Page) => {
        console.log("Navigating to:", page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentPage(page);
    }, []);

    const handleTryAnother = useCallback(() => {
        setGeneratedStory(null);
        setBase64Audio(null);
        setBase64Image(null);
        setImageMimeType(null);
        navigateTo('dashboard');
    }, [navigateTo]);

    const pageContent = useMemo(() => {
        switch (currentPage) {
            case 'dashboard': 
                return <StudentDashboard key="dash" onNavigate={navigateTo} />;
            case 'student-generator':
                return <StoryGeneratorForm key="std-gen" onSubmit={handleGenerateStory} isLoading={isLoading} error={error} variant="student" />;
            case 'generator':
                return <StoryGeneratorForm key="pro-gen" onSubmit={handleGenerateStory} isLoading={isLoading} error={error} variant="professional" />;
            case 'story':
                return generatedStory ? (
                    <StoryDisplay
                        key="story-view"
                        story={generatedStory}
                        base64Audio={base64Audio}
                        isAudioLoading={isAudioLoading}
                        base64Image={base64Image}
                        imageMimeType={imageMimeType}
                        isImageLoading={isImageLoading}
                        onTryAnother={handleTryAnother}
                    />
                ) : <StudentDashboard onNavigate={navigateTo} />;
            case 'about': return <AboutUs onNavigate={navigateTo} />;
            case 'founder': return <Founder onNavigate={navigateTo} />;
            case 'research': return <Research onNavigate={navigateTo} />;
            case 'pilot': return <PilotProgram onNavigate={navigateTo} />;
            case 'contact': return <Contact onNavigate={navigateTo} />;
            case 'privacy': return <PrivacyPolicy onNavigate={navigateTo} />;
            case 'inclusive': return <InclusiveResearch onNavigate={navigateTo} />;
            case 'teachers': return <Teachers onNavigate={navigateTo} />;
            case 'parents': return <Parents onNavigate={navigateTo} />;
            default: return <StudentDashboard onNavigate={navigateTo} />;
        }
    }, [currentPage, generatedStory, base64Audio, base64Image, imageMimeType, isLoading, isAudioLoading, isImageLoading, error, handleGenerateStory, handleTryAnother, navigateTo]);

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            <Header onNavigate={navigateTo} />
            <main className="flex-grow">
                <div className="container mx-auto px-4 py-8 md:py-16 max-w-7xl animate-fade-in">
                    {pageContent}
                </div>
            </main>
            <Footer onNavigate={navigateTo} />
        </div>
    );
};

export default App;