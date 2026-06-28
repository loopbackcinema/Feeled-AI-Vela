import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

/**
 * /api/cinema-examfreq — Learning Experience Object Generator
 *
 * Renamed from cinema-examfreq (unused) to avoid exceeding Vercel Hobby 12-function limit.
 *
 * Architecture:
 *   Curriculum input (topic, grade, subject, language)
 *   → Gemini generates LearningExperienceObject
 *   → Pure educational content, ZERO cinematic structure
 *   → Experience Planner (future) converts LEO → 5-act cinema
 *
 * Schema validated against 10 topics, avg 22.9/24 on rubric.
 * See: /leo_outputs/LEO_VALIDATION_RESULTS.md
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ error: 'API_KEY not set' });

    const { topic, grade, subject, language } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required' });

    const gradeNum = parseInt(String(grade ?? '').replace(/\D/g, ''), 10) || 10;
    const lang = language || 'English';
    const sub = subject || 'General';

    const prompt = `You are a Learning Experience Designer for Tamil Nadu Samacheer Kalvi curriculum (Grades 9-12).

Generate a LEARNING EXPERIENCE OBJECT for the topic below.

This is NOT a lesson plan. NOT a screenplay. NOT a narration script.
This is pure educational content that a Cinema Engine will later render cinematically.

Topic: ${topic}
Grade: ${gradeNum}
Subject: ${sub}
Language: ${lang}

Output ONLY valid JSON. No markdown fences. No text before or after the JSON.

{
  "central_question": "ONE powerful question that drives the entire lesson. Student CANNOT answer before the lesson. CAN confidently answer after. Must create genuine curiosity — not a textbook definition question.",

  "essential_idea": "If the student remembers ONLY ONE thing 5 years later, this is it. One sentence maximum.",

  "curiosity_hook": {
    "phenomenon": "A surprising observation, contradiction, or mystery. ZERO explanation words. Only what is observed or seen. Test: remove from context — it should make no scientific claim.",
    "why_surprising": "Why this contradicts what students aged 15-17 in Tamil Nadu expect, based on their daily experience.",
    "opening_image": "What the student SEES in the first 8 seconds before any narration begins. Pure visual. No words. Describe like a film director's shot description."
  },

  "common_misconceptions": [
    {
      "statement": "What students actually believe about this topic before learning it",
      "why_believable": "Why this feels completely logical to a student who hasn't studied this yet",
      "severity": "minor | dangerous | complex",
      "correction_strategy": "prediction | reflection | demonstration | comparison | experiment"
    },
    {
      "statement": "Second real misconception",
      "why_believable": "Why believable",
      "severity": "minor | dangerous | complex",
      "correction_strategy": "prediction | reflection | demonstration | comparison | experiment"
    }
  ],

  "observation_sequence": [
    "Step 1: ONLY what is observed — no explanation, no why, just what is seen or measured",
    "Step 2: What changes or happens next — observation only",
    "Step 3: What the student observes at the end — observation only"
  ],

  "prediction_opportunities": [
    {
      "moment": "After observing [specific step from observation_sequence]...",
      "question": "What do you think will happen when...?",
      "options": [
        "Option that exploits misconception 1 — feels most natural to a naive student",
        "The correct answer",
        "Option that exploits misconception 2 or a different intuitive error"
      ],
      "correct_index": 1,
      "why_wrong_options_feel_right": "Specific explanation of why each wrong option is psychologically compelling to students with the listed misconceptions"
    }
  ],

  "concept_reveal": {
    "the_moment": "Describe this as a FELT experience, not an explanation. Like a film's eureka scene — what the student SEES or FEELS in the moment understanding arrives, before any narrator explains it. 'The student sees X and realizes Y' NOT 'The student learns that Z'.",
    "what_becomes_visible": "What was invisible, abstract, or confusing that suddenly becomes clear and visible",
    "emotional_quality": "satisfying | surprising | relieving | awe-inspiring"
  },

  "candidate_memory_models": [
    {
      "name": "Short memorable name for this metaphor",
      "description": "The complete mental image in 2-3 sentences. Specific enough to draw.",
      "why_memorable": "The specific cognitive, emotional, or narrative quality that makes this image stick for years",
      "scientifically_accurate": true,
      "accuracy_note": "Any nuance or limitation students should eventually know about this metaphor"
    },
    {
      "name": "Alternative memory model",
      "description": "Alternative image for different learning styles",
      "why_memorable": "Why this works",
      "scientifically_accurate": true,
      "accuracy_note": "Limitation if any"
    }
  ],

  "real_world_connections": [
    {
      "example": "Specific Tamil Nadu daily life experience — auto-rickshaw, idli steamer, Marina Beach, kolam, temple bell, coconut tree, Kaveri delta, MTC bus, Chennai traffic, etc. Must be something a student within 5km of a Tamil Nadu government school encounters.",
      "connection_to_concept": "The precise, specific connection to the scientific concept — not vague"
    },
    {
      "example": "Second Tamil Nadu example — different context",
      "connection_to_concept": "Specific connection"
    },
    {
      "example": "Third Tamil Nadu example",
      "connection_to_concept": "Specific connection"
    }
  ],

  "reflection_questions": [
    "Question that requires student to reconstruct the concept in their own words — tests understanding not memory",
    "Question that connects the concept to something in the student's own physical experience",
    "Question that naturally generates curiosity about the next related concept"
  ],

  "memory_anchor": {
    "image_description": "One specific visual scene. Simple enough that a student could sketch it. Scientifically accurate. Emotionally resonant. Visually concrete — every detail specified.",
    "anchor_sentence": "One sentence. When student encounters this image 5 years later, the scientific concept reconstructs in their mind.",
    "cognitive_hook": "The specific reason this image is difficult to forget — spatial uniqueness, emotional weight, physical impossibility, personal relevance, or narrative quality"
  },

  "assessment_insight": {
    "understanding_vs_memorization": "What genuine deep understanding looks like for this specific topic, vs what surface-level memorization looks like — with concrete examples of each",
    "tn_board_pattern": "How TN Samacheer Board typically examines this concept — describe 1-mark, 3-mark, and 5-mark question patterns with representative examples",
    "marks_tip": "One specific, actionable strategy for scoring full marks on this topic in TN Board exam"
  }
}

CRITICAL RULES — these are non-negotiable:
1. curiosity_hook.phenomenon: ZERO explanation words (because, therefore, due to, causes, this happens). Pure observation only.
2. observation_sequence: Each step describes ONLY what is seen or measured. Never why.
3. concept_reveal.the_moment: Write as FELT EXPERIENCE, not explanation. "The student sees X" not "Students learn that Y".
4. candidate_memory_models: Must be scientifically accurate. No misleading analogies.
5. real_world_connections: Must be specific Tamil Nadu experiences, not generic Indian or global examples.
6. central_question: A student who has never studied this topic CANNOT answer it. A student who has completed the lesson CAN.`;

    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
                responseMimeType: 'application/json',
                thinkingConfig: { thinkingBudget: 8000 }, // Higher budget for quality LEO generation
            },
        });

        if (!response.text) throw new Error('Empty response from Gemini');

        const raw = response.text.replace(/```json\n?|```/g, '').trim();
        const leo = JSON.parse(raw);

        // Attach metadata
        leo.topic = topic;
        leo.grade = gradeNum;
        leo.subject = sub;
        leo.language = lang;

        return res.status(200).json({ leo });

    } catch (error) {
        console.error('LEO generation error:', String(error));
        return res.status(500).json({
            error: 'Learning Experience Object generation failed',
            detail: String(error),
        });
    }
}
