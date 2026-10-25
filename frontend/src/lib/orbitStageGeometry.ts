/** One projected orbital plane. Positions are decorative, never song relationships. */
export function chamberPositions(count: number, phase = 0) {
    const size = Math.min(8, Math.max(0, Math.floor(count)));
    return Array.from({ length: size }, (_, index) => {
        const angle = phase + (-Math.PI / 2 + index * Math.PI * 2 / size);
        const depth = (Math.sin(angle) + 1) / 2;
        return { x: 50 + Math.cos(angle) * 37, y: 48 + Math.sin(angle) * 32,
            depth, scale: 0.88 + depth * 0.12 };
    });
}
export function chamberConnection(x: number, y: number, energy = 0, time = 0) {
    if (energy > 0) {
        // Bounded displacement along the center connection, with exact anchored endpoints.
        return Array.from({length:25},(_,i)=>{
            const t=i/24, u=1-t;
            const px=u*u*50+2*u*t*(50+x)/2+t*t*x;
            const py=u*u*48+2*u*t*(Math.min(48,y)-7)+t*t*y;
            const ripple=Math.sin(t*Math.PI)*Math.sin(t*24-time*3)*Math.min(1,energy)*.65;
            return `${i?'L':'M'} ${px+ripple} ${py-ripple}`;
        }).join(' ');
    }
    return `M 50 48 Q ${(50 + x) / 2} ${Math.min(48, y) - 7} ${x} ${y}`;
}

/** Background response, derived only from measured spectrum magnitudes. */
export function spectralRibbon(index: number, level: number, time: number) {
    return Array.from({length:33},(_,i)=>{
        const x=5+i*90/32;
        const envelope=Math.sin(i/32*Math.PI);
        const y=49+(index-3)*5 + Math.sin(i*.42-time*.7+index)*Math.min(1,Math.max(0,level))*6*envelope;
        return `${i?'L':'M'} ${x} ${y}`;
    }).join(' ');
}
export function boundedAssemblyAngle(turn: number, time: number) {
    return Math.max(-.3,Math.min(.3,turn)) + Math.sin(time*Math.PI*2/110)*.06;
}
