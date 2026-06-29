import React from 'react';
import { SceneRenderProps } from './SceneFactory';

export const DefaultParticlesScene: React.FC<SceneRenderProps> = ({ tick, color, isFrozen }) => {
    const t = isFrozen ? tick * 0 : tick * 0.05;
    return (<>
        <circle cx="200" cy="128" r={20+5*Math.sin(t*0.7)} fill={color} opacity="0.1" filter="url(#f6)"/>
        <circle cx="200" cy="128" r="12" fill={color} opacity="0.75"/>
        {[0,51,103,154,205,257,308].map((deg,i) => {
            const r2 = deg*Math.PI/180 + t*0.6;
            const radius = 54+18*Math.sin(t*0.5+i*0.7);
            return (
                <circle key={i} cx={200+radius*Math.cos(r2)} cy={128+radius*0.55*Math.sin(r2)}
                    r={3.5+1.5*Math.sin(t*0.8+i)} fill={color}
                    opacity={0.38+0.3*Math.sin(t*0.6+i*0.8)}/>
            );
        })}
    </>);
};
