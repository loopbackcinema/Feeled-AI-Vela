
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

const StorySection: React.FC<{ title: string; content: string }> = ({ title, content }) => (
    <div className="mb-6 bg-slate-50 p-4 rounded-xl border-l-4 border-blue-400 shadow-sm">
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

interface QuizSectionProps {
    quiz: QuizQuestion[];
    onQuizComplete: (score: number) => void;
}

const QuizSection: React.FC<QuizSectionProps> = ({ quiz, onQuizComplete }) => {
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [showResult, setShowResult] = useState<{ [key: number]: boolean }>({});
    const [score, setScore] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    const handleOptionSelect = (qIndex: number, option: string) => {
        if (showResult[qIndex]) return; 
        setAnswers(prev => ({ ...prev, [qIndex]: option }));
    };

    const handleCheckAnswer = (qIndex: number) => {
        const isCorrect = answers[qIndex] === quiz[qIndex].answer;
        if (isCorrect) {
            setScore(prev => prev + 1);
        }
        setShowResult(prev => ({ ...prev, [qIndex]: true }));
        
        // Check if all questions are answered
        const nextResults = { ...showResult, [qIndex]: true };
        if (Object.keys(nextResults).length === quiz.length && !isCompleted) {
            setIsCompleted(true);
            // Calculate final score including this one
            const finalScore = isCorrect ? score + 1 : score;
            onQuizComplete(finalScore);
        }
    };

    if (!quiz || quiz.length === 0) return null;

    return (
        <div className="mt-12 bg-indigo-50/80 p-6 md:p-8 rounded-3xl border border-indigo-100 shadow-md">
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
    const [canShare, setCanShare] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    
    // Gamification & Certificate States
    const [showCertificateForm, setShowCertificateForm] = useState(false);
    const [studentName, setStudentName] = useState('');
    const [studentClass, setStudentClass] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [certificateBlob, setCertificateBlob] = useState<Blob | null>(null);
    const [generatingCert, setGeneratingCert] = useState(false);

    // Ref for scrolling to chat
    const chatSectionRef = useRef<HTMLDivElement>(null);
    const certRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (navigator.share) {
            setCanShare(true);
        }
    }, []);

    const handleQuizComplete = (score: number) => {
        if (score === 3) {
            setTimeout(() => {
                setShowCertificateForm(true);
                setTimeout(() => {
                    certRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }, 1000);
        }
    };

    const generateCertificate = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneratingCert(true);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set high resolution
        canvas.width = 1200;
        canvas.height = 800;

        // Background
        const gradient = ctx.createLinearGradient(0, 0, 1200, 800);
        gradient.addColorStop(0, '#fdfbf7');
        gradient.addColorStop(1, '#eef2ff');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1200, 800);

        // Border
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 20;
        ctx.strokeRect(20, 20, 1160, 760);
        
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 5;
        ctx.strokeRect(40, 40, 1120, 720);

        // Header
        ctx.font = 'bold 80px "Nunito", sans-serif';
        ctx.fillStyle = '#1e3a8a';
        ctx.textAlign = 'center';
        ctx.fillText('CERTIFICATE', 600, 150);
        
        ctx.font = 'bold 40px "Nunito", sans-serif';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('OF MERIT', 600, 210);

        // Content
        ctx.font = 'italic 30px "Nunito", sans-serif';
        ctx.fillStyle = '#4b5563';
        ctx.fillText('This is proudly presented to', 600, 300);

        // Name
        ctx.font = 'bold italic 70px "Nunito", serif';
        ctx.fillStyle = '#2563eb';
        ctx.fillText(studentName, 600, 390);

        // Details
        ctx.font = '30px "Nunito", sans-serif';
        ctx.fillStyle = '#374151';
        ctx.fillText(`Grade: ${studentClass} | School: ${schoolName}`, 600, 460);

        ctx.font = 'italic 30px "Nunito", sans-serif';
        ctx.fillStyle = '#4b5563';
        ctx.fillText('For successfully mastering the concept of', 600, 530);

        // Story Concept
        ctx.font = 'bold 40px "Nunito", sans-serif';
        ctx.fillStyle = '#1e3a8a';
        const maxWidth = 1000;
        const concept = story.title;
        if (ctx.measureText(concept).width > maxWidth) {
             ctx.fillText(concept, 600, 600, maxWidth); 
        } else {
             ctx.fillText(concept, 600, 600);
        }

        // Footer
        ctx.beginPath();
        ctx.moveTo(300, 700);
        ctx.lineTo(900, 700);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 30px "Nunito", sans-serif';
        ctx.fillStyle = '#6366f1';
        ctx.fillText('FeelEd AI', 600, 740);
        
        ctx.font = '20px "Nunito", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Emotion-Adaptive Education', 600, 770);

        // Convert to Blob
        canvas.toBlob((blob) => {
            if (blob) {
                setCertificateBlob(blob);
            }
            setGeneratingCert(false);
        }, 'image/png');
    };

    const handleShareCertificate = async () => {
        if (!certificateBlob) return;

        const shareText = `I just earned a Merit Certificate in "${story.title}" on FeelEd AI! 🎓✨\n\nExperience emotion-based learning here: https://feeledai.com`;

        if (navigator.share) {
            try {
                const file = new File([certificateBlob], "FeeledAI_Certificate.png", { type: "image/png" });
                await navigator.share({
                    title: 'My FeelEd AI Certificate',
                    text: shareText,
                    files: [file],
                });
            } catch (err) {
                console.error("Share failed", err);
            }
        } else {
             // Fallback to simple WhatsApp link if navigator.share fails (though this can't send the image)
             const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
             window.open(url, '_blank');
        }
    };

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
            `\n*Concept Explanation:*\n${story.concept_explanation}`,
            `\n*Resolution:*\n${story.resolution}`,
            `\n*Moral Message:*\n${story.moral_message}`,
            `\n\n- Generated by FeelEd AI (https://feeledai.com)`
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

    const handleSmartShare = async () => {
        if (!navigator.share) return;

        const text = getStoryAsText();
        // Construct the base share data
        const shareData: ShareData = {
            title: story.title,
            text: text,
        };

        let fileAttached = false;

        // Try to attach image if available
        if (base64Image && imageMimeType) {
            try {
                // Convert base64 to blob to file
                const res = await fetch(`data:${imageMimeType};base64,${base64Image}`);
                const blob = await res.blob();
                const file = new File([blob], "story_image.png", { type: imageMimeType });
                
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    shareData.files = [file];
                    fileAttached = true;
                }
            } catch (e) {
                console.error("Error preparing image for share:", e);
                // Continue sharing without image if it fails
            }
        }

        // IMPORTANT: If we are sharing a file, do NOT include the URL field.
        // Many platforms (especially Android) drop the text caption if a URL is present alongside a file.
        // We only add the URL if we are NOT sharing a file.
        if (!fileAttached) {
            shareData.url = 'https://feeledai.com';
        }

        try {
            await navigator.share(shareData);
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleCopyStory = () => {
        const text = getStoryAsText();
        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };

    const handleShareWhatsApp = () => {
        const text = encodeURIComponent(getStoryAsText());
        const url = `https://wa.me/?text=${text}`;
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
            <h2 className="text-4xl font-extrabold text-center mb-2 text-blue-700 tracking-tight">{story.title}</h2>
            <div className="flex justify-center items-center gap-2 mb-6">
                 <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-400">Tone: {story.emotion_tone}</span>
            </div>

            <div className="my-8 transform hover:scale-[1.01] transition-transform duration-500">
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

            <div className="my-8 text-center">
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
                <StorySection title="Introduction" content={story.introduction} />
                <StorySection title="Emotional_trigger" content={story.emotional_trigger} />
                <StorySection title="Concept_explanation" content={story.concept_explanation} />
                <StorySection title="Resolution" content={story.resolution} />
                
                <hr className="my-8 border-t-2 border-slate-100" />
                
                <div className="grid md:grid-cols-2 gap-4">
                     <StorySection title="Moral_message" content={story.moral_message} />
                     <StorySection title="Conclusion" content={story.conclusion} />
                </div>
            </div>

            {/* Interactive Quiz Section */}
            {story.quiz && story.quiz.length > 0 && <QuizSection quiz={story.quiz} onQuizComplete={handleQuizComplete} />}
            
            {/* Certificate Section */}
            {showCertificateForm && (
                <div ref={certRef} className="mt-12 bg-gradient-to-br from-yellow-50 to-amber-50 p-8 rounded-3xl border-2 border-amber-200 shadow-xl text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-20"></div>
                    
                    {!certificateBlob ? (
                        <>
                            <h3 className="text-3xl font-black text-amber-600 mb-2">🎉 Congratulations!</h3>
                            <p className="text-amber-800 font-medium mb-6">You got a perfect score! Claim your Merit Certificate.</p>
                            
                            <form onSubmit={generateCertificate} className="max-w-md mx-auto space-y-4 relative z-10">
                                <input 
                                    type="text" 
                                    placeholder="Student Name" 
                                    value={studentName}
                                    onChange={(e) => setStudentName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none"
                                    required
                                />
                                <input 
                                    type="text" 
                                    placeholder="Class / Grade (e.g., 5th Std)" 
                                    value={studentClass}
                                    onChange={(e) => setStudentClass(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none"
                                    required
                                />
                                <input 
                                    type="text" 
                                    placeholder="School Name" 
                                    value={schoolName}
                                    onChange={(e) => setSchoolName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none"
                                    required
                                />
                                <button 
                                    type="submit" 
                                    disabled={generatingCert}
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl shadow-lg transition-transform transform hover:scale-105 disabled:opacity-70"
                                >
                                    {generatingCert ? 'Generating...' : 'Get Certificate 🏆'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-amber-700">🎓 Your Certificate is Ready!</h3>
                            <img 
                                src={URL.createObjectURL(certificateBlob)} 
                                alt="Certificate" 
                                className="w-full rounded-xl shadow-lg border-4 border-white mx-auto max-w-lg"
                            />
                            <div className="flex justify-center gap-4">
                                <button 
                                    onClick={handleShareCertificate}
                                    className="bg-[#25D366] hover:bg-[#1ebc57] text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center gap-2 transition-transform transform hover:scale-105"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592z"/>
                                    </svg>
                                    Share on WhatsApp
                                </button>
                                <a 
                                    href={URL.createObjectURL(certificateBlob)} 
                                    download="FeelEd_Certificate.png"
                                    className="bg-white border-2 border-amber-200 text-amber-700 font-bold py-3 px-6 rounded-xl hover:bg-amber-50 transition-colors"
                                >
                                    Download
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
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
                        Download Audio
                    </button>
                    
                    <button 
                        onClick={scrollToChat} 
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 font-semibold py-2 px-4 rounded-xl shadow-md transition-all transform hover:scale-105"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                        </svg>
                        Discuss
                    </button>

                    {canShare && (
                        <button 
                            onClick={handleSmartShare} 
                            className="flex items-center justify-center gap-2 bg-pink-600 text-white hover:bg-pink-700 font-semibold py-2 px-4 rounded-xl shadow-sm transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.19.026.37.06.55.098a2.25 2.25 0 0 1 1.455 1.455c.038.18.072.36.098.55m0 0a2.25 2.25 0 0 0 2.186 0m0-2.186a2.25 2.25 0 0 0 0-2.186m0 2.186c-.19-.026-.37-.06-.55-.098a2.25 2.25 0 0 1-1.455-1.455c-.038-.18-.072-.36-.098-.55m0 0a2.25 2.25 0 0 0-2.186 0m0 2.186.001.001" />
                            </svg>
                            Share Image + Story
                        </button>
                    )}

                    <button 
                        onClick={handleCopyStory}
                        className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold py-2 px-4 rounded-xl shadow-sm transition-colors"
                    >
                         {copySuccess ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                                Copied!
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5" />
                                </svg>
                                Copy Story
                            </>
                        )}
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
