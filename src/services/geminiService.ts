
import { GoogleGenAI, Type } from "@google/genai";
import { Story, StoryRequest, ChatMessage, ConceptResponse, PracticeQuestion, ExamPrep, StudentContext } from '../types';

const getApiKey = () => {
    if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
        return process.env.GEMINI_API_KEY;
    }
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
        // @ts-ignore
        return import.meta.env.VITE_GEMINI_API_KEY;
    }
    return '';
};

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
    if (!aiInstance) {
        const apiKey = getApiKey();
        if (!apiKey) {
            console.warn("Gemini API Key is missing. AI features will not work.");
        }
        aiInstance = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-to-prevent-crash' });
    }
    return aiInstance;
};

export const generateConcept = async (question: string, context: StudentContext): Promise<ConceptResponse> => {
    const ai = getAI();
    const prompt = `You are an expert academic tutor for ${context.board}, Class ${context.standard}, Subject: ${context.subject}.
    The student is in ${context.learningMode} mode and their goal is ${context.goal}.
    
    The student asked: "${question}".
    
    CRITICAL INSTRUCTIONS:
    1. Language: Respond ENTIRELY in ${context.language}.
    2. Formatting: USE MARKDOWN. Use **bold** for key terms, *italics* for emphasis, and bullet points for lists.
    3. Accuracy: Align strictly with ${context.board} textbook standards.
    4. Senior Mode Logic: If Senior mode, use professional academic language and focus on technical accuracy.
    5. Junior Mode Logic: If Junior mode, use simpler language and more analogies.
    
    Provide:
    1. textbookAnswer: A comprehensive answer using Markdown.
    2. examFormat: 3-5 key bullet points for writing in an exam.
    3. simpleExplanation: An easy-to-understand explanation.
    4. keyKeywords: A list of 5-8 essential technical terms related to this topic.
    5. markBasedAnswers: Provide a specific "2 Mark" (concise) and "5 Mark" (detailed with headings) version of the answer.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    textbookAnswer: { type: Type.STRING },
                    examFormat: { type: Type.ARRAY, items: { type: Type.STRING } },
                    simpleExplanation: { type: Type.STRING },
                    keyKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                    markBasedAnswers: {
                        type: Type.OBJECT,
                        properties: {
                            twoMark: { type: Type.STRING },
                            fiveMark: { type: Type.STRING }
                        },
                        required: ["twoMark", "fiveMark"]
                    }
                },
                required: ["textbookAnswer", "examFormat", "simpleExplanation", "keyKeywords", "markBasedAnswers"]
            }
        }
    });
    return JSON.parse(response.text || "{}");
};

export const generatePractice = async (topic: string, context: StudentContext): Promise<PracticeQuestion[]> => {
    const ai = getAI();
    const prompt = `Generate a practice test for ${context.board}, Class ${context.standard}, Subject: ${context.subject} on the topic: "${topic}".
    Language: ${context.language}.
    
    Create exactly 4 questions:
    - 2 Multiple Choice Questions (MCQ) with 4 options each.
    - 1 Short Answer Question.
    - 1 Long Answer Question.
    
    Format: NO MARKDOWN. Return a JSON array of objects.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, description: "Must be 'mcq', 'short', or 'long'" },
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Only for mcq" },
                        correctAnswer: { type: Type.STRING }
                    },
                    required: ["type", "question", "correctAnswer"]
                }
            }
        }
    });
    return JSON.parse(response.text || "[]");
};

export const generateExamPrep = async (topic: string, context: StudentContext): Promise<ExamPrep> => {
    const ai = getAI();
    const prompt = `Generate quick exam preparation material for ${context.board}, Class ${context.standard}, Subject: ${context.subject} on the topic: "${topic}".
    Language: ${context.language}.
    Learning Mode: ${context.learningMode}.
    
    CRITICAL: USE MARKDOWN for all text fields.
    
    Provide:
    1. importantQuestions: 3-5 must-know questions from previous exams or core syllabus.
    2. revisionNotes: 3-5 quick bullet points summarizing the topic.
    3. predictedQuestions: 2 high-value questions likely to appear in exams.
    
    Format: Return a JSON object.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    importantQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    revisionNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
                    predictedQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["importantQuestions", "revisionNotes", "predictedQuestions"]
            }
        }
    });
    return JSON.parse(response.text || "{}");
};

export const generateStory = async (request: StoryRequest): Promise<{ story: Story }> => {
    const ai = getAI();
    const prompt = `Create an educational story for a student.
    Topic: ${request.topic}
    Language: ${request.language}
    Emotion Tone: ${request.emotionTone}
    
    The story must have:
    1. A catchy title
    2. An engaging introduction
    3. An emotional trigger
    4. A clear explanation of the concept hidden within the story
    5. A resolution
    6. A moral message
    7. A conclusion
    
    Return the response strictly as a JSON object.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    introduction: { type: Type.STRING },
                    emotional_trigger: { type: Type.STRING },
                    concept_explanation: { type: Type.STRING },
                    resolution: { type: Type.STRING },
                    moral_message: { type: Type.STRING },
                    conclusion: { type: Type.STRING },
                    emotion_tone: { type: Type.STRING }
                },
                required: ["title", "introduction", "emotional_trigger", "concept_explanation", "resolution", "moral_message", "conclusion", "emotion_tone"]
            }
        }
    });

    const storyData = JSON.parse(response.text || "{}");
    return { story: storyData as Story };
};

export const generateVoice = async (story: Story, request: StoryRequest): Promise<{ base64Audio: string }> => {
    const ai = getAI();
    const fullStoryText = [
        story.title,
        story.introduction,
        story.emotional_trigger,
        story.concept_explanation,
        story.resolution,
        story.moral_message,
        story.conclusion
    ].join('. ');

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: fullStoryText }] }],
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: request.narratorVoice === 'male' ? 'Fenrir' : 'Kore' },
                },
            },
        },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
    return { base64Audio };
};

export const generateImage = async (story: Story): Promise<{ base64Image: string; mimeType: string }> => {
    const ai = getAI();
    const imagePrompt = `Create a realistic, photorealistic digital art image that captures the essence of the following story scene. 
    The image should be visually stunning and evoke the story's emotional tone of "${story.emotion_tone}". 
    Scene description: "${story.introduction}". 
    
    CRITICAL RESTRICTIONS: 
    1. ABSOLUTELY NO TEXT, WORDS, LETTERS, SUBTITLES, OR LABELS in the image. 
    2. The image must be purely visual/artistic.
    3. No gibberish text or symbols that look like letters.
    4. Focus on the characters and environment.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: imagePrompt }] },
        config: {
            imageConfig: {
                aspectRatio: "16:9",
            }
        }
    });
    
    let base64Image = "";
    let mimeType = "";
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            base64Image = part.inlineData.data || "";
            mimeType = part.inlineData.mimeType || "";
            break;
        }
    }
    return { base64Image, mimeType };
};

export const sendChatMessage = async (message: string, history: ChatMessage[], story: Story): Promise<{ text: string }> => {
    const ai = getAI();
    const systemInstruction = `You are a helpful AI tutor. You just told the student a story about ${story.title}. 
    Answer their questions based on the story and the underlying educational concept.
    Story context: ${story.concept_explanation}`;

    const chat = ai.chats.create({
        model: "gemini-3.1-pro-preview",
        config: {
            systemInstruction: systemInstruction,
        },
    });

    // Send history
    for (const msg of history) {
        if (msg.role === 'user') {
            await chat.sendMessage({ message: msg.text });
        }
    }

    const response = await chat.sendMessage({ message: message });
    return { text: response.text || "" };
};
