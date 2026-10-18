'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { livingUniverse } from '@/lib/livingUniverse';
type Universe = ReturnType<typeof livingUniverse>;
type Props = { universe: Universe; selectedId: string; onSelect: (id: string) => void; onFailure: () => void; reduced: boolean; overview: number; onPath?: (a: string, b: string) => void };

/** One renderer per mount. Data reconciliation never replaces the camera or controls. */
export default function UniverseScene(props: Props) {
    const host = useRef<HTMLDivElement>(null), current = useRef(props);
    useEffect(() => { current.current = props; });
    useEffect(() => {
        const mounted = host.current; if (!mounted) return; const element: HTMLDivElement = mounted;
        let renderer: THREE.WebGLRenderer;
        try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }); }
        catch { current.current.onFailure(); return; }
        let disposed = false, frame = 0, dirty = true, visible = true, lastFrame = 0;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); renderer.setClearColor(0x071322, 0); renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.domElement.setAttribute('aria-label', 'Musical universe. Drag to orbit, scroll to zoom. Song and connection buttons provide keyboard access.');
        element.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const environment = new RoomEnvironment(), generator = new THREE.PMREMGenerator(renderer), environmentMap = generator.fromScene(environment, .04);
        scene.environment = environmentMap.texture; environment.dispose(); generator.dispose();
        const camera = new THREE.PerspectiveCamera(42, 1, .1, 200); camera.position.set(0, 4, 40);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = false; controls.enablePan = false; controls.enableZoom = true;
        controls.minDistance = 9; controls.maxDistance = 75; controls.minPolarAngle = .3; controls.maxPolarAngle = Math.PI - .3;
        controls.rotateSpeed = .65; controls.zoomSpeed = .7;
        scene.add(new THREE.HemisphereLight(0xdcefff, 0x142644, 3));
        const key = new THREE.DirectionalLight(0xc7e8ff, 5); key.position.set(4, 12, 10); scene.add(key);
        const rim = new THREE.PointLight(0x729cdc, 80, 55); rim.position.set(-9, 4, -8); scene.add(rim);
        const layer = document.createElement('div'); layer.className = 'universe-label-layer'; element.appendChild(layer);
        type Node = { group: THREE.Group; base: THREE.Vector3; target: THREE.Vector3; face: THREE.MeshStandardMaterial; halo: THREE.MeshBasicMaterial; label: HTMLButtonElement; artwork?: string | null; texture: THREE.Texture; source: Universe['nodes'][number] };
        const nodes = new Map<string, Node>();
        type Path = { edge: Universe['edges'][number]; curve: THREE.QuadraticBezierCurve3; mesh: THREE.Mesh<THREE.TubeGeometry, THREE.MeshBasicMaterial>; hit: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>; spark: THREE.Mesh; label: HTMLButtonElement; lastA: THREE.Vector3; lastB: THREE.Vector3 };
        let paths: Path[] = [], model: Universe | null = null, pathKey = '', lastFocus = '', lastScale = '', lastContext = '', lastQuiet = false, activated = 0;
        let lastOverview = current.current.overview;
        let transition = false; const destination = camera.position.clone(), target = controls.target.clone();
        const cameras = new Map<string, { position: THREE.Vector3; target: THREE.Vector3 }>();
        const focusOffset = new THREE.Vector3();
        const free = (object: THREE.Object3D) => object.traverse(o => { const mesh = o as THREE.Mesh; mesh.geometry?.dispose(); if (mesh.material) (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(m => m.dispose()); });
        const monogram = (title: string) => {
            const c = document.createElement('canvas'); c.width = c.height = 256; const ctx = c.getContext('2d')!;
            const gradient = ctx.createLinearGradient(0, 0, 256, 256); gradient.addColorStop(0, '#c4cbd2'); gradient.addColorStop(1, '#151b26'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 256, 256);
            ctx.strokeStyle = '#d8ecff66'; for (let r = 35; r < 180; r += 13) { ctx.beginPath(); ctx.arc(128, 128, r, 0, Math.PI * 2); ctx.stroke(); }
            ctx.fillStyle = '#f3f6ff'; ctx.font = '500 86px serif'; ctx.textAlign = 'center'; ctx.fillText(title.slice(0, 1).toUpperCase(), 128, 155);
            const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace; return texture;
        };
        function reconcile(next: Universe) {
            const ids = new Set(next.nodes.map(n => n.id));
            for (const [id, n] of nodes) if (!ids.has(id)) { scene.remove(n.group); free(n.group); n.texture.dispose(); n.label.remove(); nodes.delete(id); }
            for (const source of next.nodes) {
                let n = nodes.get(source.id);
                if (!n) {
                    const group = new THREE.Group(); group.position.fromArray(source.position); scene.add(group);
                    const shell = new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.08, .2, 48), new THREE.MeshStandardMaterial({ color: 0xa4b7c8, metalness: .85, roughness: .26 })); shell.rotation.x = Math.PI / 2; group.add(shell);
                    const texture = monogram(source.title), face = new THREE.MeshStandardMaterial({ map: texture, roughness: .48, metalness: .15, emissive: new THREE.Color(source.color), emissiveIntensity: .08 });
                    const sleeve = new THREE.Mesh(new THREE.PlaneGeometry(1.52, 1.52), face); sleeve.position.z = .12; group.add(sleeve);
                    const halo = new THREE.MeshBasicMaterial({ color: source.color, transparent: true, opacity: .6 }); const ring = new THREE.Mesh(new THREE.TorusGeometry(1.22, .025, 6, 64), halo); ring.position.z = .11; group.add(ring);
                    shell.userData.trackId = sleeve.userData.trackId = source.id;
                    const label = document.createElement('button'); label.type = 'button'; label.className = 'universe-song-label'; label.onclick = () => current.current.onSelect(source.id); layer.appendChild(label);
                    n = { group, base: new THREE.Vector3(...source.position), target: new THREE.Vector3(...source.position), face, halo, label, texture, source }; nodes.set(source.id, n);
                }
                n.source = source; n.base.fromArray(source.position); n.label.textContent = source.title; n.label.title = `${source.title} · ${source.realmName}`; n.label.style.borderColor = source.color; n.halo.color.set(source.color); n.face.emissive.set(source.color);
                if (n.artwork !== source.artwork) {
                    n.artwork = source.artwork;
                    if (source.artwork && (/^https?:\/\//.test(source.artwork) || /^\/(?!\/)/.test(source.artwork))) {
                        const owner = n, requested = source.artwork;
                        new THREE.TextureLoader().load(requested, texture => { if (disposed || nodes.get(source.id) !== owner || owner.artwork !== requested) { texture.dispose(); return; } texture.colorSpace = THREE.SRGBColorSpace; owner.texture.dispose(); owner.texture = texture; owner.face.map = texture; owner.face.needsUpdate = true; dirty = true; }, undefined, () => {});
                    } else {
                        n.texture.dispose(); n.texture = monogram(source.title); n.face.map = n.texture; n.face.needsUpdate = true;
                    }
                }
            }
            const signature = JSON.stringify(next.edges.map(e => [e.a, e.b, e.kind, e.strong]));
            if (signature !== pathKey) {
                paths.forEach(p => { scene.remove(p.mesh, p.hit, p.spark); free(p.mesh); free(p.hit); free(p.spark); p.label.remove(); }); pathKey = signature;
                paths = next.edges.map(edge => {
                    const a = nodes.get(edge.a)!.group.position.clone(), b = nodes.get(edge.b)!.group.position.clone();
                    const curve = new THREE.QuadraticBezierCurve3(a, a.clone().lerp(b, .5).add(new THREE.Vector3(0, 2, 0)), b);
                    const material = new THREE.MeshBasicMaterial({ color: edge.kind === 'authored' ? '#ffffff' : nodes.get(edge.a)!.source.color, transparent: true, opacity: .5, depthWrite: false });
                    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, .03, 5, false), material);
                    const hit = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); hit.userData.path = [edge.a, edge.b];
                    const spark = new THREE.Mesh(new THREE.SphereGeometry(.075, 8, 6), new THREE.MeshBasicMaterial({ color: '#e8f7ff' }));
                    const label = document.createElement('button'); label.type = 'button'; label.className = 'universe-path-label';
                    label.textContent = edge.kind === 'authored' ? 'Your Path' : edge.strong ? 'Shared signals' : 'Tentative signals';
                    label.setAttribute('aria-label', `${label.textContent}: ${nodes.get(edge.a)!.source.title} to ${nodes.get(edge.b)!.source.title}`); label.onclick = () => current.current.onPath?.(edge.a, edge.b); layer.appendChild(label); scene.add(mesh, hit, spark);
                    return { edge, curve, mesh, hit, spark, label, lastA: new THREE.Vector3(Infinity, 0, 0), lastB: new THREE.Vector3(Infinity, 0, 0) };
                });
            }
            model = next; dirty = true;
        }
        function frameView() {
            const bounds = new THREE.Box3(); nodes.forEach(n => bounds.expandByPoint(n.base));
            const center = nodes.size ? bounds.getCenter(new THREE.Vector3()) : new THREE.Vector3();
            const size = nodes.size ? bounds.getSize(new THREE.Vector3()) : new THREE.Vector3(12, 8, 8);
            const distance = Math.min(65, Math.max(20, Math.max(size.y + 7, (size.x + 7) / Math.max(.5, camera.aspect)) / .7 + size.z / 2));
            return { position: center.clone().add(new THREE.Vector3(0, 3, distance)), target: center };
        }
        const resize = () => { const { width, height } = element.getBoundingClientRect(); renderer.setSize(width, height); camera.aspect = width / Math.max(1, height); camera.updateProjectionMatrix(); dirty = true; };
        const observer = new ResizeObserver(resize); observer.observe(element); resize();
        const intersection = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? true; dirty = true; }); intersection.observe(element);
        const userMove = () => { transition = false; dirty = true; };
        controls.addEventListener('start', userMove); controls.addEventListener('change', () => { dirty = true; });
        const ray = new THREE.Raycaster(); ray.params.Line = { threshold: .45 }; const pointer = new THREE.Vector2(); let down = [0, 0];
        const pointerDown = (e: PointerEvent) => { down = [e.clientX, e.clientY]; };
        const pointerUp = (e: PointerEvent) => {
            if (Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
            const rect = renderer.domElement.getBoundingClientRect(); pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1); ray.setFromCamera(pointer, camera);
            const record = ray.intersectObjects([...nodes.values()].map(n => n.group), true).find(h => h.object.userData.trackId);
            if (record) { current.current.onSelect(record.object.userData.trackId); return; }
            const path = ray.intersectObjects(paths.map(p => p.hit))[0]; if (path) current.current.onPath?.(...path.object.userData.path as [string, string]);
        };
        const lost = (e: Event) => { e.preventDefault(); current.current.onFailure(); };
        renderer.domElement.addEventListener('pointerdown', pointerDown); renderer.domElement.addEventListener('pointerup', pointerUp); renderer.domElement.addEventListener('webglcontextlost', lost);
        function draw(time: number) {
            if (disposed) return; frame = requestAnimationFrame(draw); if (!visible || document.hidden || time - lastFrame < 32) return; lastFrame = time;
            const { universe, selectedId, reduced } = current.current;
            if (model !== universe) reconcile(universe);
            const reframe = lastOverview !== current.current.overview; lastOverview = current.current.overview;
            const focused = universe.scale === 'song', focusKey = focused ? selectedId : '';
            if (reframe || focusKey !== lastFocus || universe.scale !== lastScale || universe.contextKey !== lastContext) {
                if (lastScale && lastScale !== 'song') cameras.set(lastContext, { position: camera.position.clone(), target: controls.target.clone() });
                const saved = reframe ? frameView() : cameras.get(universe.contextKey) ?? frameView();
                if (focused) {
                    const base = nodes.get(selectedId)?.base ?? saved.target;
                    focusOffset.copy(camera.position).sub(controls.target).normalize().multiplyScalar(4); focusOffset.y += .8;
                    target.copy(base).add(focusOffset).lerp(saved.target, .22);
                    destination.copy(target).add(camera.position.clone().sub(controls.target).normalize().multiplyScalar(25));
                } else { target.copy(saved.target); destination.copy(saved.position); }
                transition = true; activated = time; dirty = true; lastFocus = focusKey; lastScale = universe.scale; lastContext = universe.contextKey;
            }
            if (reduced && !dirty && reduced === lastQuiet && !transition) return;
            lastQuiet = reduced; dirty = false;
            if (transition) { camera.position.lerp(destination, reduced ? 1 : .09); controls.target.lerp(target, reduced ? 1 : .09); if (camera.position.distanceTo(destination) < .03) transition = false; }
            controls.update();
            const related = new Set(universe.focusIds);
            nodes.forEach((n, id) => {
                const active = focused && id === selectedId, near = related.has(id);
                n.target.copy(n.base); if (active) n.target.add(focusOffset);
                n.group.position.lerp(n.target, reduced ? 1 : .12); n.group.lookAt(camera.position);
                n.group.scale.lerp(new THREE.Vector3().setScalar(active ? 1.7 : 1), reduced ? 1 : .12);
                n.halo.opacity = active ? 1 : !focused || near ? .65 : .18; n.face.emissiveIntensity = active ? .35 : !focused || near ? .13 : .025;
                n.label.style.opacity = !focused || near ? '1' : '.38'; n.label.dataset.selected = String(active); n.label.setAttribute('aria-pressed', String(active));
            });
            let sparks = 0;
            paths.forEach(p => {
                const a = nodes.get(p.edge.a)!.group.position, b = nodes.get(p.edge.b)!.group.position;
                if (p.lastA.distanceToSquared(a) > .0001 || p.lastB.distanceToSquared(b) > .0001) {
                    p.curve.v0.copy(a); p.curve.v2.copy(b); p.curve.v1.copy(a).lerp(b, .5); p.curve.v1.y += Math.min(3, a.distanceTo(b) * .2) + .5; p.curve.updateArcLengths();
                    p.mesh.geometry.dispose(); p.mesh.geometry = new THREE.TubeGeometry(p.curve, 32, p.edge.kind === 'authored' ? .085 : p.edge.strong ? .065 : .03, 5, false);
                    p.hit.geometry.dispose(); p.hit.geometry = new THREE.BufferGeometry().setFromPoints(p.curve.getPoints(32)); p.lastA.copy(a); p.lastB.copy(b);
                }
                const active = p.edge.a === selectedId || p.edge.b === selectedId;
                p.mesh.material.opacity = focused && !active ? .08 : p.edge.kind === 'authored' ? .95 : p.edge.strong ? .8 : .38;
                p.spark.visible = active && sparks++ < 2 && !reduced && time - activated < 5000;
                if (p.spark.visible) p.spark.position.copy(p.curve.getPoint(((time - activated) * .00015) % 1));
            });
            // Place focused labels first; hide colliding secondary labels, never the keyboard search alternative.
            const occupied: { x: number; y: number; w: number; h: number }[] = [];
            const place = (label: HTMLElement, position: THREE.Vector3, important = false) => {
                const p = position.clone().project(camera), x = (p.x * .5 + .5) * element.clientWidth, y = (-p.y * .5 + .5) * element.clientHeight;
                const w = label.offsetWidth || 110, h = label.offsetHeight || 28;
                const outside = p.z > 1 || p.z < -1 || Math.abs(p.x) > .96 || Math.abs(p.y) > .94;
                const overlap = !important && occupied.some(r => Math.abs(r.x - x) < (r.w + w) / 2 + 6 && Math.abs(r.y - y) < (r.h + h) / 2 + 5);
                label.style.visibility = outside || overlap ? 'hidden' : 'visible'; label.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px)`;
                if (!outside && !overlap) occupied.push({ x, y, w, h });
                return !outside && !overlap;
            };
            [...nodes.entries()].sort(([a], [b]) => Number(b === selectedId) - Number(a === selectedId)).forEach(([id, n]) => {
                const below = new THREE.Vector3(0, -(focused && id === selectedId ? 2.5 : 1.5), 0).applyQuaternion(camera.quaternion);
                place(n.label, n.group.position.clone().add(below), id === selectedId);
            });
            // Connection labels must not cover the musical objects themselves.
            nodes.forEach(n => {
                const center = n.group.position.clone().project(camera);
                const edge = n.group.position.clone().add(new THREE.Vector3(1.25 * n.group.scale.x, 0, 0).applyQuaternion(camera.quaternion)).project(camera);
                const diameter = Math.abs(edge.x - center.x) * element.clientWidth;
                occupied.push({ x: (center.x * .5 + .5) * element.clientWidth, y: (-center.y * .5 + .5) * element.clientHeight, w: diameter, h: diameter });
            });
            paths.forEach(p => { for (const t of [.5, .35, .65]) if (place(p.label, p.curve.getPoint(t))) break; });
            try { renderer.render(scene, camera); } catch { current.current.onFailure(); }
        }
        frame = requestAnimationFrame(draw);
        return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect(); controls.dispose(); renderer.domElement.removeEventListener('pointerdown', pointerDown); renderer.domElement.removeEventListener('pointerup', pointerUp); renderer.domElement.removeEventListener('webglcontextlost', lost); free(scene); nodes.forEach(n => n.texture.dispose()); environmentMap.dispose(); renderer.dispose(); renderer.domElement.remove(); layer.remove(); };
    }, []);
    return <div ref={host} className="universe-canvas" />;
}
