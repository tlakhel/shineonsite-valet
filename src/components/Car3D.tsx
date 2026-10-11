"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  OrbitControls,
  Sparkles,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";

export interface CarPaint {
  id: string;
  label: string;
  hex: string;
}

export const carPaints: CarPaint[] = [
  { id: "teal", label: "Teal", hex: "#0B5E66" },
  { id: "red", label: "Signal red", hex: "#B3261E" },
  { id: "white", label: "Ice white", hex: "#E9EEF2" },
  { id: "graphite", label: "Graphite", hex: "#3C4752" },
];

const MODEL_URL = "/models/car-opt.glb";
const DIRTY_PAINT_COLOR = "#6B4A33";
const TARGET_CAR_LENGTH = 2.7;
const WHEEL_NAMES = [
  "wheel-front-right",
  "wheel-front-left",
  "wheel-back-right",
  "wheel-back-left",
];

/** Deterministic pseudo-randomness keeps render-phase computations pure. */
function seededJitter(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/** Scale + ground the model and locate wheel centers, from the shared cached scene. */
function useCarLayout(scene: THREE.Group) {
  return useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const scaleFactor = TARGET_CAR_LENGTH / (size.z || 1);
    const offsetX = -center.x * scaleFactor;
    const offsetZ = -center.z * scaleFactor;
    const offsetY = -box.min.y * scaleFactor;
    const height = size.y * scaleFactor;
    const width = size.x * scaleFactor;

    const wheelXZ = WHEEL_NAMES.map((name) => {
      const node = scene.getObjectByName(name);
      if (!node) return new THREE.Vector2(0, 0);
      return new THREE.Vector2(
        node.position.x * scaleFactor + offsetX,
        node.position.z * scaleFactor + offsetZ
      );
    });

    return { scaleFactor, offsetX, offsetY, offsetZ, height, width, wheelXZ };
  }, [scene]);
}

interface BodyMaterialUniforms {
  uClean: { value: number };
  uBodyColor: { value: THREE.Color };
  uDirtyColor: { value: THREE.Color };
  uWheelXZ: { value: THREE.Vector2[] };
}

