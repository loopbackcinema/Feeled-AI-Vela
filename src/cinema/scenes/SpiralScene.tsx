import React from 'react';
import { SceneRenderProps } from './SceneFactory';
// TODO: Full SpiralScene implementation
const SpiralScene: React.FC<SceneRenderProps> = ({ tick, color }) => {
    const t = tick * 0.05;
    return (<>
        <circle cx="200" cy="128" r={20+5*Math.sin(t*0.7)} fill={color} opacity="0.1" filter="url(#f6)"/>
        <circle cx="200" cy="128" r="12" fill={color} opacity="0.75"/>
        {[0,60,120,180,240,300].map((deg,i) => {
            const r2 = deg*Math.PI/180 + t*0.6;
            const rad = 54+18*Math.sin(t*0.5+i*0.7);
            return <circle key={i} cx={200+rad*Math.cos(r2)} cy={128+rad*0.55*Math.sin(r2)} r={3.5+1.5*Math.sin(t*0.8+i)} fill={color} opacity={0.38+0.3*Math.sin(t*0.6+i*0.8)}/>;
        })}
    </>);
};
export default SpiralScene;
