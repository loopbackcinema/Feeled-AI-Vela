/**
 * CinemaEngine — src/cinema/CinemaEngine.ts
 *
 * Runtime executor for ExperiencePlan.
 * Loops through 5 acts in sequence, emits RenderState at each step.
 *
 * API surface (consumed by useCinemaEngine):
 *   engine.bus           — event bus
 *   engine.stage         — scene state
 *   engine.subtitles     — subtitle state
 *   engine.interaction   — interaction state
 *   engine.audio         — audio controller
 *   engine.stateManager  — mutable runtime state
 *   engine.run(ep)       — execute ExperiencePlan → Promise<void>
 *   engine.stop()        — halt execution
 *
 * Engineering rule: "Working first. Stable second. Beautiful third."
 * This commit answers one question:
 *   "Can we execute all 5 acts of an ExperiencePlan reliably?"
 */

import { ExperiencePlan, ExperienceAct } from '../types';

// ── Types ─────────────────────────────────────────────────────────────────────

type Unsub = () => void;
type UpdateCallback = () => void;

export interface BusEvent {
    type: string;
    payload: Record<string, unknown>;
}

export type PlaybackState =
    | 'idle'
    | 'loading'
    | 'playing'
    | 'paused'
    | 'silence'
    | 'interacting'
    | 'complete';

// ── EventBus ──────────────────────────────────────────────────────────────────

class EventBus {
    private handlers: Array<(e: BusEvent) => void> = [];

    emit(event: BusEvent): void {
        this.handlers.forEach(h => h(event));
    }

    onAll(cb: (e: BusEvent) => void): Unsub {
        this.handlers.push(cb);
        return () => { this.handlers = this.handlers.filter(h => h !== cb); };
    }
}

// ── SceneState ────────────────────────────────────────────────────────────────

interface SceneState {
    sceneType: string;
    actType: string;
    characters: Array<{ emoji: string; label: string; position: 'left' | 'center' | 'right'; highlighted: boolean; floatPhase: number }>;
    isFrozen: boolean;
    isDark: boolean;
    isReveal: boolean;
}

// ── StageController ───────────────────────────────────────────────────────────

class StageController {
    private callbacks: UpdateCallback[] = [];
    private scene: SceneState | null = null;

    set(scene: SceneState | null): void {
        this.scene = scene;
        this.callbacks.forEach(cb => cb());
    }

    getScene(): SceneState | null {
        return this.scene;
    }

    onUpdate(cb: UpdateCallback): Unsub {
        this.callbacks.push(cb);
        return () => { this.callbacks = this.callbacks.filter(c => c !== cb); };
    }
}

// ── SubtitleController ────────────────────────────────────────────────────────

interface SubtitleState {
    visible: boolean;
    text: string;
    speaker: string;
    isConceptReveal: boolean;
    highlightedWords: string[];
    isBilingual: boolean;
    secondaryText: string;
}

const EMPTY_SUBTITLE: SubtitleState = {
    visible: false, text: '', speaker: '',
    isConceptReveal: false, highlightedWords: [],
    isBilingual: false, secondaryText: '',
};

class SubtitleController {
    private callbacks: UpdateCallback[] = [];
    private state: SubtitleState = { ...EMPTY_SUBTITLE };

    set(next: Partial<SubtitleState>): void {
        this.state = { ...this.state, ...next };
        this.callbacks.forEach(cb => cb());
    }

    clear(): void {
        this.set(EMPTY_SUBTITLE);
    }

    getState(): SubtitleState {
        return this.state;
    }

    onUpdate(cb: UpdateCallback): Unsub {
        this.callbacks.push(cb);
        return () => { this.callbacks = this.callbacks.filter(c => c !== cb); };
    }
}

// ── InteractionController ─────────────────────────────────────────────────────

interface InteractionUI {
    active: boolean;
    level: number;
    question: string;
    options: string[];
    selectedIndex: number | null;
    answered: boolean;
    isCorrect: boolean | null;
    feedback: string;
}

const EMPTY_INTERACTION: InteractionUI = {
    active: false, level: 0, question: '', options: [],
    selectedIndex: null, answered: false, isCorrect: null, feedback: '',
};

class InteractionController {
    private callbacks: UpdateCallback[] = [];
    private state: InteractionUI = { ...EMPTY_INTERACTION };
    private resolveAnswer: ((idx: number) => void) | null = null;
    private resolveAcknowledge: (() => void) | null = null;

    set(next: Partial<InteractionUI>): void {
        this.state = { ...this.state, ...next };
        this.callbacks.forEach(cb => cb());
    }

    clear(): void {
        this.set(EMPTY_INTERACTION);
        this.resolveAnswer = null;
        this.resolveAcknowledge = null;
    }

    getUI(): InteractionUI {
        return this.state;
    }

    submitAnswer(idx: number): void {
        if (this.resolveAnswer) {
            this.resolveAnswer(idx);
        }
    }

