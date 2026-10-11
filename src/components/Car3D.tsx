"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  RoundedBox,
  Sparkles,
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

const DIRTY_COLOR = new THREE.Color("#6B4A33");

const WHEEL_POSITIONS: [number, number, number][] = [
  [0.95, 0.17, 0.52],
  [0.95, 0.17, -0.52],
  [-0.95, 0.17, 0.52],
  [-0.95, 0.17, -0.52],
];

function Wheel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.22, 20]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.15, 0.15, 0.23, 16]} />
        <meshStandardMaterial color="#9AA5AD" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  );
}

/** Deterministic pseudo-randomness keeps this component a pure render. */
function seededJitter(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function FoamParticles({ opacity }: { opacity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const positions = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const radius = 1.3 + seededJitter(i * 12.9898) * 0.4;
      pts.push([
        Math.cos(angle) * radius,
        0.3 + seededJitter(i * 78.233) * 0.6,
        Math.sin(angle) * radius * 0.55,
      ]);
    }
    return pts;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      child.position.y = positions[i][1] + Math.sin(clock.elapsedTime * 2 + i) * 0.08;
    });
  });

  return (
    <group ref={groupRef}>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.06 + (i % 3) * 0.02, 8, 8]} />
          <meshStandardMaterial
            color="#FFFFFF"
            transparent
            opacity={opacity * 0.85}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

function CarModel({
  clean,
  paintHex,
}: {
  clean: number;
  paintHex: string;
}) {
  const bodyMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const cabinMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const glassMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const target = new THREE.Color(paintHex);
    const mixed = DIRTY_COLOR.clone().lerp(target, clean);

    if (bodyMatRef.current) {
      bodyMatRef.current.color.copy(mixed);
      bodyMatRef.current.roughness = THREE.MathUtils.lerp(0.9, 0.22, clean);
      bodyMatRef.current.metalness = THREE.MathUtils.lerp(0.04, 0.6, clean);
    }
    if (cabinMatRef.current) {
      cabinMatRef.current.color.copy(mixed);
      cabinMatRef.current.roughness = THREE.MathUtils.lerp(0.85, 0.3, clean);
      cabinMatRef.current.metalness = THREE.MathUtils.lerp(0.04, 0.5, clean);
    }
    if (glassMatRef.current) {
      glassMatRef.current.roughness = THREE.MathUtils.lerp(0.7, 0.05, clean);
      glassMatRef.current.opacity = THREE.MathUtils.lerp(0.5, 0.92, clean);
      glassMatRef.current.transmission = THREE.MathUtils.lerp(0.05, 0.85, clean);
    }
  });

  const mudOpacity = Math.max(0, 1 - clean / 0.6);
  const foamOpacity =
    clean > 0.04 && clean < 0.96 ? Math.sin(Math.min(clean, 1) * Math.PI) : 0;
  const showSparkles = clean > 0.97;

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      {/* Body */}
      <RoundedBox
        args={[2.6, 0.55, 1.1]}
        radius={0.12}
        smoothness={4}
        position={[0, 0.45, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial ref={bodyMatRef} />
      </RoundedBox>

      {/* Cabin */}
      <RoundedBox
        args={[1.3, 0.42, 1.0]}
        radius={0.1}
        smoothness={4}
        position={[-0.1, 0.84, 0]}
        castShadow
      >
        <meshStandardMaterial ref={cabinMatRef} />
      </RoundedBox>

      {/* Glass */}
      <mesh position={[-0.1, 0.85, 0]}>
        <boxGeometry args={[1.42, 0.3, 1.04]} />
        <meshPhysicalMaterial
          ref={glassMatRef}
          color="#B9D3DC"
          transparent
          thickness={0.3}
          clearcoat={0.6}
        />
      </mesh>

      {/* Wheels */}
      {WHEEL_POSITIONS.map((pos, i) => (
        <Wheel key={i} position={pos} />
      ))}

      {/* Headlights */}
      <mesh position={[1.32, 0.48, 0.32]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#FFF7D6"
          emissive="#FFEFB0"
          emissiveIntensity={1.1}
        />
      </mesh>
      <mesh position={[1.32, 0.48, -0.32]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#FFF7D6"
          emissive="#FFEFB0"
          emissiveIntensity={1.1}
        />
      </mesh>

      {/* Taillights */}
      <mesh position={[-1.32, 0.48, 0.32]}>
        <boxGeometry args={[0.05, 0.12, 0.2]} />
        <meshStandardMaterial
          color="#B3261E"
          emissive="#B3261E"
          emissiveIntensity={0.7}
        />
      </mesh>
      <mesh position={[-1.32, 0.48, -0.32]}>
        <boxGeometry args={[0.05, 0.12, 0.2]} />
        <meshStandardMaterial
          color="#B3261E"
          emissive="#B3261E"
          emissiveIntensity={0.7}
        />
      </mesh>

      {/* Mud decals */}
      <mesh position={[0.1, 0.28, 0.555]}>
        <planeGeometry args={[1.5, 0.28]} />
        <meshStandardMaterial
          color="#4A3522"
          transparent
          opacity={mudOpacity}
          roughness={1}
        />
      </mesh>
      <mesh position={[0.1, 0.28, -0.555]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.5, 0.28]} />
        <meshStandardMaterial
          color="#4A3522"
          transparent
          opacity={mudOpacity}
          roughness={1}
        />
      </mesh>

      {foamOpacity > 0.02 && <FoamParticles opacity={foamOpacity} />}
      {showSparkles && (
        <Sparkles count={36} scale={2.8} size={2.4} speed={0.4} color="#F2B705" />
      )}
    </group>
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
        camera={{ position: [3.2, 1.6, 3.6], fov: 32 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#EEF3F6"]} />
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[4, 6, 3]}
          intensity={1.4}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <CarModel clean={clean} paintHex={paintHex} />
        <ContactShadows
          position={[0, -0.55, 0]}
          opacity={0.45}
          scale={6}
          blur={2.2}
          far={2}
        />
        <Environment preset="city" />
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.12}
          autoRotate={!reducedMotion}
          autoRotateSpeed={0.8}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2.1}
          target={[0, 0.3, 0]}
        />
      </Canvas>
    </div>
  );
}
