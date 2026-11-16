import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CITY_HUBS, useGameStore } from '../../store/gameStore';

const KEYS: Record<string, boolean> = {};

function clampWorld(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function collidesWithHub(x: number, z: number, radius = 1.1): boolean {
  for (const hub of CITY_HUBS) {
    const [bx, , bz] = hub.position;
    const [bw, , bd] = hub.size;
    if (Math.abs(x - bx) < bw / 2 + radius && Math.abs(z - bz) < bd / 2 + radius) {
      return true;
    }
  }
  return false;
}

interface TikMeshProps {
  rubricTotal: number;
  hasBank: boolean;
  hasNadlan: boolean;
  hasTase: boolean;
  hasCoop: boolean;
}

/**
 * The visual 3D "Tik" (Bag / Portfolio) worn on the player's back
 * Evolves in material & trim as the player's Rubric Score climbs,
 * with 4 color-coded asset pockets that light up as each stage is funded.
 */
const TikBackpackMesh: React.FC<TikMeshProps> = ({
  rubricTotal,
  hasBank,
  hasNadlan,
  hasTase,
  hasCoop,
}) => {
  const bagColor =
    rubricTotal >= 75 ? '#0f172a' : rubricTotal >= 45 ? '#1e3a8a' : '#92400e';
  const trimColor =
    rubricTotal >= 75 ? '#fbbf24' : rubricTotal >= 45 ? '#38bdf8' : '#d97706';

  return (
    <group>
      {/* Main Backpack Body */}
      <mesh castShadow>
        <boxGeometry args={[0.64, 0.78, 0.34]} />
        <meshStandardMaterial color={bagColor} roughness={0.45} metalness={0.25} />
      </mesh>
      {/* Top Flap */}
      <mesh position={[0, 0.34, -0.03]} castShadow>
        <boxGeometry args={[0.68, 0.18, 0.38]} />
        <meshStandardMaterial color={trimColor} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Rolled Map / Deed Tube on Top */}
      <mesh position={[0, 0.48, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.11, 0.11, 0.66, 12]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.7} />
      </mesh>

      {/* 4 Color-Coded Asset Pockets on the Back of the Tik */}
      {/* Pocket 1: Bank Savings (Emerald) */}
      <mesh position={[-0.16, 0.12, -0.19]}>
        <boxGeometry args={[0.24, 0.22, 0.08]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={hasBank ? 1.2 : 0.15}
        />
      </mesh>
      {/* Pocket 2: Real Estate Buyer Group (Amber) */}
      <mesh position={[0.16, 0.12, -0.19]}>
        <boxGeometry args={[0.24, 0.22, 0.08]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={hasNadlan ? 1.2 : 0.15}
        />
      </mesh>
      {/* Pocket 3: TASE Equities (Blue) */}
      <mesh position={[-0.16, -0.16, -0.19]}>
        <boxGeometry args={[0.24, 0.22, 0.08]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={hasTase ? 1.2 : 0.15}
        />
      </mesh>
      {/* Pocket 4: Co-Op Ventures (Purple) */}
      <mesh position={[0.16, -0.16, -0.19]}>
        <boxGeometry args={[0.24, 0.22, 0.08]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={hasCoop ? 1.2 : 0.15}
        />
      </mesh>
    </group>
  );
};

export const PlayerWithTik: React.FC = () => {
  const { camera } = useThree();
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);

  const playerPos = useGameStore((s) => s.playerPos);
  const playerRot = useGameStore((s) => s.playerRot);
  const holdings = useGameStore((s) => s.holdings);
  const paused = useGameStore((s) => Boolean(s.openHub || s.tikOpen || s.trainOpen || s.infoOpen));
  const getRubric = useGameStore((s) => s.getRubric);
  const setPlayerTransform = useGameStore((s) => s.setPlayerTransform);
  const setNearby = useGameStore((s) => s.setNearby);

  const rubric = getRubric();
  const hasBank = holdings.some((h) => h.category === 'bank');
  const hasNadlan = holdings.some((h) => h.category === 'realestate');
  const hasTase = holdings.some((h) => h.category === 'index' || h.category === 'stock');
  const hasCoop = holdings.some((h) => h.category === 'coop');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      KEYS[e.code] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      KEYS[e.code] = false;
    };
    const onBlur = () => {
      for (const k of Object.keys(KEYS)) KEYS[k] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  useFrame(({ clock }, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const forward = (KEYS['KeyW'] || KEYS['ArrowUp'] ? 1 : 0) - (KEYS['KeyS'] || KEYS['ArrowDown'] ? 1 : 0);
    const turn = (KEYS['KeyA'] || KEYS['ArrowLeft'] ? 1 : 0) - (KEYS['KeyD'] || KEYS['ArrowRight'] ? 1 : 0);

    let nx = playerPos[0];
    let nz = playerPos[2];
    let nextRot = playerRot;

    if (!paused) {
      const walkSpeed = 12;
      nextRot = playerRot + turn * 3.2 * dt;
      if (forward !== 0) {
        const candX = clampWorld(nx + Math.sin(nextRot) * forward * walkSpeed * dt, -22, 26);
        const candZ = clampWorld(nz + Math.cos(nextRot) * forward * walkSpeed * dt, -42, 42);
        if (!collidesWithHub(candX, candZ, 0.85)) {
          nx = candX;
          nz = candZ;
        }
      }
      if (nx !== playerPos[0] || nz !== playerPos[2] || nextRot !== playerRot) {
        setPlayerTransform([nx, 0, nz], nextRot);
      }
      if (leftLegRef.current && rightLegRef.current) {
        const swing = forward !== 0 ? Math.sin(clock.getElapsedTime() * 12) * 0.55 : 0;
        leftLegRef.current.rotation.x = swing;
        rightLegRef.current.rotation.x = -swing;
      }
    }

    let foundHub = null;
    for (const hub of CITY_HUBS) {
      if (Math.hypot(nx - hub.entryPos[0], nz - hub.entryPos[2]) < 3.8) {
        foundHub = hub.id;
        break;
      }
    }
    setNearby(foundHub);

    // Third-person camera that keeps the Tik on the player's back in view
    const camDist = 11.5;
    const target = new THREE.Vector3(nx - Math.sin(nextRot) * camDist, 7.0, nz - Math.cos(nextRot) * camDist);
    camera.position.lerp(target, 1 - Math.exp(-6 * dt));
    camera.lookAt(nx, 1.6, nz);
  });

  return (
    <group position={playerPos} rotation={[0, playerRot, 0]}>
      <mesh ref={leftLegRef} position={[-0.22, 0.55, 0]} castShadow>
        <boxGeometry args={[0.26, 0.9, 0.28]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>
      <mesh ref={rightLegRef} position={[0.22, 0.55, 0]} castShadow>
        <boxGeometry args={[0.26, 0.9, 0.28]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>
      <mesh position={[0, 1.38, 0]} castShadow>
        <boxGeometry args={[0.72, 0.85, 0.42]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[-0.24, 1.42, 0.22]}>
        <boxGeometry args={[0.1, 0.78, 0.05]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.24, 1.42, 0.22]}>
        <boxGeometry args={[0.1, 0.78, 0.05]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <group position={[0, 1.42, -0.38]}>
        <TikBackpackMesh
          rubricTotal={rubric.total}
          hasBank={hasBank}
          hasNadlan={hasNadlan}
          hasTase={hasTase}
          hasCoop={hasCoop}
        />
      </group>
      <mesh position={[0, 2.08, 0]} castShadow>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color="#fed7aa" />
      </mesh>
    </group>
  );
};
