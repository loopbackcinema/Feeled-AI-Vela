/**
 * StageLayer — src/components/cinema/StageLayer.tsx
 *
 * Pure SVG renderer. Zero logic.
 * Input:  ScenePresentation
 * Output: SVG stage visual
 *
 * Rule: No if/else on topic keywords here.
 *       sceneId drives which visual to render — set by PresentationModelBuilder.
 */
import React from 'react';
import { ScenePresentation, CharacterPresentation } from '../../cinema/presentation/PresentationModel';

interface Props {
    scene: ScenePresentation;
}

// ── Character positions ───────────────────────────────────────────────────────
const POSITION_X: Record<CharacterPresentation['position'], number> = {
    left: 88,
    center: 200,
    right: 312,
};

function CharacterNode({ char, tick }: { char: CharacterPresentation; tick: number }) {
    const x = POSITION_X[char.position];
    const fy = Math.sin(tick * 0.05 * 0.7 + char.floatPhase) * 7;
    const sz = 46;
    return (
        <g>
            {char.highlighted && (
                <circle
                    cx={x} cy={155 + fy} r={sz * 0.78}
                    fill="none" stroke={char.highlighted ? '#f0abfc' : 'transparent'}
                    strokeWidth="1.5"
                    strokeOpacity={0.38 + 0.26 * Math.sin(tick * 0.05 * 0.7)}
                    filter="url(#sl-blur3)"
                />
            )}
            <text
                x={x} y={155 + fy + sz * 0.38}
                fontSize={sz} textAnchor="middle"
                style={{ userSelect: 'none' }}
            >
                {char.emoji}
            </text>
            {char.label && (
                <text
                    x={x} y={155 + fy + sz * 0.38 + 14}
                    fontSize={9} textAnchor="middle"
                    fill="#94a3b8" opacity={0.55}
                    style={{ userSelect: 'none' }}
                >
                    {char.label}
                </text>
            )}
        </g>
    );
}

