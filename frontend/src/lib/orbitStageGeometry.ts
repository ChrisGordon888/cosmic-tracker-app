/** One projected orbital plane. Positions are decorative, never song relationships. */
export function chamberPositions(count: number, phase = 0) {
    const size = Math.min(8, Math.max(0, Math.floor(count)));
    return Array.from({ length: size }, (_, index) => {
        const angle = -Math.PI / 2 + index * Math.PI * 2 / size;
        const x = Math.cos(angle), y = Math.sin(angle);
        // Rodrigues rotation around a tilted, fixed axis: real z depth without
        // collapsing the complete ring edge-on or moving the viewing camera.
        const c = Math.cos(phase), sn = Math.sin(phase), ay = .4, az = Math.sqrt(1-ay*ay);
        const px = x*c - az*y*sn;
        const py = y*c + az*x*sn + ay*ay*y*(1-c);
        const z = -ay*x*sn + ay*az*y*(1-c);
        const perspective = 1 / (1 - z*.1);
        const depth = (z+1)/2;
        return { x:50+px*33*perspective, y:46+py*28*perspective,
            depth, scale:.84+depth*.24 };

    });
}
export function chamberConnection(x: number, y: number, energy = 0, time = 0) {
    if (energy > 0) {
        // Bounded displacement along the center connection, with exact anchored endpoints.
        return Array.from({length:25},(_,i)=>{
            const t=i/24, u=1-t;
            const px=u*u*50+2*u*t*(50+x)/2+t*t*x;
            const py=u*u*46+2*u*t*(Math.min(46,y)-7)+t*t*y;
            const ripple=Math.sin(t*Math.PI)*Math.sin(t*24-time*3)*Math.min(1,energy)*.65;
            return `${i?'L':'M'} ${px+ripple} ${py-ripple}`;
        }).join(' ');
    }
    return `M 50 46 Q ${(50 + x) / 2} ${Math.min(46, y) - 7} ${x} ${y}`;
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
/** Nearest equivalent authored orientation, without rewinding prior revolutions. */
export function centeredAngle(angle: number) {
    return Math.round(angle / (Math.PI*2)) * Math.PI*2;
}
export function horizontalDrag(dx: number, dy: number) {
    return Math.abs(dx) >= 7 && Math.abs(dx) > Math.abs(dy);
}