    acknowledge(): void {
        if (this.resolveAcknowledge) {
            this.resolveAcknowledge();
        }
    }

    waitForAnswer(): Promise<number> {
        return new Promise(resolve => {
            this.resolveAnswer = resolve;
        });
    }

    waitForAcknowledge(): Promise<void> {
        return new Promise(resolve => {
            this.resolveAcknowledge = resolve;
        });
    }

    onUpdate(cb: UpdateCallback): Unsub {
        this.callbacks.push(cb);
        return () => { this.callbacks = this.callbacks.filter(c => c !== cb); };
    }
}

// ── AudioController ───────────────────────────────────────────────────────────

class AudioController {
    private muted = false;
    private volume = 0.9;

    setMuted(muted: boolean): void { this.muted = muted; }
    setVolume(vol: number): void {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.volume === 0) this.muted = true;
    }
    isMuted(): boolean { return this.muted; }
    getVolume(): number { return this.volume; }
}

// ── StateManager ──────────────────────────────────────────────────────────────

interface RuntimeState {
    playbackState: PlaybackState;
    currentActIndex: number;
    actsCompleted: number[];
    elapsedSeconds: number;
}

class StateManager {
    private state: RuntimeState = {
        playbackState: 'idle',
        currentActIndex: 0,
        actsCompleted: [],
        elapsedSeconds: 0,
    };

