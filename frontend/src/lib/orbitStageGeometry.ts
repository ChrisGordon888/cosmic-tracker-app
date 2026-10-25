/** One projected orbital plane. Positions are decorative, never song relationships. */
export function chamberPositions(count: number, phase = 0) {
    const size = Math.min(8, Math.max(0, Math.floor(count)));
    return Array.from({ length: size }, (_, index) => {
        const angle = phase + (size === 1 ? -0.55 : -Math.PI / 2 + index * Math.PI * 2 / size);
        const depth = (Math.sin(angle) + 1) / 2;
        return { x: 50 + Math.cos(angle) * 37, y: 48 + Math.sin(angle) * 32,
            depth, scale: 0.88 + depth * 0.12 };
    });
}
export function chamberConnection(x: number, y: number) {
    return `M 50 48 Q ${(50 + x) / 2} ${Math.min(48, y) - 7} ${x} ${y}`;
}
