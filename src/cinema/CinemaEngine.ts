/**
 * CinemaEngine — src/cinema/CinemaEngine.ts
 *
 * Stub implementation — V2 scaffold.
 * Provides the API surface useCinemaEngine expects.
 * No real playback yet — engine runs a minimal idle loop.
 *
 * API surface (from useCinemaEngine):
 *   engine.bus           — event bus
 *   engine.stage         — scene renderer
 *   engine.subtitles     — subtitle controller
 *   engine.interaction   — interaction controller
 *   engine.audio         — audio controller
 *   engine.stateManager  — mutable runtime state
 *   engine.run(ep)       — start playback → Promise<void>
 *   engine.stop()        — halt playback
 *
 * Engineering rule: "Working first. Stable second. Beautiful third."
 */

import { ExperiencePlan } from '../types';

// ── Types ─────────────────────────────────────────────────────────────────────

type Unsub = () => void;
type UpdateCallback = () => void;

export interface BusEvent {
    type: string;
    payload: Record<string, unknown>;
}

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

// ── StageController ───────────────────────────────────────────────────────────

class StageController {
    private callbacks: UpdateCallback[] = [];

    getScene(): null {
        return null;
    }

    onUpdate(cb: UpdateCallback): Unsub {
        this.callbacks.push(cb);
        return () => { this.callbacks = this.callbacks.filter(c => c !== cb); };
    }

    notify(): void {
        this.callbacks.forEach(cb => cb());
    }
}

// ── SubtitleController ────────────────────────────────────────────────────────

class SubtitleController {
    private callbacks: UpdateCallback[] = [];

    getState() {
        return {
            visible: false,
            text: '',
            speaker: '',
            isConceptReveal: false,
            highlightedWords: [] as string[],
            isBilingual: false,
            secondaryText: '',
        };
    }

    onUpdate(cb: UpdateCallback): Unsub {
        this.callbacks.push(cb);
        return () => { this.callbacks = this.callbacks.filter(c => c !== cb); };
    }

    notify(): void {
        this.callbacks.forEach(cb => cb());
    }
}

// ── InteractionController ─────────────────────────────────────────────────────

class InteractionController {
    private callbacks: UpdateCallback[] = [];

    getUI() {
        return {
            active: false,
            level: 0,
            question: '',
            options: [] as string[],
            selectedIndex: null as number | null,
            answered: false,
            isCorrect: null as boolean | null,
            feedback: '',
        };
    }

    submitAnswer(_idx: number): void {
        // stub
    }

    acknowledge(): void {
        // stub
    }

    onUpdate(cb: UpdateCallback): Unsub {
        this.callbacks.push(cb);
        return () => { this.callbacks = this.callbacks.filter(c => c !== cb); };
    }

    notify(): void {
        this.callbacks.forEach(cb => cb());
    }
}

// ── AudioController ───────────────────────────────────────────────────────────

class AudioController {
    setMuted(_muted: boolean): void {
        // stub
    }

    setVolume(_vol: number): void {
        // stub
    }
}

// ── StateManager ──────────────────────────────────────────────────────────────

export type PlaybackState =
    | 'idle'
    | 'loading'
    | 'playing'
    | 'paused'
    | 'silence'
    | 'interacting'
    | 'complete';

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

    get(): RuntimeState {
        return this.state;
    }

    set(next: Partial<RuntimeState>): void {
        this.state = { ...this.state, ...next };
    }
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

    async run(_plan: ExperiencePlan): Promise<void> {
        if (this.running) return;
        this.running = true;
        this.stateManager.set({ playbackState: 'playing', currentActIndex: 0 });
        this.bus.emit({ type: 'ENGINE_STARTED', payload: {} });
        // Stub: engine stays in 'playing' state — real act sequencing comes in V2
    }

    stop(): void {
        if (!this.running) return;
        this.running = false;
        this.stateManager.set({ playbackState: 'idle' });
        this.bus.emit({ type: 'ENGINE_STOPPED', payload: {} });
    }
}