    get(): RuntimeState { return this.state; }
    set(next: Partial<RuntimeState>): void {
        this.state = { ...this.state, ...next };
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function sceneTypeForAct(actType: string): string {
    const map: Record<string, string> = {
        arrival_curiosity: 'particles',
        exploration:       'wave',
        discovery:         'force',
        integration:       'journey',
        mastery:           'orbit',
    };
    return map[actType] ?? 'particles';
}

function charactersForAct(_act: ExperienceAct) {
    return [{
        emoji: '🎓',
        label: 'Narrator',
        position: 'center' as const,
        highlighted: true,
        floatPhase: 0,
    }];
}

// ── CinemaEngine ──────────────────────────────────────────────────────────────

export class CinemaEngine {
    readonly bus          = new EventBus();
    readonly stage        = new StageController();
    readonly subtitles    = new SubtitleController();
    readonly interaction  = new InteractionController();
    readonly audio        = new AudioController();
    readonly stateManager = new StateManager();

    private running = false;
    private startTime = 0;

    async run(plan: ExperiencePlan): Promise<void> {
        if (this.running) return;
        this.running = true;
        this.startTime = Date.now();

        this.stateManager.set({ playbackState: 'loading' });
        this.bus.emit({ type: 'ENGINE_STARTED', payload: { lesson_id: plan.lesson_id } });

        await sleep(400);

        try {
            for (let i = 0; i < plan.acts.length; i++) {
                if (!this.running) break;
                await this.executeAct(plan.acts[i], i, plan);
            }

            if (this.running) {
                await this.completeLesson(plan);
            }
        } catch (err) {
            console.error('[CinemaEngine] Runtime error:', err);
            this.bus.emit({ type: 'ENGINE_ERROR', payload: { error: String(err) } });
        } finally {
            this.running = false;
        }
    }

    stop(): void {
        if (!this.running) return;
        this.running = false;
        this.stateManager.set({ playbackState: 'idle' });
        this.subtitles.clear();
        this.interaction.clear();
        this.stage.set(null);
        this.bus.emit({ type: 'ENGINE_STOPPED', payload: {} });
    }

    // ── Act executor ─────────────────────────────────────────────────────────

    private async executeAct(act: ExperienceAct, index: number, plan: ExperiencePlan): Promise<void> {
        console.log(`▶ Act ${act.act_number} Started — ${act.act_type}`);

        this.stateManager.set({ playbackState: 'playing', currentActIndex: index });

        this.stage.set({
            sceneType:  sceneTypeForAct(act.act_type),
            actType:    act.act_type,
            characters: charactersForAct(act),
            isFrozen:   false,
            isDark:     act.act_type === 'discovery',
            isReveal:   false,
        });

        this.bus.emit({
            type: 'ACT_STARTED',
            payload: { act_number: act.act_number, act_type: act.act_type },
        });

        // Narration points — distribute evenly across act duration
        const pointDuration = Math.max(
            2000,
            Math.floor((act.pacing.estimated_duration_seconds * 1000) / Math.max(act.narration_points.length, 1))
        );

        for (let p = 0; p < act.narration_points.length; p++) {
            if (!this.running) return;
            const point = act.narration_points[p];
            if (!point) continue;

            // Freeze frame if scheduled
            const freeze = act.pacing.freeze_frames.find(f => f.observation_index === p);
            if (freeze) {
                const scene = this.stage.getScene();
                if (scene) this.stage.set({ ...scene, isFrozen: true });
                await sleep(freeze.duration_seconds * 1000);
                const scene2 = this.stage.getScene();
                if (scene2) this.stage.set({ ...scene2, isFrozen: false });
            }

            const isLastPoint = p === act.narration_points.length - 1;
            this.subtitles.set({
                visible: true,
                text: point,
                speaker: 'narrator',
                isConceptReveal: act.act_type === 'discovery' && isLastPoint,
                highlightedWords: [],
                isBilingual: plan.language === 'Tamil',
                secondaryText: '',
            });

            await sleep(pointDuration);
        }

        // Pre-interaction silence
        if (act.interaction) {
            const silenceBefore = act.pacing.silence_moments.find(s => s.trigger === 'pre_prediction');
            if (silenceBefore && this.running) {
                this.stateManager.set({ playbackState: 'silence' });
                this.subtitles.clear();
                await sleep(silenceBefore.duration_seconds * 1000);
            }
        }

        // Interaction
        if (act.interaction && this.running) {
            await this.executeInteraction(act, plan);
        }

        // Post-act silence
        const silencePost = act.pacing.silence_moments.find(
            s => s.trigger === 'post_reveal' || s.trigger === 'reflection'
        );
        if (silencePost && this.running) {
            this.stateManager.set({ playbackState: 'silence' });
            this.subtitles.clear();
            await sleep(silencePost.duration_seconds * 1000);
        }

        // Memory anchor — Act 5 only
        if (act.act_type === 'mastery' && this.running) {
            await this.executeMemoryAnchor(plan);
        }

        const completed = [...this.stateManager.get().actsCompleted, act.act_number];
        this.stateManager.set({ actsCompleted: completed });
        this.subtitles.clear();

        this.bus.emit({ type: 'ACT_COMPLETED', payload: { act_number: act.act_number } });
        console.log(`✓ Act ${act.act_number} Completed`);
    }

    // ── Interaction executor ──────────────────────────────────────────────────

    private async executeInteraction(act: ExperienceAct, _plan: ExperiencePlan): Promise<void> {
        const ia = act.interaction!;
        this.stateManager.set({ playbackState: 'interacting' });

        if (ia.level === 2 && ia.options && ia.options.length > 0) {
            this.interaction.set({
                active: true, level: 2,
                question: ia.question, options: ia.options,
                selectedIndex: null, answered: false, isCorrect: null, feedback: '',
            });

            const answerIdx = await this.interaction.waitForAnswer();
            const isCorrect = answerIdx === (ia.correct_index ?? 0);

            this.interaction.set({
                selectedIndex: answerIdx, answered: true,
                isCorrect,
                feedback: isCorrect ? ia.feedback_if_correct : ia.feedback_if_wrong,
            });

            await sleep(3000);

        } else {
            // Level 1 reflect (or level 3 fallback)
            this.interaction.set({
                active: true, level: ia.level,
                question: ia.question, options: [],
                selectedIndex: null, answered: false, isCorrect: null, feedback: '',
            });

            await this.interaction.waitForAcknowledge();
        }

        this.interaction.clear();
        this.stateManager.set({ playbackState: 'playing' });
        await sleep(ia.silence_after_seconds * 1000);
    }

    // ── Memory anchor executor ────────────────────────────────────────────────

    private async executeMemoryAnchor(plan: ExperiencePlan): Promise<void> {
        if (!this.running) return;

        this.bus.emit({
            type: 'MEMORY_ANCHOR_START',
            payload: { image_description: plan.memory_plan.anchor.image_description },
        });

        await sleep(plan.memory_plan.timing.anchor_sentence_silence_before * 1000);
        if (!this.running) return;

        this.bus.emit({
            type: 'MEMORY_ANCHOR_SENTENCE',
            payload: { sentence: plan.memory_plan.anchor.anchor_sentence },
        });

        await sleep(plan.memory_plan.timing.image_hold_seconds * 1000);
        if (!this.running) return;

        this.bus.emit({ type: 'MEMORY_ANCHOR_END', payload: {} });
        await sleep(plan.memory_plan.timing.anchor_sentence_silence_after * 1000);
    }

    // ── Lesson complete ───────────────────────────────────────────────────────

    private async completeLesson(plan: ExperiencePlan): Promise<void> {
        this.stateManager.set({ playbackState: 'complete' });

        this.subtitles.set({
            visible: true,
            text: `Lesson complete: ${plan.topic}`,
            speaker: 'narrator',
            isConceptReveal: false,
            highlightedWords: [],
            isBilingual: false,
            secondaryText: '',
        });

        this.bus.emit({
            type: 'LESSON_COMPLETE',
            payload: {
                lesson_id: plan.lesson_id,
                topic: plan.topic,
                elapsed_ms: Date.now() - this.startTime,
            },
        });

        console.log('🏁 Lesson Complete —', plan.topic);
    }
}
