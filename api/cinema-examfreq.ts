import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

/**
 * /api/cinema-examfreq — Learning Experience Object Generator (v2 refined schema)
 *
 * Schema refinements based on architectural review:
 * 1. curiosity_hook: removed opening_image (cinema concern) → opening_phenomenon only
 * 2. concept_reveal: added learning_transformation (before/after belief change)
 * 3. real_world_connections: added difficulty, urban_rural, age_relevance
 * 4. reflection_questions → split into reflection + application
 * 5. Added learning_success_criteria (explain/predict/identify/apply)
 * 6. Added emotional_arc (learning emotion sequence, not cinematic)
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

This is NOT a lesson plan. NOT a screenplay. NOT narration. NOT a UI design.
This is pure educational content. A separate Cinema Engine will decide all visual and audio presentation.

Topic: ${topic}
Grade: ${gradeNum}
Subject: ${sub}
Language: ${lang}

Output ONLY valid JSON. No markdown fences. No text before or after.

{
  "central_question": "ONE powerful question. Student CANNOT answer before lesson. CAN confidently answer after. Creates genuine curiosity — not a textbook heading.",

  "essential_idea": "If student remembers ONLY ONE thing 5 years later, this is it. One sentence maximum.",

  "curiosity_hook": {
    "phenomenon": "A surprising observation, contradiction, or mystery in plain language. ZERO explanation words (no 'because', 'therefore', 'due to', 'causes', 'this happens'). Only what is observed.",
    "why_surprising": "Why this contradicts what Grade ${gradeNum} students in Tamil Nadu expect, based on their daily experience.",
    "learning_tension": "The specific conceptual gap or question this phenomenon creates in the student's mind — what they now need answered."
  },

  "common_misconceptions": [
    {
      "statement": "What students actually believe before learning this topic",
      "why_believable": "Why this feels completely logical to a student who hasn't studied this",
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
    "Step 3: What the student observes finally — observation only"
  ],

  "prediction_opportunities": [
    {
      "moment": "After observing [specific step]...",
      "question": "What do you think will happen when...?",
      "options": [
        "Option exploiting misconception 1 — most tempting to naive student",
        "Correct answer",
        "Option exploiting misconception 2 or different intuitive error"
      ],
      "correct_index": 1,
      "why_wrong_options_feel_right": "Specific psychology behind each wrong option — links to named misconceptions"
    }
  ],

  "concept_reveal": {
    "the_moment": "Describe as a FELT experience, not an explanation. What the student SEES or FEELS in the moment understanding arrives — before any narrator explains. Write like a film's eureka scene direction, but without camera language.",
    "what_becomes_visible": "What was invisible, abstract, or confusing that suddenly becomes clear",
    "learning_transformation": {
      "before_student_believes": "The specific wrong belief the student held entering this moment",
      "after_student_understands": "The precise correct understanding that replaces it"
    },
    "emotional_quality": "satisfying | surprising | relieving | awe-inspiring"
  },

  "emotional_arc": [
    {
      "stage": "Curious",
      "trigger": "What creates this emotion in the student",
      "duration": "brief | moderate | extended"
    },
    {
      "stage": "Confused",
      "trigger": "What creates productive confusion",
      "duration": "brief | moderate | extended"
    },
    {
      "stage": "Thinking",
      "trigger": "What activates active reasoning",
      "duration": "brief | moderate | extended"
    },
    {
      "stage": "Discovery",
      "trigger": "The moment of conceptual shift",
      "duration": "brief"
    },
    {
      "stage": "Confidence",
      "trigger": "What confirms understanding",
      "duration": "extended"
    }
  ],

  "candidate_memory_models": [
    {
      "name": "Short memorable name",
      "description": "The complete mental image in 2-3 sentences. Specific enough to sketch.",
      "why_memorable": "The cognitive, emotional, or narrative quality that makes this image stick for years",
      "scientifically_accurate": true,
      "accuracy_note": "Any nuance or limitation students should eventually know"
    },
    {
      "name": "Alternative model",
      "description": "Alternative for different learning styles or contexts",
      "why_memorable": "Why this works",
      "scientifically_accurate": true,
      "accuracy_note": "Limitation if any"
    }
  ],

  "real_world_connections": [
    {
      "example": "Specific Tamil Nadu experience — auto-rickshaw, idli steamer, Marina Beach, kolam, temple bell, coconut tree, MTC bus, etc.",
      "connection_to_concept": "The precise scientific connection",
      "difficulty": "concrete | semi-abstract | abstract",
      "urban_rural": "urban | rural | both",
      "age_relevance": "Why this specific example resonates with Grade ${gradeNum} students aged ${gradeNum + 5}-${gradeNum + 6}"
    },
    {
      "example": "Second Tamil Nadu example — different urban/rural context",
      "connection_to_concept": "Specific connection",
      "difficulty": "concrete | semi-abstract | abstract",
      "urban_rural": "urban | rural | both",
      "age_relevance": "Relevance note"
    },
    {
      "example": "Third Tamil Nadu example",
      "connection_to_concept": "Specific connection",
      "difficulty": "concrete | semi-abstract | abstract",
      "urban_rural": "urban | rural | both",
      "age_relevance": "Relevance note"
    }
  ],

  "reflection": [
    "Question that encourages the student to reconstruct understanding in their own words — no right/wrong answer",
    "Question connecting concept to something in the student's own body or immediate environment",
    "Question that generates natural curiosity about what comes next"
  ],

  "application": [
    "Question requiring transfer of knowledge to a novel situation — tests genuine understanding",
    "Real problem the student can solve using this concept in Tamil Nadu context"
  ],

  "memory_anchor": {
    "image_description": "One specific scene. Simple enough to sketch in 30 seconds. Scientifically accurate. Every visual detail specified. No camera language.",
    "anchor_sentence": "One sentence. Encountering this image 5 years later reconstructs the concept.",
    "cognitive_hook": "The specific reason this image is difficult to forget — spatial uniqueness, emotional weight, personal relevance, or narrative quality"
  },

  "learning_success_criteria": {
    "student_can_explain": [
      "Specific thing student should be able to explain in own words after this lesson"
    ],
    "student_can_predict": [
      "Specific novel situation student should be able to predict the outcome of"
    ],
    "student_can_identify": [
      "Specific real-world instance student should be able to identify as an example of this concept"
    ],
    "student_can_apply": [
      "Specific problem student should be able to solve using this concept"
    ]
  },

  "assessment_insight": {
    "understanding_vs_memorization": "What genuine understanding looks like vs surface memorization for this topic — with concrete examples of each",
    "tn_board_pattern": "1-mark, 3-mark, 5-mark question patterns with representative examples from TN Samacheer Board",
    "marks_tip": "One specific, actionable strategy for scoring full marks in TN Board exam on this topic"
  }
}

CRITICAL RULES:
1. curiosity_hook.phenomenon: ZERO explanation words. Pure observation only.
2. observation_sequence: ONLY what is seen/measured. Never why.
3. concept_reveal.the_moment: Felt experience, not explanation. No camera language.
4. real_world_connections: Must be specific Tamil Nadu. Not generic India or global.
5. emotional_arc: Learning emotions only. Not cinematic mood.
6. No opening_image, no shot directions, no SVG descriptions, no animation notes.
   The Cinema Engine will decide all of that from Document 4 onwards.`;

    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
                responseMimeType: 'application/json',
                thinkingConfig: { thinkingBudget: 8000 },
            },
        });

        if (!response.text) throw new Error('Empty response from Gemini');

        const raw = response.text.replace(/```json\n?|```/g, '').trim();
        const leo = JSON.parse(raw);

        leo.topic   = topic;
        leo.grade   = gradeNum;
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
