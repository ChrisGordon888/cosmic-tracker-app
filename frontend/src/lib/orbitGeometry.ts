/** Percent geometry shared by SVG paths and DOM nodes; independent of viewport size. */
export function orbitPositions(count: number) {
    return Array.from({ length: Math.min(8, Math.max(0, count)) }, (_, index) => {
        const radius = count > 4 && index % 2 ? 31 : 39;
        const angle = (-45 + index * 360 / Math.max(1, Math.min(count, 8))) * Math.PI / 180;
        return { x: 50 + Math.cos(angle) * radius, y: 50 + Math.sin(angle) * radius, radius };
    });
}
