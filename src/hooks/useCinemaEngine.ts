/**
 * useCinemaEngine — src/hooks/useCinemaEngine.ts
 *
 * FeelEd Runtime (FRT) — React bridge.
 *
 * Uses:
 *   - Event-based updates for educational state changes (SubtitleState, etc.)
 *   - requestAnimationFrame for SVG animation tick only
 *   NOT setInterval — avoids unnecessary renders.
 *
 * Input:  LEO + StudentProfile + isFullscreen
 * Output: [PresentationModel, CinemaControls, status]
 *
 * React never touches RenderState or CinemaEngine directly.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { StudentProfile, LearningExperienceObject } from '../types';
import { CinemaEngine } from '../cinema/CinemaEngine';
import { plan as planExperience } from '../lib/experiencePlanner';
import { PresentationModel, makeLoadingPresentation } from '../cinema/presentation/PresentationModel';
import { buildFromRenderState } from '../cinema/presentation/PresentationModelBuilder';
import { RenderState, RenderStateEmitter, EMPTY_RENDER_STATE } from '../cinema/state/RenderState';

export interface CinemaControls {
    play:                  () => void;
    pause:                 () => void;
    setMuted:              (muted: boolean) => void;
    setVolume:             (vol: number) => void;
    respondToInteraction:  (answerIndex: number) => void;
    acknowledgeReflection: () => void;
}

export function useCinemaEngine(
    leo: LearningExperienceObject | null,
    profile: StudentProfile,
    isFullscreen: boolean,
    autoStart = true,
): [PresentationModel, CinemaControls, { loading: boolean; error: string | null }] {

    const engineRef   = useRef<CinemaEngine | null>(null);
    const emitterRef  = useRef<RenderStateEmitter>(new RenderStateEmitter());
    const rafRef      = useRef<number>(0);
    const animTick    = useRef(0);

    const [presentation, setPresentation] = useState<PresentationModel>(
        makeLoadingPresentation(leo?.topic ?? '', leo?.grade ?? 10)
    );
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState<string | null>(null);

    // Build PresentationModel from current RenderState + animation tick
    const publish = useCallback((rs: RenderState) => {
        if (!leo) return;
        setPresentation(
            buildFromRenderState(rs, animTick.current, isFullscreen, leo, leo.topic, leo.grade)
        );
    }, [leo, isFullscreen]);

    // requestAnimationFrame loop — only drives SVG animation tick
    // Educational state changes come from event subscriptions (more efficient)
    useEffect(() => {
        let running = true;
        function frame() {
            if (!running) return;
            animTick.current += 1;
            // Only re-publish if currently animating (playing state)
            const rs = emitterRef.current.getCurrent();
            if (rs.phase === 'narrating' || rs.phase === 'revealing') {
                publish(rs);
            }
            rafRef.current = requestAnimationFrame(frame);
        }
        rafRef.current = requestAnimationFrame(frame);
        return () => { running = false; cancelAnimationFrame(rafRef.current); };
    }, [publish]);

    // Wire CinemaEngine to RenderStateEmitter when LEO arrives
    useEffect(() => {
        if (!leo) return;
        setLoading(true);
        setError(null);

        // Build plan
        let ep;
        try { ep = planExperience(leo, profile); }
        catch (e) { setError(`Planning failed: ${String(e)}`); setLoading(false); return; }

        const engine = new CinemaEngine();
        engineRef.current = engine;
        const emitter = emitterRef.current;
        const bus = engine.bus;

        // On every meaningful engine event → snapshot → publish
        function syncAndPublish() {
            const snap = engine.stateManager.get();
            const sceneState = engine.stage.getScene();
            const subState   = engine.subtitles.getState() as any;
            const iaState    = engine.interaction.getUI() as any;

            emitter.emit({
                phase: (snap.playbackState as any),
                scene: sceneState ? {
                    sceneType:  sceneState.sceneType,
                    actPhase:   sceneState.actType as any,
                    accentColor:'',
                    characters: sceneState.characters,
                    isFrozen:   sceneState.isFrozen,
                    isDark:     sceneState.isDark,
                    isReveal:   sceneState.isReveal,
                } : null,
                subtitle: {
                    visible:         subState.visible,
                    text:            subState.text,
                    speaker:         subState.speaker,
                    isConceptReveal: subState.isConceptReveal,
                    highlightedWords:subState.highlightedWords ?? [],
                    isBilingual:     subState.isBilingual,
                    secondaryText:   subState.secondaryText,
                },
                interaction: {
                    active:        iaState.active,
                    level:         iaState.level,
                    question:      iaState.question,
                    options:       iaState.options,
                    selectedIndex: iaState.selectedIndex,
                    answered:      iaState.answered,
                    isCorrect:     iaState.isCorrect,
                    feedback:      iaState.feedback,
                },
                audio: {
                    isPlaying:     snap.playbackState === 'playing',
                    isMuted:       false,
                    volume:        0.9,
                    isSilencePhase:snap.playbackState === 'silence' as any,
                },
                progress: {
                    actIndex:     snap.currentActIndex,
                    actTotal:     5,
                    actsCompleted:snap.actsCompleted,
                    elapsedSeconds:snap.elapsedSeconds,
                },
            });

            publish(emitter.getCurrent());
        }

        // Subscribe to all renderer changes
        const unsubs = [
            engine.stage.onUpdate(syncAndPublish),
            engine.subtitles.onUpdate(syncAndPublish),
            engine.interaction.onUpdate(syncAndPublish),
            bus.onAll((e) => {
                // Memory anchor events
                if (e.type === 'MEMORY_ANCHOR_START') {
                    emitter.emit({ memory: { visible:true, imageDescription:e.payload['image_description'] as string ?? '', sentenceVisible:false, sentence:'' }});
                }
                if (e.type === 'MEMORY_ANCHOR_SENTENCE') {
                    emitter.emit({ memory: { ...emitterRef.current.getCurrent().memory, sentenceVisible:true, sentence: e.payload['sentence'] as string ?? '' }});
                }
                if (e.type === 'MEMORY_ANCHOR_END') {
                    emitter.emit({ memory: { visible:false, imageDescription:'', sentenceVisible:false, sentence:'' }});
                }
                syncAndPublish();
            }),
        ];

        setLoading(false);

        if (autoStart) {
            engine.run(ep).catch(e => setError(String(e)));
        }

        return () => {
            unsubs.forEach(fn => fn());
            engine.stop();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leo?.topic, leo?.grade, leo?.subject]);

    const controls: CinemaControls = {
        play: useCallback(() => {
            if (!engineRef.current || !leo) return;
            try {
                const ep = planExperience(leo, profile);
                engineRef.current.run(ep).catch(e => setError(String(e)));
            } catch (e) { setError(String(e)); }
        }, [leo, profile]),

        pause: useCallback(() => {
            engineRef.current?.stop();
            emitter.emit({ phase: 'idle' });
            publish(emitterRef.current.getCurrent());
        }, [publish]),

        setMuted: useCallback((muted: boolean) => {
            engineRef.current?.audio.setMuted(muted);
            emitterRef.current.emit({ audio: { ...emitterRef.current.getCurrent().audio, isMuted: muted }});
            publish(emitterRef.current.getCurrent());
        }, [publish]),

        setVolume: useCallback((vol: number) => {
            engineRef.current?.audio.setVolume(vol);
            emitterRef.current.emit({ audio: { ...emitterRef.current.getCurrent().audio, volume: vol, isMuted: vol===0 }});
            publish(emitterRef.current.getCurrent());
        }, [publish]),

        respondToInteraction: useCallback((idx: number) => {
            engineRef.current?.interaction.submitAnswer(idx);
        }, []),

        acknowledgeReflection: useCallback(() => {
            engineRef.current?.interaction.acknowledge();
        }, []),
    };

    // closure needs emitter ref (extracted for pause control)
    const emitter = emitterRef.current;

    return [presentation, controls, { loading, error }];
}