/** Builds the cloned, shader-patched body material — windows/tyres/lights untouched. */
function useBodyMaterial(sourceMap: THREE.Texture | null, wheelXZ: THREE.Vector2[]) {
  const uniforms = useMemo<BodyMaterialUniforms>(
    () => ({
      uClean: { value: 0 },
      uBodyColor: { value: new THREE.Color(carPaints[0].hex) },
      uDirtyColor: { value: new THREE.Color(DIRTY_PAINT_COLOR) },
      uWheelXZ: { value: wheelXZ },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const material = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      map: sourceMap,
      side: THREE.DoubleSide,
      roughness: 0.9,
      metalness: 0.05,
      clearcoat: 0,
      clearcoatRoughness: 0.3,
    });

    mat.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);

      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec3 vWorldPos;"
        )
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;"
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>
          uniform float uClean;
          uniform vec3 uBodyColor;
          uniform vec3 uDirtyColor;
          uniform vec2 uWheelXZ[4];
          varying vec3 vWorldPos;

          float grimeHash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
          }
          float grimeValueNoise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            float a = grimeHash(i);
            float b = grimeHash(i + vec2(1.0, 0.0));
            float c = grimeHash(i + vec2(0.0, 1.0));
            float d = grimeHash(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
          }
          float grimeNoise(vec2 p) {
            return grimeValueNoise(p * 5.0) * 0.55
              + grimeValueNoise(p * 12.0) * 0.3
              + grimeValueNoise(p * 24.0) * 0.15;
          }`
        )
        .replace(
          "#include <map_fragment>",
          `#include <map_fragment>
          {
            vec3 texColor = diffuseColor.rgb;
            float rb = texColor.r - texColor.b;
            float lum = dot(texColor, vec3(0.299, 0.587, 0.114));

            float bodyMask = smoothstep(0.08, 0.22, rb)
              * (1.0 - smoothstep(0.45, 0.65, texColor.g));
            float windowMask = (1.0 - step(0.08, rb))
              * smoothstep(0.30, 0.46, lum);

            float heightFactor = 1.0 - smoothstep(0.0, 0.55, vWorldPos.y);
            float archFactor = 0.0;
            for (int i = 0; i < 4; i++) {
              float d = distance(vWorldPos.xz, uWheelXZ[i]);
              archFactor = max(archFactor, exp(-d * 2.6));
            }
            float grime = grimeNoise(vWorldPos.xz * 1.6) * (0.35 + heightFactor * 0.65);
            grime = clamp(grime + archFactor * 0.55, 0.0, 1.0);
            float grimeAmount = grime * (1.0 - uClean);

            vec3 mutedPaint = mix(uDirtyColor, uBodyColor, 0.25 + uClean * 0.15);
            vec3 paintedBody = mix(mutedPaint, uBodyColor, uClean);
            paintedBody = mix(paintedBody, uDirtyColor * 0.55, grimeAmount);

            vec3 clearerWindow = mix(texColor, min(texColor * 1.2 + 0.04, vec3(1.0)), uClean * 0.55);

            diffuseColor.rgb = mix(texColor, paintedBody, bodyMask);
            diffuseColor.rgb = mix(diffuseColor.rgb, clearerWindow, windowMask);
          }`
        );

      mat.userData.shader = shader;
    };

    mat.needsUpdate = true;
    return mat;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceMap]);

  return { material, uniforms };
}

function useFoamTexture() {
  return useMemo(() => {
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2
      );
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(0.55, "rgba(255,255,255,0.85)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);
}

interface FoamWashProps {
  clean: number;
  height: number;
  width: number;
}

function FoamWash({ clean, height, width }: FoamWashProps) {
  const texture = useFoamTexture();
  const spriteRefs = useRef<(THREE.Sprite | null)[]>([]);
  const count = 20;

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (seededJitter(i * 12.9) - 0.5) * width * 0.85,
        z: (seededJitter(i * 37.3) - 0.5) * 2.2,
        phase: seededJitter(i * 71.7),
        speed: 0.5 + seededJitter(i * 19.1) * 0.4,
        scale: 0.05 + seededJitter(i * 53.2) * 0.05,
      })),
    [width]
  );

  const washActive = clean > 0.04 && clean < 0.96;
  const envelope = washActive ? Math.sin(Math.min(clean, 1) * Math.PI) : 0;

  useFrame(({ clock }) => {
    particles.forEach((p, i) => {
      const sprite = spriteRefs.current[i];
      if (!sprite) return;
      if (envelope <= 0.02) {
        sprite.visible = false;
        return;
      }
      sprite.visible = true;
      const t = (clock.elapsedTime * p.speed + p.phase) % 1;
      const y = height * (0.92 - t * 0.85);
      sprite.position.set(p.x, y, p.z);
      const edgeFade = Math.sin(t * Math.PI);
      const material = sprite.material as THREE.SpriteMaterial;
      material.opacity = envelope * edgeFade * 0.8;
    });
  });

  return (
    <group>
      {particles.map((p, i) => (
        <sprite
          key={i}
          ref={(el) => {
            spriteRefs.current[i] = el;
          }}
          scale={[p.scale, p.scale, p.scale]}
        >
          <spriteMaterial
            map={texture}
            transparent
            depthWrite={false}
            color="#ffffff"
            opacity={0}
          />
        </sprite>
      ))}
    </group>
  );
}

function CarModel({ clean, paintHex }: { clean: number; paintHex: string }) {
  const { scene } = useGLTF(MODEL_URL) as unknown as { scene: THREE.Group };
  const layout = useCarLayout(scene);

  const sourceMap = useMemo(() => {
    const bodyNode = scene.getObjectByName("body") as THREE.Mesh | undefined;
    const sourceMat = bodyNode?.material as THREE.MeshStandardMaterial | undefined;
    return sourceMat?.map ?? null;
  }, [scene]);

  const { material: bodyMaterial, uniforms } = useBodyMaterial(
    sourceMap,
    layout.wheelXZ
  );

  const cloned = useMemo(() => {
    const root = scene.clone(true);
    const body = root.getObjectByName("body") as THREE.Mesh | undefined;
    if (body) {
      body.material = bodyMaterial;
    }
    return root;
  }, [scene, bodyMaterial]);

  /* eslint-disable react-hooks/immutability --
     Imperative per-frame material mutation is the standard react-three-fiber
     pattern (avoids a React re-render on every animation tick). */
  useFrame(() => {
    uniforms.uClean.value = clean;
    uniforms.uBodyColor.value.set(paintHex);
    bodyMaterial.roughness = THREE.MathUtils.lerp(0.95, 0.18, clean);
    bodyMaterial.metalness = THREE.MathUtils.lerp(0.05, 0.55, clean);
    bodyMaterial.clearcoat = THREE.MathUtils.lerp(0, 0.85, clean);
    bodyMaterial.clearcoatRoughness = THREE.MathUtils.lerp(0.6, 0.08, clean);
  });
  /* eslint-enable react-hooks/immutability */

  const showSparkles = clean > 0.97;

  return (
    <group>
      <primitive
        object={cloned}
        scale={layout.scaleFactor}
        position={[layout.offsetX, layout.offsetY, layout.offsetZ]}
      />
      <FoamWash clean={clean} height={layout.height} width={layout.width} />
      {showSparkles && (
        <Sparkles
          count={36}
          scale={[layout.width * 1.6, layout.height * 1.4, TARGET_CAR_LENGTH * 1.1]}
          size={2.4}
          speed={0.4}
          color="#F2B705"
        />
      )}
    </group>
  );
}

function CarLoadingFallback() {
  return (
    <Html center>
      <div className="flex items-center gap-2 rounded-full border border-lines bg-surface px-4 py-2 text-xs font-bold text-ink-soft shadow-sm">
        <span className="h-2 w-2 animate-pulse rounded-full bg-teal" />
        Loading car…
      </div>
    </Html>
  );
}

export interface Car3DProps {
  clean: number;
  paintHex: string;
  reducedMotion: boolean;
  active: boolean;
}

export default function Car3D({
  clean,
  paintHex,
  reducedMotion,
  active,
}: Car3DProps) {
  const [inView, setInView] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
      <Canvas
        shadows
        dpr={[1, 2]}
        frameloop={active && inView ? "always" : "demand"}
        camera={{ position: [2.7, 0.8, 3.0], fov: 30 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#EEF3F6"]} />
        <ambientLight intensity={0.65} />
        <directionalLight
          position={[4, 6, 3]}
          intensity={1.4}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <Suspense fallback={<CarLoadingFallback />}>
          <CarModel clean={clean} paintHex={paintHex} />
          <Environment preset="city" />
        </Suspense>
        <ContactShadows
          position={[0, 0.002, 0]}
          opacity={0.5}
          scale={4.2}
          blur={1.5}
          far={1.4}
        />
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.12}
          autoRotate={!reducedMotion}
          autoRotateSpeed={0.8}
          minPolarAngle={1.3}
          maxPolarAngle={1.52}
          target={[0, 0.5, 0]}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
