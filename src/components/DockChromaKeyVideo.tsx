import { useEffect, useRef, useState } from "react";

/**
 * Видео над панелью управления: ширина как у `.dock`, зелёный фон вырезается в WebGL.
 * Без WebGL — обычный &lt;video&gt; без ключа.
 */
export function DockChromaKeyVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [useVideoFallback, setUseVideoFallback] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const glCtx = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!glCtx) {
      setUseVideoFallback(true);
      return;
    }
    const gl = glCtx;

    const vsSrc = `
      attribute vec2 a_pos;
      attribute vec2 a_uv;
      varying vec2 v_uv;
      void main() {
        v_uv = a_uv;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }`;
    const fsSrc = `
      precision mediump float;
      uniform sampler2D u_tex;
      varying vec2 v_uv;
      void main() {
        vec4 c = texture2D(u_tex, v_uv);
        float maxrb = max(c.r, c.b);
        float dg = c.g - maxrb;
        float a = 1.0 - smoothstep(0.10, 0.26, dg);
        gl_FragColor = vec4(c.rgb, c.a * a);
      }`;

    function compile(type: number, src: string) {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    }
    const vs = compile(gl.VERTEX_SHADER, vsSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) {
      setUseVideoFallback(true);
      return;
    }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      gl.deleteProgram(prog);
      setUseVideoFallback(true);
      return;
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0, -1, 1, 0, 0, 1, -1, 1, 1, 1, 1, 1, 0]),
      gl.STATIC_DRAW,
    );

    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let raf = 0;
    const draw = () => {
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (w > 0 && h > 0) {
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          gl.viewport(0, 0, w, h);
        }
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
        gl.useProgram(prog);
        const aPos = gl.getAttribLocation(prog, "a_pos");
        const aUv = gl.getAttribLocation(prog, "a_uv");
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
        gl.enableVertexAttribArray(aUv);
        gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 16, 8);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      raf = requestAnimationFrame(draw);
    };

    const onMeta = () => {
      void video.play().catch(() => {});
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };

    video.addEventListener("loadedmetadata", onMeta);
    if (video.readyState >= 1) onMeta();

    return () => {
      video.removeEventListener("loadedmetadata", onMeta);
      cancelAnimationFrame(raf);
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
  }, [src]);

  return (
    <div className="dock-chroma-slot">
      <video
        ref={videoRef}
        className="dock-chroma-video"
        src={src}
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
        style={{ opacity: useVideoFallback ? 1 : 0, pointerEvents: "none" }}
      />
      <canvas
        ref={canvasRef}
        className="dock-chroma-canvas"
        aria-hidden
        style={{ opacity: useVideoFallback ? 0 : 1, pointerEvents: "none" }}
      />
    </div>
  );
}
