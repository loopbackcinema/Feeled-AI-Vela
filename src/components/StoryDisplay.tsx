
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

const StorySection: React.FC<{ title: string; content: string; delay: number }> = ({ title, content, delay }) => (
    <div className="mb-6 animate-fadeInUp bg-slate-50 p-4 rounded-xl border-l-4 border-blue-400" style={{ animationDelay: `${delay}ms`, opacity: 0 }}>
        <h3 className="text-lg font-bold text-slate-800 mb-2 capitalize flex items-center gap-2">
            {title === 'Introduction' && '✨'}
            {title === 'Emotional_trigger' && '❤️'}
            {title === 'Concept_explanation' && '💡'}
            {title === 'Resolution' && '✅'}
            {title === 'Moral_message' && '🌟'}
            {title === 'Conclusion' && '🎓'}
            {title.replace(/_/g, ' ')}
        </h3>
        <p className="text-slate-700 leading-relaxed text-lg">{content}</p>
    </div>
);

const QuizSection: React.FC<{ quiz: QuizQuestion[] }> = ({ quiz }) => {
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [showResult, setShowResult] = useState<{ [key: number]: boolean }>({});

    const handleOptionSelect = (qIndex: number, option: string) => {
        if (showResult[qIndex]) return; // Prevent changing after showing result
        setAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    const handleCheckAnswer = (qIndex: number) => {
        setShowResult(prev => ({ ...prev, [qIndex]: true }));
    };

    if (!quiz || quiz.length === 0) return null;

    return (
        <div className="mt-12 bg-indigo-50/80 p-6 md:p-8 rounded-3xl border border-indigo-100 animate-fadeInUp" style={{ animationDelay: '500ms' }}>
            <h3 className="text-2xl font-bold text-indigo-900 mb-6 text-center flex items-center justify-center gap-2">
                <span>🧠</span> Knowledge Check
            </h3>
            <div className="space-y-6">
                {quiz.map((q, index) => (
                    <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-50 transition-all hover:shadow-md">
                        <p className="font-bold text-slate-800 mb-4 text-lg">{index + 1}. {q.question}</p>
                        <div className="space-y-3">
                            {q.options.map((option) => {
                                const isSelected = answers[index] === option;
                                const isCorrect = option === q.answer;
                                const isRevealed = showResult[index];
                                
                                let buttonClass = "w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex justify-between items-center group ";
                                if (isRevealed) {
                                    if (isCorrect) buttonClass += "bg-green-50 border-green-500 text-green-800 font-bold";
                                    else if (isSelected) buttonClass += "bg-red-50 border-red-500 text-red-800";
                                    else buttonClass += "border-slate-100 text-slate-400 opacity-60";
                                } else {
                                    if (isSelected) buttonClass += "bg-blue-50 border-blue-500 text-blue-800";
                                    else buttonClass += "hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300";
                                }

                                return (
                                    <button
                                        key={option}
                                        onClick={() => handleOptionSelect(index, option)}
                                        className={buttonClass}
                                        disabled={isRevealed}
                                    >
                                        <span>{option}</span>
                                        {isRevealed && isCorrect && <span className="text-green-600 text-xl">✓</span>}
                                        {isRevealed && isSelected && !isCorrect && <span className="text-red-500 text-xl">✗</span>}
                                    </button>
                                );
                            })}
                        </div>
                        {!showResult[index] && (
                            <div className="mt-4 flex justify-end">
                                <button 
                                    onClick={() => handleCheckAnswer(index)}
                                    disabled={!answers[index]}
                                    className="text-sm font-semibold bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                >
                                    Check Answer
                                </button>
                            </div>
                        )}
                        {showResult[index] && (
                             <div className={`mt-4 p-3 rounded-lg text-sm font-semibold text-center border ${answers[index] === q.answer ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                {answers[index] === q.answer ? "✨ Excellent! That's correct!" : `Oops! The correct answer is: ${q.answer}`}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Helper function to decode base64
function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// Helper function to decode raw PCM data into an AudioBuffer for playback
async function decodePcmAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length;
  const numChannels = 1;
  const sampleRate = 24000;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

// Helper to write a string to a DataView
function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// Helper to encode PCM data into a WAV file blob
function encodeWAV(samples: Int16Array, sampleRate: number): Blob {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    // Write PCM data
    for (let i = 0; i < samples.length; i++) {
        view.setInt16(44 + i * 2, samples[i], true);
    }

    return new Blob([view], { type: 'audio/wav' });
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, base64Audio, isAudioLoading, base64Image, imageMimeType, isImageLoading, onTryAnother }) => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isDecoding, setIsDecoding] = useState(false);
    
    // Ref for scrolling to chat
    const chatSectionRef = useRef<HTMLDivElement>(null);
    
    const shareUrl = 'https://feeledai.com/';

    const handlePlayPause = useCallback(async () => {
        if (!base64Audio) return;

        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        }
        const audioCtx = audioContextRef.current;

        if (isPlaying && audioSourceRef.current) {
            audioSourceRef.current.stop();
        } else if (!isDecoding) {
            setIsDecoding(true);
            try {
                const audioBytes = decode(base64Audio);
                const audioBuffer = await decodePcmAudioData(audioBytes, audioCtx);
                
                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioCtx.destination);
                source.onended = () => {
                    setIsPlaying(false);
                    audioSourceRef.current = null;
                };
                source.start(0);
                
                audioSourceRef.current = source;
                setIsPlaying(true);
            } catch (error) {
                console.error("Failed to decode or play audio:", error);
            } finally {
                setIsDecoding(false);
            }
        }
    }, [isPlaying, isDecoding, base64Audio]);

    const getStoryAsText = useCallback(() => {
        return [
            `*${story.title}*`,
            `\n*Emotion Tone:* ${story.emotion_tone}`,
            `\n*Introduction:*\n${story.introduction}`,
            `\n*Emotional Trigger:*\n${story.emotional_trigger}`,
            `\n*Concept Explanation:*\n${story.concept_explanation}`,
            `\n*Resolution:*\n${story.resolution}`,
            `\n*Moral Message:*\n${story.moral_message}`,
            `\n*Conclusion:*\n${story.conclusion}`,
            `\n\n- Generated by FeelEd AI`
        ].join('\n');
    }, [story]);
    
    const handleDownloadAudio = () => {
        if (!base64Audio) return;
        try {
            const audioBytes = decode(base64Audio);
            const pcmData = new Int16Array(audioBytes.buffer);
            const wavBlob = encodeWAV(pcmData, 24000);
            const url = URL.createObjectURL(wavBlob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${story.title.replace(/ /g, '_')}.wav`;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error("Failed to create download link:", error);
        }
    };

    const handleShareWhatsApp = () => {
        const text = encodeURIComponent(getStoryAsText());
        const url = `https://wa.me/?text=${text}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleShareFacebook = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(story.introduction)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };
    
    const scrollToChat = () => {
        chatSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        return () => {
            if (audioSourceRef.current) {
                audioSourceRef.current.stop();
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, []);

    const getPlayerButtonText = () => {
        if (isAudioLoading) return 'Generating Voice...';
        if (isDecoding) return 'Preparing Audio...';
        if (isPlaying) return 'Stop Story';
        return 'Play Story as Voice';
    };
    
    return (
        <div className="w-full max-w-4xl mx-auto glass-panel p-6 md:p-10 rounded-3xl shadow-2xl border border-white/40">
            <h2 className="text-4xl font-extrabold text-center mb-2 text-blue-700 animate-fadeInUp tracking-tight">{story.title}</h2>
            <div className="flex justify-center items-center gap-2 mb-6 animate-fadeInUp" style={{ animationDelay: '100ms', opacity: 0 }}>
                 <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-400">Tone: {story.emotion_tone}</span>
            </div>

            <div className="my-8 animate-fadeInUp transform hover:scale-[1.01] transition-transform duration-500" style={{ animationDelay: '200ms', opacity: 0 }}>
                {isImageLoading && (
                    <div className="w-full aspect-video bg-indigo-50 rounded-2xl animate-pulse mb-6 flex items-center justify-center border-4 border-white shadow-lg">
                        <span className="text-indigo-300 font-semibold">Dreaming up an image...</span>
                    </div>
                )}
                {base64Image && imageMimeType && !isImageLoading && (
                    <div className="relative group">
                         <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <img 
                            src={`data:${imageMimeType};base64,${base64Image}`} 
                            alt={story.title} 
                            className="relative w-full h-auto object-cover rounded-2xl shadow-xl border-4 border-white"
                        />
                    </div>
                )}
            </div>

            <div className="my-8 text-center animate-fadeInUp" style={{ animationDelay: '200ms', opacity: 0 }}>
                 <button 
                    onClick={handlePlayPause} 
                    disabled={isAudioLoading || isDecoding || !base64Audio}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 w-full md:w-auto mx-auto"
                >
                    {isAudioLoading || isDecoding ? <Spinner /> : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            {isPlaying ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.25v13.5l13.5-6.75L5.25 5.25Z" />
                            )}
                        </svg>
                    )}
                    <span className="text-lg">{getPlayerButtonText()}</span>
                 </button>
            </div>
            
            <div className="story-content space-y-2 mt-10">
                <StorySection title="Introduction" content={story.introduction} delay={300} />
                <StorySection title="Emotional_trigger" content={story.emotional_trigger} delay={450} />
                <StorySection title="Concept_explanation" content={story.concept_explanation} delay={600} />
                <StorySection title="Resolution" content={story.resolution} delay={750} />
                
                <hr className="my-8 border-t-2 border-slate-100 animate-fadeInUp" style={{ animationDelay: '900ms', opacity: 0 }} />
                
                <div className="grid md:grid-cols-2 gap-4">
                     <StorySection title="Moral_message" content={story.moral_message} delay={1050} />
                     <StorySection title="Conclusion" content={story.conclusion} delay={1200} />
                </div>
            </div>

            {/* Interactive Quiz Section */}
            {story.quiz && story.quiz.length > 0 && <QuizSection quiz={story.quiz} />}
            
            {/* Interactive Story Chat */}
            <div ref={chatSectionRef}>
                <StoryChat story={story} />
            </div>

            <div className="mt-12 bg-white/50 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
                <h3 className="text-xl font-bold text-center text-slate-700 mb-6">✨ Share or Discuss</h3>
                
                <div className="flex flex-wrap justify-center gap-4">
                     <button 
                        onClick={handleDownloadAudio} 
                        disabled={!base64Audio}
                        className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold py-2 px-4 rounded-xl shadow-sm transition-colors disabled:opacity-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        Download
                    </button>
                    
                    <button 
                        onClick={scrollToChat} 
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 font-semibold py-2 px-4 rounded-xl shadow-md transition-all transform hover:scale-105"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                        </svg>
                        Discuss with Narrator
                    </button>

                    <button onClick={handleShareWhatsApp} className="flex items-center justify-center gap-2 bg-[#25D366] text-white hover:bg-[#20bd5a] font-semibold py-2 px-4 rounded-xl shadow-sm transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.8 0-67.6-9.5-97.8-26.7l-7.1-4.2-73.3 19.3 19.3-71.6-4.7-7.5c-19.1-30.3-29.8-66-29.8-103.3 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                        WhatsApp
                    </button>
                </div>
            </div>

            <div className="mt-12 text-center">
                <button onClick={onTryAnother} className="bg-slate-800 text-white font-bold py-3 px-8 rounded-full hover:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-400 transition-transform transform hover:scale-105 shadow-lg">
                    ✨ Create Another Story
                </button>
            </div>
        </div>
    );
};

export default StoryDisplay;
