
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Story } from '../types';
import Spinner from './Spinner';

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
    <div className="mb-4 animate-fadeInUp" style={{ animationDelay: `${delay}ms`, opacity: 0 }}>
        <h3 className="text-lg font-semibold text-slate-700 mb-1 capitalize">{title.replace(/_/g, ' ')}</h3>
        <p className="text-slate-600 leading-relaxed">{content}</p>
    </div>
);

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
            `\n\n- Generated by FeelEd AI\n- Create your own at https://feeledai.com/`
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

    const handleShareInstagram = () => {
        const textToCopy = `${story.title}\n\n${story.introduction}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert("Story title and introduction copied to clipboard! Paste it in your Instagram post.");
        }).catch(err => {
            console.error('Could not copy text: ', err);
            alert("To share on Instagram, please copy the story title and introduction and post it from your app.");
        });
    };

    const handleShareYouTube = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert("Story link copied to clipboard! You can paste it in a YouTube video description or comment.");
            window.open('https://www.youtube.com', '_blank', 'noopener,noreferrer');
        }).catch(err => {
            console.error('Could not copy link: ', err);
            alert("Share your story on YouTube by including the link feeledai.com/ in a video description or comment.");
        });
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
        <div className="w-full max-w-3xl bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200">
            <h2 className="text-3xl font-bold text-center mb-2 text-blue-600 animate-fadeInUp">{story.title}</h2>
            <p className="text-center text-slate-500 mb-6 italic animate-fadeInUp" style={{ animationDelay: '100ms', opacity: 0 }}>Emotion Tone: {story.emotion_tone}</p>

            <div className="my-6 animate-fadeInUp" style={{ animationDelay: '200ms', opacity: 0 }}>
                {isImageLoading && (
                    <div className="w-full aspect-video bg-slate-200 rounded-lg animate-pulse mb-6"></div>
                )}
                {base64Image && imageMimeType && !isImageLoading && (
                    <img 
                        src={`data:${imageMimeType};base64,${base64Image}`} 
                        alt={story.title} 
                        className="w-full h-auto object-cover rounded-lg mb-6 shadow-md"
                    />
                )}
            </div>

            <div className="my-6 text-center animate-fadeInUp" style={{ animationDelay: '200ms', opacity: 0 }}>
                 <button 
                    onClick={handlePlayPause} 
                    disabled={isAudioLoading || isDecoding || !base64Audio}
                    className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 w-full md:w-auto mx-auto"
                >
                    {isAudioLoading || isDecoding ? <Spinner /> : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            {isPlaying ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.25v13.5l13.5-6.75L5.25 5.25Z" />
                            )}
                        </svg>
                    )}
                    <span>{getPlayerButtonText()}</span>
                 </button>
            </div>
            
            <div className="story-content space-y-4">
                <StorySection title="Introduction" content={story.introduction} delay={300} />
                <StorySection title="Emotional Trigger" content={story.emotional_trigger} delay={450} />
                <StorySection title="Concept Explanation" content={story.concept_explanation} delay={600} />
                <StorySection title="Resolution" content={story.resolution} delay={750} />
                <hr className="my-4 animate-fadeInUp" style={{ animationDelay: '900ms', opacity: 0 }} />
                <StorySection title="Moral Message" content={story.moral_message} delay={1050} />
                <StorySection title="Conclusion" content={story.conclusion} delay={1200} />
            </div>
            
            <div className="mt-8 border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-center text-slate-700 mb-4">Actions</h3>
                <div className="flex justify-center">
                    <button 
                        onClick={handleDownloadAudio} 
                        disabled={!base64Audio}
                        className="flex items-center justify-center gap-2 w-full md:w-auto text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        <span>Download Audio</span>
                    </button>
                </div>

                <h3 className="text-lg font-semibold text-center text-slate-700 mt-6 mb-4">Share this story</h3>
                <div className="flex justify-center items-center gap-3 flex-wrap">
                    <button onClick={handleShareInstagram} aria-label="Share on Instagram" className="flex items-center justify-center w-12 h-12 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 448 512">
                            <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                        </svg>
                    </button>
                    <button onClick={handleShareFacebook} aria-label="Share on Facebook" className="flex items-center justify-center w-12 h-12 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 16 16">
                           <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v2.241h-1.043c-.977 0-1.23.582-1.23 1.21v1.488h2.443l-.413 2.375h-2.03V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                        </svg>
                    </button>
                    <button onClick={handleShareYouTube} aria-label="Share on YouTube" className="flex items-center justify-center w-12 h-12 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 576 512">
                            <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 42.276 48.284 48.597C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.322 42.003-24.947 48.284-48.597 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.206z"/>
                        </svg>
                    </button>
                    <button onClick={handleShareWhatsApp} aria-label="Share on WhatsApp" className="flex items-center justify-center w-12 h-12 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 448 512" fill="currentColor">
                           <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.8 0-67.6-9.5-97.8-26.7l-7.1-4.2-73.3 19.3 19.3-71.6-4.7-7.5c-19.1-30.3-29.8-66-29.8-103.3 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                        </svg>
                    </button>
                </div>
            </div>

            <div className="mt-8 text-center">
                <button onClick={onTryAnother} className="bg-slate-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-transform transform hover:scale-105">
                    Try another story
                </button>
            </div>
        </div>
    );
};

export default StoryDisplay;
