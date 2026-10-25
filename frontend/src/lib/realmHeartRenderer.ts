/** A single low-resolution procedural sphere, with no textures, engine or audio access. */
export function createRealmHeart(canvas: HTMLCanvasElement, color: [number, number, number]) {
    let gl: WebGLRenderingContext | null;
    try { gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, powerPreference: 'low-power' }); } catch { return null; }
    if (!gl) return null;
    const shaders: WebGLShader[] = [];
    let program: WebGLProgram | null = null, buffer: WebGLBuffer | null = null;
    function dispose() {
        if (buffer) gl!.deleteBuffer(buffer);
        if (program) gl!.deleteProgram(program);
        shaders.forEach(shader => gl!.deleteShader(shader));
    }
    try {
        function compile(type: number, source: string) {
            const shader = gl!.createShader(type);
            if (!shader) throw Error('Shader unavailable');
            shaders.push(shader); gl!.shaderSource(shader, source); gl!.compileShader(shader);
            if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw Error('Shader compile failed');
            return shader;
        }
        const vertex = compile(gl.VERTEX_SHADER, 'attribute vec2 position; varying vec2 uv; void main(){uv=position;gl_Position=vec4(position,0.,1.);}');
        const fragment = compile(gl.FRAGMENT_SHADER, `
precision mediump float;
varying vec2 uv;
uniform float time, energy;
uniform vec3 tint;
void main(){
 vec2 p=uv*1.42; float r=length(p);
 float halo=exp(-abs(r-.82)*13.)*.26;
 float mask=1.-smoothstep(.80,.84,r);
 float z=sqrt(max(0.,.82*.82-dot(p,p)));
 vec3 n=normalize(vec3(p,z+.001));
 float t=time*.16;
 vec2 q=p+vec2(sin(p.y*5.+t),cos(p.x*5.-t))*.11;
 float ribbons=sin(q.x*12.+q.y*6.+sin(q.y*9.-t*2.)*1.5+t);
 ribbons=pow(.5+.5*ribbons,8.);
 float grain=.5+.5*sin(q.x*26.+sin(q.y*19.+t)*2.-t);
 float light=max(0.,dot(n,normalize(vec3(-.5,.7,1.))));
 float rim=pow(1.-z/.82,2.8);
 vec3 base=tint*(.12+light*.48+grain*.13);
 base+=mix(tint,vec3(1.,.92,.83),.6)*ribbons*(.45+energy*.85);
 base+=tint*rim*(.65+energy*.5);
 float shine=pow(max(0.,dot(n,normalize(vec3(-.35,.5,1.)))),28.);
 base+=vec3(.85,.93,1.)*shine*.65;
 vec3 glow=tint*halo*(.7+energy);
 gl_FragColor=vec4(base*mask+glow,max(mask,halo));
}`);
        program = gl.createProgram(); if (!program) throw Error('Program unavailable');
        gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error('Shader link failed');
        buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
        gl.useProgram(program);
        const position = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        const clock = gl.getUniformLocation(program, 'time'), amplitude = gl.getUniformLocation(program, 'energy');
        gl.uniform3fv(gl.getUniformLocation(program, 'tint'), color);
        return { draw(time: number, energy: number) {
            if (gl.isContextLost()) return;
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform1f(clock, time); gl.uniform1f(amplitude, Math.max(0,Math.min(1,energy)));
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }, dispose };
    } catch { dispose(); return null; }
}
