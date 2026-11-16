import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { CITY_HUBS, JOBS, cityStage, useGameStore } from '../../store/gameStore';
import { HANDOVER_SECONDS, jobFx } from './jobFx';
import { INTERIORS, ROOM_HALF_D, ROOM_HALF_W } from '../../data/interiors';

const KEYS: Record<string, boolean> = {};
/** Camera distance behind the player; changed with the mouse wheel or + / - keys. */
let camZoom = 11.5;
const ZOOM_MIN = 6;
const ZOOM_MAX = 60;

function clampWorld(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
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
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const carryRef = useRef<THREE.Mesh>(null);

  const playerPos = useGameStore((s) => s.playerPos);
  const playerRot = useGameStore((s) => s.playerRot);
  const holdings = useGameStore((s) => s.holdings);
  const overview = useGameStore((s) => s.overview);
  const paused = useGameStore((s) => Boolean(s.openHub || s.tikOpen || s.trainOpen || s.infoOpen || s.tutorialOpen || s.paycheck || s.jobsOpen || s.stationInfo || s.stageIntroOpen));
  const interior = useGameStore((s) => s.interior);
  const setNearbyStation = useGameStore((s) => s.setNearbyStation);
  const getRubric = useGameStore((s) => s.getRubric);
  const setPlayerTransform = useGameStore((s) => s.setPlayerTransform);
  const setNearby = useGameStore((s) => s.setNearby);
  const activeJob = useGameStore((s) => s.activeJob);
  const reachJobTarget = useGameStore((s) => s.reachJobTarget);
  const setNearbyJob = useGameStore((s) => s.setNearbyJob);
  const currentJob = activeJob ? JOBS.find((j) => j.id === activeJob.jobId) : undefined;

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
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement | null)?.tagName !== 'CANVAS') return;
      camZoom = THREE.MathUtils.clamp(camZoom * (e.deltaY > 0 ? 1.12 : 0.89), ZOOM_MIN, ZOOM_MAX);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  const riding = useGameStore((s) => Boolean(s.trainRide));

  useFrame(({ clock }, rawDelta) => {
    if (useGameStore.getState().trainRide) return; // the Train component drives the camera
    const dt = Math.min(rawDelta, 0.05);
    const now = clock.getElapsedTime();
    const handingOver = now < jobFx.busyUntil;
    const forward = (KEYS['KeyW'] || KEYS['ArrowUp'] ? 1 : 0) - (KEYS['KeyS'] || KEYS['ArrowDown'] ? 1 : 0);
    const turn = (KEYS['KeyA'] || KEYS['ArrowLeft'] ? 1 : 0) - (KEYS['KeyD'] || KEYS['ArrowRight'] ? 1 : 0);

    let nx = playerPos[0];
    let nz = playerPos[2];
    let nextRot = playerRot;

    if (!paused && !handingOver) {
      const walkSpeed = interior ? 6 : 12;
      nextRot = playerRot + turn * 3.2 * dt;
      if (forward !== 0) {
        const m = 0.6;
        const candX = interior
          ? clampWorld(nx + Math.sin(nextRot) * forward * walkSpeed * dt, -ROOM_HALF_W + m, ROOM_HALF_W - m)
          : clampWorld(nx + Math.sin(nextRot) * forward * walkSpeed * dt, -22, 26);
        const candZ = interior
          ? clampWorld(nz + Math.cos(nextRot) * forward * walkSpeed * dt, -ROOM_HALF_D + m, ROOM_HALF_D - m)
          : clampWorld(nz + Math.cos(nextRot) * forward * walkSpeed * dt, -42, 42);
        const blocked = interior
          ? INTERIORS[interior].blockers.some(([bx, bz, bw, bd]) => Math.abs(candX - bx) < bw / 2 + 0.45 && Math.abs(candZ - bz) < bd / 2 + 0.45)
          : false; // buildings are open: the player can walk inside them
        if (!blocked) {
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

    // Arms: swing while walking, hold the package during a job, reach out when handing it over
    if (leftArmRef.current && rightArmRef.current) {
      let a: number;
      if (handingOver) a = -1.6 + Math.sin(now * 10) * 0.15;
      else if (activeJob) a = -1.1;
      else a = forward !== 0 && !paused ? Math.sin(now * 12) * 0.5 : 0;
      leftArmRef.current.rotation.x = activeJob || handingOver ? a : a;
      rightArmRef.current.rotation.x = activeJob || handingOver ? a : -a;
    }
    if (carryRef.current) carryRef.current.visible = Boolean(activeJob) && !handingOver;
    if (handingOver) {
      // Face the person at the stop
      const want = Math.atan2(jobFx.to[0] - nx, jobFx.to[1] - nz);
      let d = want - nextRot;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      if (Math.abs(d) > 0.01) {
        nextRot += d * Math.min(1, dt * 8);
        setPlayerTransform([nx, 0, nz], nextRot);
      }
    } else if (jobFx.busyUntil > 0) {
      // Hand-over finished: count the stop
      jobFx.busyUntil = 0;
      reachJobTarget();
    }

    if (interior) {
      let st: string | null = null;
      for (const station of INTERIORS[interior].stations) {
        if (Math.hypot(nx - station.pos[0], nz - station.pos[1]) < 1.3) st = station.id;
      }
      setNearbyStation(st);
      camera.up.set(0, 1, 0);
      // Cut-away view from the open front of the room (like a doll's house)
      camera.position.lerp(new THREE.Vector3(nx * 0.5, 8.5, ROOM_HALF_D + 10 + nz * 0.2), 1 - Math.exp(-4 * dt));
      camera.lookAt(nx * 0.7, 1.4, nz * 0.6 - 2);
      return;
    }

    let foundHub = null;
    for (const hub of CITY_HUBS) {
      if (cityStage(hub.id) === null) continue;
      if (Math.hypot(nx - hub.entryPos[0], nz - hub.entryPos[2]) < 3.8) {
        foundHub = hub.id;
        break;
      }
    }
    setNearby(foundHub);

    let foundJob: string | null = null;
    for (const job of JOBS) {
      if (Math.hypot(nx - job.stand[0], nz - (job.stand[1] + 1.6)) < 2.2) foundJob = job.id;
    }
    setNearbyJob(foundJob);

    const liveJob = useGameStore.getState().activeJob;
    if (currentJob && liveJob && !paused && !handingOver && jobFx.busyUntil === 0) {
      const target = currentJob.targets[liveJob.done];
      if (target && Math.hypot(nx - target[0], nz - target[1]) < 2.6) {
        jobFx.startedAt = now;
        jobFx.busyUntil = now + HANDOVER_SECONDS;
        jobFx.from = [nx, nz];
        jobFx.to = target;
        jobFx.earned = currentJob.pay / currentJob.targets.length;
        jobFx.coinUntil = now + 2.2;
      }
    }

    if (KEYS['Equal'] || KEYS['NumpadAdd']) camZoom = Math.max(ZOOM_MIN, camZoom - 20 * dt);
    if (KEYS['Minus'] || KEYS['NumpadSubtract']) camZoom = Math.min(ZOOM_MAX, camZoom + 20 * dt);

    if (overview) {
      // Bird's-eye view of the whole country, north at the top of the screen
      camera.position.lerp(new THREE.Vector3(2, 130, -6.01), 1 - Math.exp(-4 * dt));
      camera.lookAt(2, 0, -6);
      camera.up.set(0, 0, -1);
      return;
    }
    camera.up.set(0, 1, 0);
    // Third-person camera that keeps the Tik on the player's back in view; height grows with zoom
    const camHeight = 7.0 * (camZoom / 11.5) ** 0.9;
    const target = new THREE.Vector3(nx - Math.sin(nextRot) * camZoom, camHeight, nz - Math.cos(nextRot) * camZoom);
    camera.position.lerp(target, 1 - Math.exp(-6 * dt));
    camera.lookAt(nx, 1.6, nz);
  });

  return (
    <group position={playerPos} rotation={[0, playerRot, 0]} visible={!riding}>
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
      {/* Arms pivot at the shoulder; during a summer job the player carries the job's package */}
      <group ref={leftArmRef} position={[-0.46, 1.75, 0]}>
        <mesh position={[0, -0.36, 0]} castShadow>
          <boxGeometry args={[0.18, 0.75, 0.2]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      </group>
      <group ref={rightArmRef} position={[0.46, 1.75, 0]}>
        <mesh position={[0, -0.36, 0]} castShadow>
          <boxGeometry args={[0.18, 0.75, 0.2]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      </group>
      <mesh ref={carryRef} position={[0, 1.55, 0.7]} visible={false} castShadow>
        <boxGeometry args={[0.7, 0.45, 0.5]} />
        <meshStandardMaterial color={currentJob?.boxColor ?? '#c08a4a'} roughness={0.8} />
      </mesh>
      {currentJob && (
        /* Work cap in the job's colour */
        <mesh position={[0, 2.36, 0.05]} castShadow>
          <cylinderGeometry args={[0.3, 0.33, 0.16, 16]} />
          <meshStandardMaterial color={currentJob.boxColor} />
        </mesh>
      )}
    </group>
  );
};
