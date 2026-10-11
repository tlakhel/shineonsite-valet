"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uBase;
  uniform vec3 uTeal;
  uniform vec3 uHighlight;

  float ripple(vec2 uv, vec2 center, float t, float speed, float freq) {
    float d = distance(uv, center);
    return sin(d * freq - t * speed) * exp(-d * 1.4);
  }

  void main() {
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 uv = vUv;
    uv.x *= aspect;
    float t = uTime * 0.2;

    float r1 = ripple(uv, vec2(0.3 * aspect, 0.65), t, 1.6, 22.0);
    float r2 = ripple(uv, vec2(0.75 * aspect, 0.3), t + 2.0, 1.2, 16.0);
    float r3 = ripple(uv, vec2(0.55 * aspect, 0.8), t + 4.0, 1.9, 26.0);

    float combined = (r1 + r2 + r3) / 3.0;
    float glow = smoothstep(0.08, 0.5, combined);

    vec3 color = mix(uBase, uTeal, glow * 0.22);
    color = mix(color, uHighlight, smoothstep(0.35, 0.6, combined) * 0.3);

    float vignette = smoothstep(1.1, 0.2, distance(uv, vec2(0.5 * aspect, 0.5)));
    color = mix(uBase, color, 0.55 + vignette * 0.45);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uBase: { value: new THREE.Color("#EEF3F6") },
      uTeal: { value: new THREE.Color("#0B5E66") },
      uHighlight: { value: new THREE.Color("#FFFFFF") },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let isVisible = true;
    let frameId = 0;
    const clock = new THREE.Clock();

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;
      renderer.setSize(clientWidth, clientHeight, false);
      uniforms.uResolution.value.set(clientWidth, clientHeight);
    };

    const tick = () => {
      if (isVisible) {
        uniforms.uTime.value = clock.getElapsedTime();
        renderer.render(scene, camera);
      }
      frameId = requestAnimationFrame(tick);
    };

    resize();
    tick();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden motion-reduce:hidden"
    />
  );
}