// ── Scene visuals by sceneId ──────────────────────────────────────────────────
function SceneVisual({ sceneId, accentColor, tick }: {
    sceneId: string;
    accentColor: string;
    tick: number;
}) {
    const t = tick * 0.05;
    const c = accentColor;

    // Force / Newton
    if (sceneId === 'physics_force') {
        const ox = 185 + 16 * Math.sin(t * 0.7);
        const fl = 60 + 14 * Math.sin(t * 0.8);
        return (
            <>
                <line x1="60" y1="193" x2="340" y2="193" stroke="#1e293b" strokeWidth="1.5" />
                <rect x={ox - 24} y="163" width="48" height="28" rx="6"
                    fill={`${c}14`} stroke={c} strokeWidth="1.8" />
                <text x={ox} y="181" fill={c} fontSize="11" textAnchor="middle" fontWeight="bold">m</text>
                <line x1={ox - fl - 26} y1="177" x2={ox - 26} y2="177"
                    stroke={c} strokeWidth="3.5" markerEnd="url(#sl-ar)" />
                <line x1={ox - fl - 26} y1="177" x2={ox - 26} y2="177"
                    stroke={c} strokeWidth="9" filter="url(#sl-blur3)" opacity="0.18" />
                <text x={ox - fl / 2 - 26} y="166" fill={c} fontSize="12" textAnchor="middle" fontWeight="bold">F</text>
                <line x1={ox + 28} y1="177" x2={ox + 78} y2="177"
                    stroke="#60a5fa" strokeWidth="2.5" markerEnd="url(#sl-ar2)" strokeDasharray="5 3" />
                <text x={ox + 54} y="166" fill="#60a5fa" fontSize="10" textAnchor="middle">a</text>
                <rect x="132" y="206" width="136" height="26" rx="7"
                    fill="rgba(0,0,10,.75)" stroke={c} strokeWidth="1.2" strokeOpacity="0.45" />
                <text x="200" y="223" fill="#f0abfc" fontSize="14" textAnchor="middle"
                    fontFamily="ui-monospace,monospace" fontWeight="bold">F = ma</text>
            </>
        );
    }

    // Wave / Light
    if (sceneId === 'physics_wave') {
        const w1 = Array.from({ length: 24 }, (_, j) =>
            `${22 + j * 15},${112 + Math.sin(j * 0.52 + t * 1.2) * 32}`).join(' ');
        const w2 = Array.from({ length: 24 }, (_, j) =>
            `${22 + j * 15},${162 + Math.sin(j * 0.52 + t * 1.2 + Math.PI) * 20}`).join(' ');
        return (
            <>
                <polyline points={w1} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
                <polyline points={w1} fill="none" stroke="#34d399" strokeWidth="7" filter="url(#sl-blur3)" opacity="0.16" />
                <polyline points={w2} fill="none" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" opacity="0.55" />
                <line x1="22" y1="200" x2="77" y2="200" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="22" y1="197" x2="22" y2="203" stroke="#6ee7b7" strokeWidth="1" />
                <line x1="77" y1="197" x2="77" y2="203" stroke="#6ee7b7" strokeWidth="1" />
                <text x="50" y="213" fill="#6ee7b7" fontSize="10" textAnchor="middle">λ</text>
                <rect x="132" y="216" width="136" height="24" rx="7"
                    fill="rgba(0,0,10,.75)" stroke="#34d399" strokeWidth="1" strokeOpacity="0.4" />
                <text x="200" y="232" fill="#86efac" fontSize="11" textAnchor="middle"
                    fontFamily="ui-monospace,monospace">v = fλ</text>
            </>
        );
    }

    // Cell biology / Photosynthesis
    if (sceneId === 'biology_cell') {
        const b = 1 + 0.04 * Math.sin(t * 0.9);
        return (
            <g transform={`translate(200,128) scale(${b})`}>
                <ellipse cx="0" cy="0" rx="88" ry="64"
                    fill="rgba(52,211,153,0.05)" stroke="#34d399" strokeWidth="2" />
                <ellipse cx="8" cy="-5" rx="30" ry="22"
                    fill="rgba(134,239,172,0.1)" stroke="#86efac" strokeWidth="1.5" />
                <text x="8" y="-1" fill="#86efac" fontSize="7" textAnchor="middle" opacity="0.65">nucleus</text>
                {[[-46, 22], [-56, -9], [36, 30], [48, -18]].map(([ox, oy], i) => (
                    <ellipse key={i} cx={ox} cy={oy} rx="9" ry="5"
                        fill="rgba(251,146,60,0.5)"
                        opacity={0.5 + 0.3 * Math.sin(t + i * 0.9)} />
                ))}
                {[[-30, -36], [20, -30], [-60, 4]].map(([ox, oy], i) => (
                    <ellipse key={i} cx={ox} cy={oy} rx="8" ry="5"
                        fill="rgba(34,197,94,0.6)"
                        opacity={0.5 + 0.3 * Math.sin(t * 1.1 + i)} />
                ))}
                <ellipse cx="30" cy="18" rx="16" ry="12"
                    fill="rgba(96,165,250,0.14)" stroke="#60a5fa" strokeWidth="0.8" />
            </g>
        );
    }

    // Chemistry
    if (sceneId === 'chemistry_molecule') {
        const w = Math.sin(t * 0.8) * 5;
        return (
            <>
                {([[200, 126, '#f43f5e', 14, 'O'], [154, 157, '#60a5fa', 12, 'H'], [246, 157, '#60a5fa', 12, 'H']] as [number, number, string, number, string][])
                    .map(([ax, ay, ac, r, lb], i) => (
                        <g key={i}>
                            <line x1="200" y1={126 + w} x2={ax} y2={Number(ay) + w}
                                stroke="#64748b" strokeWidth="2.5" opacity={i > 0 ? 0.7 : 0} />
                            <circle cx={ax} cy={Number(ay) + w} r={r}
                                fill={String(ac)} opacity="0.9" filter="url(#sl-blur3)" />
                            <text x={ax} y={Number(ay) + w + 4} fill="white"
                                fontSize="9" textAnchor="middle" fontWeight="bold">{lb}</text>
                        </g>
                    ))}
                <rect x="132" y="210" width="136" height="24" rx="7"
                    fill="rgba(0,0,10,.75)" stroke={c} strokeWidth="1" strokeOpacity="0.4" />
                <text x="200" y="226" fill="#f0abfc" fontSize="11"
                    textAnchor="middle" fontFamily="ui-monospace,monospace">H₂O</text>
            </>
        );
    }

    // Gravity / Orbits
    if (sceneId === 'physics_gravity') {
        const a1 = t * 0.9, a2 = t * 0.55;
        return (
            <>
                <circle cx="200" cy="128" r={15 + 2 * Math.sin(t * 0.8)}
                    fill="#fbbf24" opacity="0.95" filter="url(#sl-blur3)" />
                <circle cx="200" cy="128" r="12" fill="#fcd34d" />
                <ellipse cx="200" cy="128" rx="78" ry="38"
                    fill="none" stroke={c} strokeWidth="0.9" strokeOpacity="0.3" strokeDasharray="4 4" />
                <circle cx={200 + 78 * Math.cos(a1)} cy={128 + 38 * Math.sin(a1)}
                    r="9" fill="#60a5fa" filter="url(#sl-blur3)" />
                <ellipse cx="200" cy="128" rx="118" ry="55"
                    fill="none" stroke="#60a5fa" strokeWidth="0.8" strokeOpacity="0.2" strokeDasharray="4 4" />
                <circle cx={200 + 118 * Math.cos(-a2)} cy={128 + 55 * Math.sin(-a2)}
                    r="6" fill="#f43f5e" filter="url(#sl-blur3)" />
                <text x="200" y="213" fill="#fcd34d" fontSize="10"
                    textAnchor="middle" fontFamily="ui-monospace,monospace">F = GMm/r²</text>
            </>
        );
    }

    // Electricity
    if (sceneId === 'physics_electricity') {
        const flow = (tick * 2) % 240;
        const glow = 0.3 + 0.6 * Math.abs(Math.sin(t * 2));
        return (
            <>
                <rect x="80" y="88" width="240" height="108" rx="8"
                    fill="none" stroke="#1e293b" strokeWidth="2" />
                <rect x="80" y="128" width="4" height="28" fill="#fbbf24" />
                <rect x="88" y="122" width="4" height="40" fill="#fbbf24" opacity="0.6" />
                {Array.from({ length: 6 }, (_, i) => (
                    <line key={i}
                        x1={198 + i * 8} y1={i % 2 === 0 ? 88 : 78}
                        x2={206 + i * 8} y2={i % 2 === 0 ? 78 : 88}
                        stroke={c} strokeWidth="2" />
                ))}
                <circle cx="320" cy="142" r="18"
                    fill={`rgba(251,191,36,${glow * 0.12})`}
                    stroke="#fbbf24" strokeWidth="1.5" opacity={glow} />
                <circle cx="320" cy="142" r="10"
                    fill="#fde68a" filter="url(#sl-blur3)" opacity={glow * 0.7} />
                <circle cx={80 + flow} cy="88" r="5"
                    fill="#60a5fa" opacity="0.9" filter="url(#sl-blur3)" />
                <text x="200" y="222" fill="#94a3b8" fontSize="10" textAnchor="middle">V = IR</text>
            </>
        );
    }

    // Thermodynamics
    if (sceneId === 'physics_thermo') {
        const heat = 0.5 + 0.5 * Math.sin(t * 0.8);
        return (
            <>
                <rect x="118" y="88" width="162" height="128" rx="8"
                    fill={`rgba(251,113,133,${0.04 + heat * 0.08})`}
                    stroke="#f43f5e" strokeWidth="1.5" />
                {Array.from({ length: 12 }, (_, i) => {
                    const px = 128 + ((i * 37 + tick * (1 + heat) * 2) % 142);
                    const py = 98 + ((i * 29 + tick * (1 + heat) * 1.5) % 108);
                    return <circle key={i} cx={px} cy={py} r={3 + heat * 2}
                        fill={c} opacity={0.5 + heat * 0.4} />;
                })}
                <rect x="294" y="98" width="12" height="98" rx="6"
                    fill="rgba(10,0,22,.7)" stroke="#334155" strokeWidth="1" />
                <rect x="294" y={196 - heat * 88} width="12" height={heat * 88 + 10}
                    rx="6" fill="#f43f5e" />
                <text x="200" y="238" fill={c} fontSize="11"
                    textAnchor="middle" fontFamily="ui-monospace,monospace">ΔU = Q − W</text>
            </>
        );
    }

    // Mathematics
    if (sceneId === 'mathematics_graph') {
        const pts = Array.from({ length: 40 }, (_, i) => {
            const x = -4 + i * 0.2;
            return `${50 + i * 7.5},${238 - x * x * 8}`;
        }).join(' ');
        const movI = tick % 40;
        const mx = -4 + movI * 0.2;
        return (
            <>
                <line x1="50" y1="238" x2="340" y2="238"
                    stroke="#1e293b" strokeWidth="1.5" markerEnd="url(#sl-ar)" />
                <line x1="50" y1="238" x2="50" y2="68"
                    stroke="#1e293b" strokeWidth="1.5" markerEnd="url(#sl-ar)" />
                <polyline points={pts} fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
                <polyline points={pts} fill="none" stroke={c} strokeWidth="7"
                    filter="url(#sl-blur3)" opacity="0.13" />
                <circle cx={50 + movI * 7.5} cy={238 - mx * mx * 8} r="5"
                    fill="#fbbf24" filter="url(#sl-blur3)" />
                <text x="200" y="215" fill={c} fontSize="12"
                    textAnchor="middle" fontFamily="ui-monospace,monospace">y = x²</text>
            </>
        );
    }

    // Default — elegant orbiting particles
    return (
        <>
            <circle cx="200" cy="128" r={20 + 5 * Math.sin(t * 0.7)}
                fill={c} opacity="0.1" filter="url(#sl-blur6)" />
            <circle cx="200" cy="128" r="12" fill={c} opacity="0.75" />
            {[0, 51, 103, 154, 205, 257, 308].map((deg, i) => {
                const r2 = deg * Math.PI / 180 + t * 0.6;
                const rad = 54 + 18 * Math.sin(t * 0.5 + i * 0.7);
                return (
                    <circle key={i}
                        cx={200 + rad * Math.cos(r2)}
                        cy={128 + rad * 0.55 * Math.sin(r2)}
                        r={3.5 + 1.5 * Math.sin(t * 0.8 + i)}
                        fill={c}
                        opacity={0.38 + 0.3 * Math.sin(t * 0.6 + i * 0.8)} />
                );
            })}
        </>
    );
}

