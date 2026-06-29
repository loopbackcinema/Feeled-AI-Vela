/**
 * buildLEOFromCinemaStory — src/lib/buildLEOFromCinemaStory.ts
 * CinemaStory → LearningExperienceObject (LEO v2)
 * Rule: Never throw — always return a valid LEO.
 */

import {
    CinemaStory,
    LearningExperienceObject,
} from '../types';

export function buildLEOFromCinemaStory(
    story: CinemaStory,
    language: string = 'Tamil',
): LearningExperienceObject {
    const grade = parseInt(story.grade, 10) || 10;

    const resolutionAct = story.acts.find(a => a.act_type === 'resolution');
    const essentialIdea =
        resolutionAct?.screenplay.find(l => l.speaker === 'narrator')?.text ||
        story.cinema_title;

    const centralQuestion =
        story.acts[0]?.curtain_question?.trim() ||
        `What is the core idea behind ${story.cinema_title}?`;

    return {
        topic:    story.cinema_title,
        grade,
        subject:  story.subject,
        language,
        central_question: centralQuestion,
        essential_idea:   essentialIdea,

        curiosity_hook: {
            phenomenon:      story.acts[0]?.setting?.place ?? story.cinema_title,
            why_surprising:   story.acts[0]?.setting?.mood ?? '',
            learning_tension: story.acts[0]?.curtain_question ?? '',
            
        },

        common_misconceptions: story.acts
            .filter(act => act.curtain_question?.trim())
            .slice(0, 3)
            .map(act => ({
                statement:           act.curtain_question,
                why_believable:      'Common student assumption.',
                severity:            'minor' as const,
                correction_strategy: 'prediction' as const,
            })),

        observation_sequence: story.acts.flatMap(act =>
            act.screenplay
                .filter(line => line.speaker === 'narrator')
                .map(line => line.text)
        ).slice(0, 6),

        prediction_opportunities: story.acts
            .filter(act => act.curtain_question?.trim())
            .map(act => ({
                moment:                       act.act_title,
                question:                     act.curtain_question,
                options:                      ['Yes', 'No', 'Maybe'],
                correct_index:                0,
                why_wrong_options_feel_right: 'Surface-level reasoning.',
            })),

        concept_reveal: {
            the_moment:       resolutionAct?.act_title ?? 'Resolution',
            what_becomes_visible: essentialIdea,
            learning_transformation: {
                before_student_believes: centralQuestion,
                after_student_understands: essentialIdea,
            },
            emotional_quality: 'satisfying' as const,
        },

        emotional_arc: story.acts.map(act => ({
            stage: ({
                hook:          'Curious',
                rising_action: 'Confused',
                climax:        'Thinking',
                resolution:    'Discovery',
                exam_bridge:   'Confidence',
            }[act.act_type] ?? 'Curious') as any,
            trigger:  act.act_title,
            duration: 'moderate' as const,
        })),

        candidate_memory_models: [{
            name:                 story.cinema_title,
            description:          story.exam_spotlight.most_asked_question,
            why_memorable:        story.exam_spotlight.model_answer_structure.join(' '),
            scientifically_accurate: true,
            accuracy_note:        story.exam_spotlight.marks_tip,
        }],

        real_world_connections: [{
            example:              story.protagonist.role,
            connection_to_concept: story.protagonist.tamil_connection,
            difficulty:           'concrete' as const,
            urban_rural:          'both' as const,
            age_relevance:        `Grade ${grade} student context`,
        }],

        reflection:  story.quiz.slice(0, 3).map(q => q.question),
        application: story.exam_spotlight.model_answer_structure.slice(0, 3),

        memory_anchor: {
            image_description: story.acts[story.acts.length - 1]?.setting?.place ?? story.cinema_title,
            anchor_sentence:   essentialIdea,
            cognitive_hook:    story.protagonist.tamil_connection,
        },

        learning_success_criteria: {
            student_can_explain:  [story.exam_spotlight.most_asked_question],
            student_can_predict:  story.acts.filter(a => a.curtain_question).map(a => a.curtain_question),
            student_can_identify: story.quiz.slice(0, 2).map(q => q.question),
            student_can_apply:    story.exam_spotlight.model_answer_structure.slice(0, 3),
        },

        assessment_insight: {
            understanding_vs_memorization: story.exam_spotlight.marks_tip,
            tn_board_pattern:              story.exam_spotlight.previous_year_hint,
            marks_tip:                     story.exam_spotlight.marks_tip,
        },
    };
}
