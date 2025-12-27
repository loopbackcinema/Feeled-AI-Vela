import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Story, QuizQuestion } from '../types';
import Spinner from './Spinner';
import StoryChat from './StoryChat';

interface StoryDisplayProps {
    story: Story;
    base64Audio: string | null;
    isAudioLoading: boolean;
    base64Image: string | null;
    imageMimeType: string | null;
    isImageLoading: boolean;
    onTryAnother: () => void;
}

const StorySection: React.FC<{ title: string; content: string }> = ({ title, content }) => {
    const getIcon = (t: string) => {
        const lower = t.toLowerCase();
        if (lower.includes('introduction')) return '✨';
        if (lower.includes('trigger')) return '❤️';
        if (lower.includes('explanation')) return '💡';
        if (lower.includes('resolution')) return '✅';
        if (lower.includes('moral')) return '🌟';
        if (lower.includes('conclusion')) return '🎓';
        return '📖';
    };

    return (
        <div className="mb-6 bg-white p-6 md:p-8 rounded-[2rem] border-l-8 border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <h3 className="text-xl font-black text-slate-800 mb-3 capitalize flex items-center gap-3">
                <span className="text-3xl">{getIcon(title)}</span>
                {title.replace(/_/g, ' ')}
            </h3>
            <p className="text-slate-700 leading-relaxed text-lg font-medium">{content}</p>
        </div>
    );
};

interface QuizSectionProps {
    quiz: QuizQuestion[];
    onQuizComplete: (score: number) => void;
}

