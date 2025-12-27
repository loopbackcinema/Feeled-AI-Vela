
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
import Showcase from './pages/Showcase';

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
                .catch((audioErr) => {
                    console.error("Audio generation failed:", audioErr);
                    const errorMessage = audioErr instanceof Error ? audioErr.message : 'An unknown error occurred.';
                    setError(prev => prev ? `${prev} & Audio failed: ${errorMessage}` : `Audio failed: ${errorMessage}`);
                })
                .finally(() => {
                    setIsAudioLoading(false);
                });

            generateImage(story)
                .then(({ base64Image, mimeType }) => {
                    setBase64Image(base64Image);
                    setImageMimeType(mimeType);
                })
                .catch((imageErr) => {
                    console.error("Image generation failed:", imageErr);
                    const errorMessage = imageErr instanceof Error ? imageErr.message : 'An unknown error occurred.';
                    setError(prev => prev ? `${prev} & Image failed: ${errorMessage}` : `Image failed: ${errorMessage}`);
                })
                .finally(() => {
                    setIsImageLoading(false);
                });

        } catch (err) {
            console.error("Story generation failed:", err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to generate story. Details: ${errorMessage}`);
            setIsLoading(false);
        }
    }, []);
    
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
                ) : (
                    <StoryGeneratorForm onSubmit={handleGenerateStory} isLoading={isLoading} error={error} />
                );
            case 'about':
                return <AboutUs onNavigate={navigateTo} />;
            case 'founder':
                return <Founder onNavigate={navigateTo} />;
            case 'research':
                return <Research onNavigate={navigateTo} />;
            case 'contact':
                return <Contact onNavigate={navigateTo} />;
            case 'privacy':
                return <PrivacyPolicy onNavigate={navigateTo} />;
            case 'showcase':
                return <Showcase onNavigate={navigateTo} />;
            default:
                return <StoryGeneratorForm onSubmit={handleGenerateStory} isLoading={isLoading} error={error} />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-blue-100 selection:text-blue-900">
            <Header onNavigate={navigateTo} />
            <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex flex-col items-center justify-center">
                {renderPage()}
            </main>
            <Footer onNavigate={navigateTo} />
        </div>
    );
};

export default App;
