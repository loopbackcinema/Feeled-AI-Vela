import React, { useState, useCallback } from 'react';
import { Story, StoryRequest, Page } from './types';
import { generateStory, generateVoice } from './services/geminiService';
import Header from './components/Header';
import Footer from './components/Footer';
import StoryGeneratorForm from './components/StoryGeneratorForm';
import StoryDisplay from './components/StoryDisplay';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('generator');
    const [generatedStory, setGeneratedStory] = useState<Story | null>(null);
    const [base64Audio, setBase64Audio] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateStory = useCallback(async (request: StoryRequest) => {
        setIsLoading(true);
        setError(null);
        setGeneratedStory(null);
        setBase64Audio(null);

        try {
            // Step 1: Generate story text
            const { story } = await generateStory(request);
            setGeneratedStory(story);
            setCurrentPage('story');
            setIsLoading(false); // Story is loaded, stop main loader

            // Step 2: Generate audio in the background
            setIsAudioLoading(true);
            try {
                const { base64Audio } = await generateVoice(story, request);
                setBase64Audio(base64Audio);
            } catch (audioErr) {
                console.error("Audio generation failed:", audioErr);
                setError("Story generated, but failed to create audio. Please try again.");
            } finally {
                setIsAudioLoading(false);
            }

        } catch (err) {
            console.error("Story generation failed:", err);
            setError('Failed to generate story. Please try again.');
            setIsLoading(false);
        }
    }, []);
    
    const navigateTo = (page: Page) => {
        setCurrentPage(page);
    };

    const handleTryAnother = () => {
        setGeneratedStory(null);
        setBase64Audio(null);
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
                        onTryAnother={handleTryAnother}
                    />
                ) : (
                    <StoryGeneratorForm onSubmit={handleGenerateStory} isLoading={isLoading} error={error} />
                );
            case 'about':
                return <AboutUs onNavigate={navigateTo} />;
            case 'contact':
                return <Contact onNavigate={navigateTo} />;
            case 'privacy':
                return <PrivacyPolicy onNavigate={navigateTo} />;
            default:
                return <StoryGeneratorForm onSubmit={handleGenerateStory} isLoading={isLoading} error={error} />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center">
                {renderPage()}
            </main>
            <Footer onNavigate={navigateTo} />
        </div>
    );
};

export default App;