const QuizSection: React.FC<QuizSectionProps> = ({ quiz, onQuizComplete }) => {
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [showResult, setShowResult] = useState<{ [key: number]: boolean }>({});
    const [score, setScore] = useState(0);

    const handleOptionSelect = (qIndex: number, option: string) => {
        if (showResult[qIndex]) return; 
        setAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    const handleCheckAnswer = (qIndex: number) => {
        const isCorrect = answers[qIndex] === quiz[qIndex].answer;
        if (isCorrect) setScore(prev => prev + 1);
        
        setShowResult(prev => {
            const next = { ...prev, [qIndex]: true };
            if (Object.keys(next).length === quiz.length) {
                onQuizComplete(isCorrect ? score + 1 : score);
            }
            return next;
        });
    };

    return (
        <div className="mt-16 bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl border-4 border-indigo-50 relative overflow-hidden">
            <h3 className="text-3xl font-black text-indigo-900 mb-10 text-center flex items-center justify-center gap-4">
                <span className="text-4xl animate-bounce">🧠</span> Knowledge Check
            </h3>
            <div className="space-y-12">
                {quiz.map((q, index) => (
                    <div key={index} className="space-y-6">
                        <p className="text-xl font-black text-slate-800 leading-snug">{index + 1}. {q.question}</p>
                        <div className="grid gap-4">
                            {q.options.map((option) => {
                                const isSelected = answers[index] === option;
                                const isCorrect = option === q.answer;
                                const isRevealed = showResult[index];
                                
                                let btnStyle = "w-full text-left px-6 py-5 rounded-2xl border-4 transition-all font-bold text-lg ";
                                if (isRevealed) {
                                    if (isCorrect) btnStyle += "bg-green-50 border-green-500 text-green-700 ring-8 ring-green-100/50";
                                    else if (isSelected) btnStyle += "bg-red-50 border-red-500 text-red-700";
                                    else btnStyle += "border-slate-100 text-slate-300";
                                } else {
                                    if (isSelected) btnStyle += "bg-blue-50 border-blue-500 text-blue-800 shadow-md transform scale-[1.02]";
                                    else btnStyle += "bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-white";
                                }

                                return (
                                    <button
                                        key={option}
                                        onClick={() => handleOptionSelect(index, option)}
                                        className={btnStyle}
                                        disabled={isRevealed}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span>{option}</span>
                                            {isRevealed && isCorrect && <span className="text-2xl animate-pulse">✓</span>}
                                            {isRevealed && isSelected && !isCorrect && <span className="text-2xl">✗</span>}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {!showResult[index] && (
                            <button 
                                onClick={() => handleCheckAnswer(index)}
                                disabled={!answers[index]}
                                className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black hover:bg-indigo-600 transition-all disabled:opacity-30 shadow-2xl ml-auto block transform hover:scale-105 active:scale-95"
                            >
                                Submit Answer
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Audio decoding and encoding helpers
function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodePcmAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, base64Audio, isAudioLoading, base64Image, imageMimeType, isImageLoading, onTryAnother }) => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isDecoding, setIsDecoding] = useState(false);
    
    const chatSectionRef = useRef<HTMLDivElement>(null);

    const handlePlayPause = useCallback(async () => {
        if (!base64Audio) return;
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const audioCtx = audioContextRef.current;
        if (isPlaying && audioSourceRef.current) {
            audioSourceRef.current.stop();
        } else if (!isDecoding) {
            setIsDecoding(true);
            try {
                const audioBuffer = await decodePcmAudioData(decode(base64Audio), audioCtx);
                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioCtx.destination);
                source.onended = () => setIsPlaying(false);
                source.start(0);
                audioSourceRef.current = source;
                setIsPlaying(true);
            } catch (e) { console.error(e); }
            finally { setIsDecoding(false); }
        }
    }, [isPlaying, isDecoding, base64Audio]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in pb-32 px-4 print:p-0 print:max-w-none">
            {/* Header */}
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-5xl md:text-7xl font-black text-blue-800 tracking-tighter leading-tight drop-shadow-md print:text-4xl">{story.title}</h2>
                <div className="flex flex-wrap justify-center gap-4 no-print">
                    <div className="inline-flex items-center px-8 py-2.5 rounded-full bg-blue-50 border-4 border-blue-100 text-blue-600 font-black text-sm uppercase tracking-[0.2em] shadow-sm">
                        Emotional Arc: {story.emotion_tone}
                    </div>
                    <button 
                        onClick={handlePrint}
                        className="bg-slate-900 text-white px-8 py-2.5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-3"
                    >
                        <span>🖨️</span> Save as PDF
                    </button>
                </div>
            </div>

            {/* Thematic Visual */}
            <div className="mb-16 no-print">
                {isImageLoading ? (
                    <div className="w-full aspect-video bg-white rounded-[4rem] shadow-2xl border-8 border-white flex flex-col items-center justify-center animate-pulse">
                        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-5xl mb-4 shadow-inner">🎨</div>
                        <p className="text-slate-400 font-black text-xl">AI is painting the world for you...</p>
                    </div>
                ) : base64Image && (
                    <div className="relative group overflow-hidden rounded-[4rem] shadow-[0_40px_70px_-15px_rgba(0,0,0,0.4)] border-[16px] border-white ring-2 ring-slate-100 transition-all duration-700 hover:scale-[1.02]">
                        <img 
                            src={`data:${imageMimeType};base64,${base64Image}`} 
                            alt={story.title} 
                            className="w-full h-auto object-cover transform transition-transform duration-[3s] group-hover:scale-110"
                        />
                    </div>
                )}
            </div>

            {/* Narration Toggle */}
            <div className="sticky top-28 z-40 flex justify-center mb-16 pointer-events-none no-print">
                 <button 
                    onClick={handlePlayPause} 
                    disabled={isAudioLoading || isDecoding || !base64Audio}
                    className="pointer-events-auto bg-white/90 backdrop-blur-2xl border-4 border-white shadow-[0_30px_60px_-10px_rgba(37,99,235,0.3)] px-12 py-6 rounded-full font-black text-blue-700 flex items-center gap-6 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 ring-[12px] ring-blue-50/50 group"
                >
                    {isAudioLoading || isDecoding ? <Spinner /> : (
                        <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center ${isPlaying ? 'bg-red-500' : 'bg-blue-600'} text-white shadow-2xl transition-all duration-300 group-hover:rotate-6`}>
                            {isPlaying ? (
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8v4h2V8H7zm4 0v4h2V8h-2z"/></svg>
                            ) : (
                                <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 1 00-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                            )}
                        </div>
                    )}
                    <span className="text-2xl uppercase tracking-tighter">
                        {isAudioLoading ? 'Creating Voice...' : isDecoding ? 'Preparing...' : isPlaying ? 'Stop Story' : 'Narrate Story'}
                    </span>
                 </button>
            </div>
            
            {/* Story Sections */}
            <div className="space-y-10">
                <StorySection title="Introduction" content={story.introduction} />
                <StorySection title="Emotional Trigger" content={story.emotional_trigger} />
                <StorySection title="Concept Explanation" content={story.concept_explanation} />
                <StorySection title="Resolution" content={story.resolution} />
                <div className="grid md:grid-cols-2 gap-10">
                    <StorySection title="Moral Message" content={story.moral_message} />
                    <StorySection title="Conclusion" content={story.conclusion} />
                </div>
            </div>

            {/* Quiz */}
            <div className="no-print">
                <QuizSection quiz={story.quiz} onQuizComplete={() => {}} />
            </div>
            
            {/* Interactive Chatbot */}
            <div ref={chatSectionRef} className="mt-24 no-print">
                <StoryChat story={story} />
            </div>

            {/* Restart CTA */}
            <div className="mt-24 text-center no-print">
                <button onClick={onTryAnother} className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-black py-8 px-20 rounded-[3rem] hover:shadow-[0_40px_80px_-10px_rgba(37,99,235,0.4)] transition-all transform hover:scale-105 uppercase tracking-tighter text-2xl border-b-[12px] border-indigo-900 active:border-b-0 active:translate-y-2">
                    ✨ Create Another Magic Story
                </button>
            </div>
        </div>
    );
};

export default StoryDisplay;