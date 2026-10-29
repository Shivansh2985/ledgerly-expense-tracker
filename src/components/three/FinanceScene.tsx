"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer, RoundedBox, ContactShadows } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Coin({ position, color, scale = 1, speed = 1 }: { position: [number, number, number]; color: string; scale?: number; speed?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.6 * speed;
  });
  return (
    <Float speed={1.4 * speed} rotationIntensity={0.6} floatIntensity={1.2}>
      <group ref={ref} position={position} scale={scale} rotation={[Math.PI / 2.4, 0, 0.3]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.62, 0.62, 0.14, 64]} />
          <meshPhysicalMaterial color={color} metalness={0.55} roughness={0.18} clearcoat={1} clearcoatRoughness={0.08} />
        </mesh>
        <mesh position={[0, 0.075, 0]}>
          <torusGeometry args={[0.46, 0.035, 16, 64]} />
          <meshPhysicalMaterial color="#ffffff" metalness={0.3} roughness={0.2} clearcoat={1} />
        </mesh>
      </group>
    </Float>
  );
}

function GlassOrb({ position, scale = 1, tint = "#ffffff" }: { position: [number, number, number]; scale?: number; tint?: string }) {
  return (
    <Float speed={1.1} rotationIntensity={0.2} floatIntensity={1.6}>
      <mesh position={position} scale={scale}>
        <sphereGeometry args={[0.5, 64, 64]} />
        <meshPhysicalMaterial color={tint} transmission={1} thickness={0.8} roughness={0.05} ior={1.35} clearcoat={1} attenuationColor={tint} attenuationDistance={1.6} />
      </mesh>
    </Float>
  );
}

function CardSlab() {
  return (
    <Float speed={1} rotationIntensity={0.35} floatIntensity={0.8}>
      <group rotation={[-0.35, 0.5, 0.18]}>
        <RoundedBox args={[2.6, 1.6, 0.08]} radius={0.12} smoothness={6}>
          <meshPhysicalMaterial color="#ffffff" transmission={0.92} thickness={0.5} roughness={0.12} ior={1.25} clearcoat={1} />
        </RoundedBox>
        <mesh position={[-0.82, 0.32, 0.06]}>
          <boxGeometry args={[0.42, 0.3, 0.02]} />
          <meshPhysicalMaterial color="#FFB547" metalness={0.8} roughness={0.25} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[-0.75 + i * 0.5, -0.35, 0.06]}>
            <boxGeometry args={[0.38, 0.07, 0.01]} />
            <meshStandardMaterial color="#8B7BF0" />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function Ring({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (ref.current) {
      ref.current.rotation.x = s.clock.elapsedTime * 0.35;
      ref.current.rotation.y = s.clock.elapsedTime * 0.25;
    }
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <torusGeometry args={[0.5, 0.17, 48, 96]} />
      <meshPhysicalMaterial color={color} metalness={0.2} roughness={0.15} clearcoat={1} clearcoatRoughness={0.05} />
    </mesh>
  );
}

function Rig({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, state.pointer.x * 0.25, 0.05);
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -state.pointer.y * 0.15, 0.05);
  });
  return <group ref={ref}>{children}</group>;
}

export default function FinanceScene({ variant = "hero" }: { variant?: "hero" | "auth" }) {
  const coins = useMemo(
    () =>
      variant === "hero"
        ? ([
            { p: [-2.1, 1.1, 0.2], c: "#8B7BF0", s: 0.9, v: 1 },
            { p: [2.0, 1.3, -0.4], c: "#FFB547", s: 0.75, v: 1.3 },
            { p: [1.7, -1.2, 0.6], c: "#FF7A6B", s: 0.6, v: 0.8 },
            { p: [-1.6, -1.35, 0.4], c: "#2EC4A0", s: 0.55, v: 1.1 },
          ] as const)
        : ([
            { p: [-1.4, 1.2, 0.2], c: "#8B7BF0", s: 0.8, v: 1 },
            { p: [1.4, -1.2, 0.5], c: "#FFB547", s: 0.65, v: 1.2 },
            { p: [1.5, 1.3, -0.5], c: "#2EC4A0", s: 0.5, v: 0.9 },
          ] as const),
    [variant],
  );

  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 6.2], fov: 42 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <Rig>
        <CardSlab />
        {coins.map((c, i) => (
          <Coin key={i} position={c.p as unknown as [number, number, number]} color={c.c} scale={c.s} speed={c.v} />
        ))}
        <GlassOrb position={[-2.4, -0.1, -1]} scale={0.9} tint="#E4E0FD" />
        <GlassOrb position={[2.5, 0.1, -1.2]} scale={0.7} tint="#FFE3DD" />
        <Ring position={[0.2, 1.75, -1.4]} color="#C9C1FB" scale={0.55} />
        <Ring position={[-0.4, -1.9, -0.8]} color="#A6F0DA" scale={0.45} />
      </Rig>
      <ContactShadows position={[0, -2.4, 0]} opacity={0.25} scale={10} blur={2.6} far={4} color="#6C5CE7" />
      <Environment resolution={256}>
        <Lightformer intensity={2.2} position={[0, 5, -9]} scale={[10, 10, 1]} color="#ffffff" />
        <Lightformer intensity={1.4} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 2, 1]} color="#E4E0FD" />
        <Lightformer intensity={1.4} position={[5, 1, -1]} rotation-y={-Math.PI / 2} scale={[20, 2, 1]} color="#FFE3DD" />
        <Lightformer intensity={1} position={[0, -4, 2]} rotation-x={Math.PI / 2} scale={[20, 6, 1]} color="#ffffff" />
      </Environment>
    </Canvas>
  );
}