// ── StageLayer ────────────────────────────────────────────────────────────────
const StageLayer: React.FC<Props> = ({ scene }) => {
    const { background, accentColor, sceneId, characters, animationTick, isDark, isReveal } = scene;

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            background,
            opacity: isDark ? 0.4 : 1,
            transition: 'opacity 0.6s ease, background 0.8s ease',
        }}>
            <svg
                viewBox="0 0 400 280"
                width="100%"
                height="100%"
                style={{ position: 'absolute', inset: 0 }}
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <radialGradient id="sl-radial" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={accentColor} stopOpacity="0.14" />
                        <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
                    </radialGradient>
                    <filter id="sl-blur3"><feGaussianBlur stdDeviation="3" /></filter>
                    <filter id="sl-blur6"><feGaussianBlur stdDeviation="6" /></filter>
                    <marker id="sl-ar" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                        <polygon points="0 0,8 3,0 6" fill={accentColor} />
                    </marker>
                    <marker id="sl-ar2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                        <polygon points="0 0,8 3,0 6" fill="#60a5fa" />
                    </marker>
                </defs>

                {/* Ambient glow */}
                <ellipse cx="200" cy="135" rx="180" ry="112"
                    fill="url(#sl-radial)"
                    opacity={0.5 + 0.12 * Math.sin(animationTick * 0.05)} />

                {/* Stars */}
                {[[25,20],[378,35],[10,202],[390,182],[200,10],[92,48],[318,55],[48,145],[345,135]].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r={0.7 + (i % 3) * 0.4} fill="white"
                        opacity={0.15 + 0.28 * Math.sin(animationTick * 0.05 * 1.1 + i * 1.3)} />
                ))}

                {/* Scene visual */}
                <SceneVisual
                    sceneId={sceneId}
                    accentColor={accentColor}
                    tick={animationTick}
                />

                {/* Characters */}
                {characters.map((char, i) => (
                    <CharacterNode key={i} char={char} tick={animationTick} />
                ))}

                {/* Reveal flash */}
                {isReveal && (
                    <rect x="0" y="0" width="400" height="280"
                        fill={accentColor}
                        opacity={0.06 + 0.04 * Math.sin(animationTick * 0.05 * 3)}
                    />
                )}
            </svg>

            {/* Theatre curtains */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9 }}>
                {[{ side: 'left' as const }, { side: 'right' as const }].map(({ side }, i) => (
                    <div key={i} style={{
                        position: 'absolute', top: 0, bottom: 0, [side]: 0, width: '5%',
                        background: `linear-gradient(${i ? 270 : 90}deg,#3d0a0e,#7f1d1d 62%,transparent)`,
                        boxShadow: `inset ${i ? '' : '-'}11px 0 18px rgba(0,0,0,.55)`,
                    }} />
                ))}
                {/* Corner frames */}
                {[{ top: 5, left: 5 }, { top: 5, right: 5 }, { bottom: 5, left: 5 }, { bottom: 5, right: 5 }].map((p, i) => (
                    <div key={i} style={{
                        position: 'absolute', ...p, width: 15, height: 15,
                        borderTop: i < 2 ? '2px solid #facc15' : undefined,
                        borderBottom: i >= 2 ? '2px solid #facc15' : undefined,
                        borderLeft: i % 2 === 0 ? '2px solid #facc15' : undefined,
                        borderRight: i % 2 === 1 ? '2px solid #facc15' : undefined,
                    }} />
                ))}
            </div>
        </div>
    );
};

export default StageLayer;
