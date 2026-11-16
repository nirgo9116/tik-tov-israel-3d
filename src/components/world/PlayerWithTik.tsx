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
 * and strapped onto the car roof rack while driving.
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
  const carSpeedRef = useRef(0);

  const playerPos = useGameStore((s) => s.playerPos);
  const playerRot = useGameStore((s) => s.playerRot);
  const drivingCarId = useGameStore((s) => s.drivingCarId);
  const cars = useGameStore((s) => s.cars);
  const holdings = useGameStore((s) => s.holdings);
  const openHub = useGameStore((s) => s.openHub);
  const tikOpen = useGameStore((s) => s.tikOpen);
  const getRubric = useGameStore((s) => s.getRubric);

  const setPlayerTransform = useGameStore((s) => s.setPlayerTransform);
  const updateCarTransform = useGameStore((s) => s.updateCarTransform);
  const setNearby = useGameStore((s) => s.setNearby);
  const tickTime = useGameStore((s) => s.tickTime);

  const rubric = getRubric();
  const hasBank = holdings.some((h) => h.category === 'bank');
  const hasNadlan = holdings.some((h) => h.category === 'realestate');
  const hasTase = holdings.some((h) => h.category === 'index' || h.category === 'stock');
  const hasCoop = holdings.some((h) => h.category === 'coop');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      KEYS[e.code] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      KEYS[e.code] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame(({ clock }, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    tickTime(dt);

    const isPaused = Boolean(openHub || tikOpen);
    const forward = (KEYS['KeyW'] || KEYS['ArrowUp'] ? 1 : 0) - (KEYS['KeyS'] || KEYS['ArrowDown'] ? 1 : 0);
    const turn = (KEYS['KeyA'] || KEYS['ArrowLeft'] ? 1 : 0) - (KEYS['KeyD'] || KEYS['ArrowRight'] ? 1 : 0);

    let focusX = playerPos[0];
    let focusZ = playerPos[2];
    let focusRot = playerRot;

    if (!isPaused) {
      if (drivingCarId) {
        const car = cars.find((c) => c.id === drivingCarId);
        if (car) {
          const maxSpeed = 26;
          const accel = 28;
          if (forward !== 0) {
            carSpeedRef.current = THREE.MathUtils.clamp(
              carSpeedRef.current + forward * accel * dt,
              -10,
              maxSpeed
            );
          } else {
            carSpeedRef.current = THREE.MathUtils.lerp(carSpeedRef.current, 0, dt * 3.5);
          }

          let nextRot = car.rotation;
          if (Math.abs(carSpeedRef.current) > 0.4) {
            const dir = carSpeedRef.current >= 0 ? 1 : -1;
            nextRot += turn * 2.4 * dt * dir;
          }

          const nx = clampWorld(car.x + Math.sin(nextRot) * carSpeedRef.current * dt, -22, 26);
          const nz = clampWorld(car.z + Math.cos(nextRot) * carSpeedRef.current * dt, -42, 42);

          if (!collidesWithHub(nx, nz, 1.7)) {
            updateCarTransform(car.id, nx, nz, nextRot);
            setPlayerTransform([nx, 0, nz], nextRot);
            focusX = nx;
            focusZ = nz;
            focusRot = nextRot;
          } else {
            carSpeedRef.current = -carSpeedRef.current * 0.3;
          }
        }
      } else {
        carSpeedRef.current = 0;
        const walkSpeed = 11;
        let nextRot = playerRot + turn * 3.2 * dt;
        let nx = playerPos[0];
        let nz = playerPos[2];

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

        focusX = nx;
        focusZ = nz;
        focusRot = nextRot;

        if (leftLegRef.current && rightLegRef.current) {
          if (forward !== 0) {
            const swing = Math.sin(clock.getElapsedTime() * 12) * 0.55;
            leftLegRef.current.rotation.x = swing;
            rightLegRef.current.rotation.x = -swing;
          } else {
            leftLegRef.current.rotation.x = 0;
            rightLegRef.current.rotation.x = 0;
          }
        }
      }
    }

    let foundHub = null;
    for (const hub of CITY_HUBS) {
      if (Math.hypot(focusX - hub.entryPos[0], focusZ - hub.entryPos[2]) < 3.8) {
        foundHub = hub.id;
        break;
      }
    }

    let foundCar = null;
    if (!drivingCarId) {
      for (const c of cars) {
        if (Math.hypot(focusX - c.x, focusZ - c.z) < 3.6) {
          foundCar = c.id;
          break;
        }
      }
    }
    setNearby(foundHub, foundCar);

    // Smooth third-person chase camera showing the player's Tik on their back
    const camDist = drivingCarId ? 15.5 : 11.5;
    const camHeight = drivingCarId ? 8.8 : 7.0;
    const targetCamPos = new THREE.Vector3(
      focusX - Math.sin(focusRot) * camDist,
      camHeight,
      focusZ - Math.cos(focusRot) * camDist
    );
    camera.position.lerp(targetCamPos, 1 - Math.exp(-6 * dt));
    camera.lookAt(focusX, 1.6, focusZ);
  });

  return (
    <group>
      {/* Player Character Wearing the Evolving 3D Tik (Backpack) */}
      {!drivingCarId && (
        <group position={playerPos} rotation={[0, playerRot, 0]}>
          {/* Legs */}
          <mesh ref={leftLegRef} position={[-0.22, 0.55, 0]} castShadow>
            <boxGeometry args={[0.26, 0.9, 0.28]} />
            <meshStandardMaterial color="#1e3a8a" />
          </mesh>
          <mesh ref={rightLegRef} position={[0.22, 0.55, 0]} castShadow>
            <boxGeometry args={[0.26, 0.9, 0.28]} />
            <meshStandardMaterial color="#1e3a8a" />
          </mesh>
          {/* Torso */}
          <mesh position={[0, 1.38, 0]} castShadow>
            <boxGeometry args={[0.72, 0.85, 0.42]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          {/* Shoulder Straps */}
          <mesh position={[-0.24, 1.42, 0.22]}>
            <boxGeometry args={[0.1, 0.78, 0.05]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.24, 1.42, 0.22]}>
            <boxGeometry args={[0.1, 0.78, 0.05]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          {/* The 3D "Tik" Backpack Mounted on Player's Back */}
          <group position={[0, 1.42, -0.38]}>
            <TikBackpackMesh
              rubricTotal={rubric.total}
              hasBank={hasBank}
              hasNadlan={hasNadlan}
              hasTase={hasTase}
              hasCoop={hasCoop}
            />
          </group>
          {/* Head */}
          <mesh position={[0, 2.08, 0]} castShadow>
            <sphereGeometry args={[0.32, 16, 16]} />
            <meshStandardMaterial color="#fed7aa" />
          </mesh>
        </group>
      )}

      {/* Drivable 3D Cars (Active car carries the player's Tik on the roof rack!) */}
      {cars.map((car) => {
        const isDriven = drivingCarId === car.id;
        return (
          <group key={car.id} position={[car.x, 0, car.z]} rotation={[0, car.rotation, 0]}>
            <mesh position={[0, 0.65, 0]} castShadow>
              <boxGeometry args={[2.1, 0.75, 4.2]} />
              <meshStandardMaterial color={car.color} metalness={0.5} roughness={0.25} />
            </mesh>
            <mesh position={[0, 1.25, -0.2]} castShadow>
              <boxGeometry args={[1.75, 0.65, 2.2]} />
              <meshStandardMaterial color="#0f172a" roughness={0.15} metalness={0.7} />
            </mesh>
            {/* Tik Strapped on Roof Rack When Driving */}
            {isDriven && (
              <group position={[0, 1.78, -0.2]} rotation={[Math.PI / 2, 0, 0]} scale={[0.9, 0.9, 0.9]}>
                <TikBackpackMesh
                  rubricTotal={rubric.total}
                  hasBank={hasBank}
                  hasNadlan={hasNadlan}
                  hasTase={hasTase}
                  hasCoop={hasCoop}
                />
              </group>
            )}
            {/* Headlights */}
            <mesh position={[-0.65, 0.65, 2.12]}>
              <boxGeometry args={[0.35, 0.2, 0.08]} />
              <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={2} />
            </mesh>
            <mesh position={[0.65, 0.65, 2.12]}>
              <boxGeometry args={[0.35, 0.2, 0.08]} />
              <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={2} />
            </mesh>
            {/* 4 Wheels */}
            {[
              [-1.05, 0.38, 1.3],
              [1.05, 0.38, 1.3],
              [-1.05, 0.38, -1.3],
              [1.05, 0.38, -1.3],
            ].map(([wx, wy, wz], idx) => (
              <mesh key={idx} position={[wx, wy, wz]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.38, 0.38, 0.3, 16]} />
                <meshStandardMaterial color="#090d16" roughness={0.9} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
};
