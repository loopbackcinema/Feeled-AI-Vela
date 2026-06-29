/**
 * useCinemaEngine — React hook that wires ExperiencePlan to CinemaEngine.
 *
 * Manages:
 * - CinemaEngine lifecycle (create, run, stop)
 * - Scene state subscription (stage renderer output)
 * - Subtitle state subscription
 * - Interaction state subscription
 * - Memory anchor state subscription
 * - Playback controls (play, pause, skip act)
 *
 * The hook is the bridge between React and the Cinema Engine.
 * React components never touch the engine directly.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { ExperiencePlan, StudentProfile } from '../types';
import { LearningExperienceObject } from '../types';
import { CinemaEngine } from '../cinema/CinemaEngine';
import { SceneState } from '../cinema/renderers/StageRenderer';
import { SubtitleState } from '../cinema/renderers/SubtitleRenderer';
import { InteractionUIState } from '../cinema/renderers/InteractionRenderer';
import { PlaybackState } from '../cinema/state/CinemaState';
import { plan as planExperience } from '../lib/experiencePlanner';

export interface CinemaEngineState {
    // Playback
    playback: PlaybackState;
    currentActIndex: number;
    actsCompleted: number[];
    elapsedSeconds: number;

    // Renderer outputs
    scene: SceneState | null;
    subtitle: SubtitleState | null;
    interaction: InteractionUIState | null;
    memoryAnchorVisible: boolean;
    memoryAnchorSentence: string | null;

    // Controls
    isAudioMuted: boolean;
    volume: number;

    // Status
    loading: boolean;
    error: string | null;
    lessonComplete: boolean;
}

export interface CinemaEngineControls {
    start: () => void;
    stop: () => void;
    setMuted: (muted: boolean) => void;
    setVolume: (vol: number) => void;
    skipToAct: (index: number) => void;
    respondToInteraction: (answer: string | number) => void;
}

const DEFAULT_STATE: CinemaEngineState = {
    playback: 'idle',
    currentActIndex: 0,
    actsCompleted: [],
    elapsedSeconds: 0,
    scene: null,
    subtitle: null,
    interaction: null,
    memoryAnchorVisible: false,
    memoryAnchorSentence: null,
    isAudioMuted: false,
    volume: 0.9,
    loading: false,
    error: null,
    lessonComplete: false,
};

export function useCinemaEngine(
    leo: LearningExperienceObject | null,
    studentProfile: StudentProfile,
    autoStart = true,
): [CinemaEngineState, CinemaEngineControls] {
    const engineRef = useRef<CinemaEngine | null>(null);
    const [state, setState] = useState<CinemaEngineState>(DEFAULT_STATE);
    const [plan, setPlan] = useState<ExperiencePlan | null>(null);

    // Build ExperiencePlan from LEO + profile
    useEffect(() => {
        if (!leo) return;
        try {
            const ep = planExperience(leo, studentProfile);
            setPlan(ep);
        } catch (e) {
            setState(s => ({ ...s, error: `Planning failed: ${String(e)}` }));
        }
    }, [leo, studentProfile.grade, studentProfile.language, studentProfile.strength]);

    // Create engine and subscribe to events
    useEffect(() => {
        if (!plan) return;

        const engine = new CinemaEngine();
        engineRef.current = engine;
        const bus = engine.bus;

        // Subscribe stage renderer updates
        const unsubStage = engine.stage.onUpdate(() => {
            setState(s => ({ ...s, scene: engine.stage.getScene() }));
        });

        // Subscribe subtitle renderer updates
        const unsubSub = engine.subtitles.onUpdate(() => {
            setState(s => ({ ...s, subtitle: engine.subtitles.getState() }));
        });

        // Subscribe interaction renderer updates
        const unsubInteract = engine.interaction.onUpdate(() => {
            setState(s => ({ ...s, interaction: engine.interaction.getUI() }));
        });

        // Subscribe memory renderer updates
        const unsubMem = bus.on('MEMORY_ANCHOR_START', () =>
            setState(s => ({ ...s, memoryAnchorVisible: true }))
        );
        const unsubMemSent = bus.on('MEMORY_ANCHOR_SENTENCE', (e) =>
            setState(s => ({ ...s, memoryAnchorSentence: e.payload['sentence'] as string }))
        );
        const unsubMemEnd = bus.on('MEMORY_ANCHOR_END', () =>
            setState(s => ({ ...s, memoryAnchorVisible: false, memoryAnchorSentence: null }))
        );

        // Subscribe state manager updates
        const unsubPlayback = bus.onAll((e) => {
            if (['ACT_START', 'ACT_END', 'INTERACTION_START', 'INTERACTION_END',
                 'SILENCE_START', 'SILENCE_END', 'LESSON_COMPLETE'].includes(e.type)) {
                const snap = engine.stateManager.get();
                setState(s => ({
                    ...s,
                    playback: snap.playbackState,
                    currentActIndex: snap.currentActIndex,
                    actsCompleted: snap.actsCompleted,
                    elapsedSeconds: snap.elapsedSeconds,
                    lessonComplete: e.type === 'LESSON_COMPLETE',
                }));
            }
        });

        return () => {
            unsubStage();
            unsubSub();
            unsubInteract();
            unsubMem();
            unsubMemSent();
            unsubMemEnd();
            unsubPlayback();
            engine.stop();
        };
    }, [plan]);

    // Auto-start when plan is ready
    useEffect(() => {
        if (!plan || !engineRef.current || !autoStart) return;
        setState(s => ({ ...s, loading: false, error: null }));
        engineRef.current.run(plan).catch(e => {
            setState(s => ({ ...s, error: String(e) }));
        });
    }, [plan, autoStart]);

    const controls: CinemaEngineControls = {
        start: useCallback(() => {
            if (!plan || !engineRef.current) return;
            engineRef.current.run(plan).catch(e =>
                setState(s => ({ ...s, error: String(e) }))
            );
        }, [plan]),

        stop: useCallback(() => {
            engineRef.current?.stop();
            setState(s => ({ ...s, playback: 'idle' }));
        }, []),

        setMuted: useCallback((muted: boolean) => {
            engineRef.current?.audio.setMuted(muted);
            setState(s => ({ ...s, isAudioMuted: muted }));
        }, []),

        setVolume: useCallback((vol: number) => {
            engineRef.current?.audio.setVolume(vol);
            setState(s => ({ ...s, volume: vol }));
        }, []),

        skipToAct: useCallback((_index: number) => {
            // Future: implement act navigation
            // For now: stop and restart from act index
        }, []),

        respondToInteraction: useCallback((answer: string | number) => {
            engineRef.current?.bus.emit('INTERACTION_RESPONSE', { answer });
        }, []),
    };

    return [state, controls];
}
