
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

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('generator');
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
                .then(({ base64Audio }) => {
                    setBase64Audio(base64Audio);
                })
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
    }, []);
    
    const navigateTo = (page: Page) => {
        window.scrollTo({ top: 0, behavior: 'instant' });
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
        switch (currentPage) {
            case 'generator':
                return <StoryGeneratorForm onSubmit={handleGenerateStory} isLoading={isLoading} error={error} />;
            case 'story':
                return generatedStory ? (
                    <StoryDisplay
                        story={generatedStory}
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
            default: return <StoryGeneratorForm onSubmit={handleGenerateStory} isLoading={isLoading} error={error} />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            <Header onNavigate={navigateTo} />
            <main className="flex-grow container mx-auto px-4 py-8 md:py-16 max-w-7xl">
                {renderPage()}
            </main>
            <Footer onNavigate={navigateTo} />
        </div>
    );
};

export default App;
