import React from 'react';
import { SceneRenderProps } from './SceneFactory';
const OrbitScene: React.FC<SceneRenderProps> = ({ tick, color, isFrozen, isReveal }) => {
    const t = isFrozen ? 0 : tick * 0.05;
    const a1 = t*0.9, a2 = t*0.55;
    return (<>
        <circle cx="200" cy="128" r={15+2*Math.sin(t*0.8)} fill={color} opacity="0.95" filter="url(#f3)"/>
        <circle cx="200" cy="128" r="12" fill={color} opacity="0.95"/>
        {isReveal && <circle cx="200" cy="128" r="28" fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.3" filter="url(#f6)"/>}
        <ellipse cx="200" cy="128" rx="78" ry="38" fill="none" stroke={color} strokeWidth="0.9" strokeOpacity="0.3" strokeDasharray="4 4"/>
        <circle cx={200+78*Math.cos(a1)} cy={128+38*Math.sin(a1)} r="9" fill="white" opacity="0.92"/>
        <ellipse cx="200" cy="128" rx="118" ry="55" fill="none" stroke="#60a5fa" strokeWidth="0.8" strokeOpacity="0.2" strokeDasharray="4 4"/>
        <circle cx={200+118*Math.cos(-a2)} cy={128+55*Math.sin(-a2)} r="6" fill="#f43f5e" opacity="0.88"/>
        {isReveal && <text x="200" y="215" fill={color} fontSize="10" textAnchor="middle" fontFamily="ui-monospace,monospace">F = GMm/r²</text>}
    </>);
};
export default OrbitScene;
