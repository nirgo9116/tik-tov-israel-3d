import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { JOBS, useGameStore } from '../../store/gameStore';
import { HEBREW_FONT } from '../../fonts';
import { HANDOVER_SECONDS, jobFx } from './jobFx';
import { NearSign } from './NearSign';

const shekel = (n: number) => `₪${Math.round(n).toLocaleString('he-IL')}`;

/** A simple low-poly person: customer, camp kid or student waiting at a job stop. */
export const Npc: React.FC<{ shirt: string; scale?: number; wave?: boolean }> = ({ shirt, scale = 1, wave }) => {
  const arm = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (arm.current) arm.current.rotation.z = wave ? 2.4 + Math.sin(clock.getElapsedTime() * 8) * 0.4 : 0.15;
  });
  return (
    <group scale={scale}>
      <mesh position={[-0.18, 0.45, 0]} castShadow>
        <boxGeometry args={[0.22, 0.9, 0.24]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0.18, 0.45, 0]} castShadow>
        <boxGeometry args={[0.22, 0.9, 0.24]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 1.25, 0]} castShadow>
        <boxGeometry args={[0.62, 0.8, 0.36]} />
        <meshStandardMaterial color={shirt} />
      </mesh>
      <mesh ref={arm} position={[0.4, 1.5, 0]} castShadow>
        <boxGeometry args={[0.16, 0.7, 0.18]} />
        <meshStandardMaterial color={shirt} />
      </mesh>
      <mesh position={[-0.4, 1.25, 0]} rotation={[0, 0, -0.15]} castShadow>
        <boxGeometry args={[0.16, 0.7, 0.18]} />
        <meshStandardMaterial color={shirt} />
      </mesh>
      <mesh position={[0, 1.92, 0]} castShadow>
        <sphereGeometry args={[0.28, 14, 14]} />
        <meshStandardMaterial color="#e0b48a" />
      </mesh>
    </group>
  );
};

const SHIRTS = ['#ef4444', '#8b5cf6', '#f59e0b'];

/** The next stop of the summer job: light beam, the person waiting there, flying package and "+₪" text. */
export const JobMarkers: React.FC = () => {
  const activeJob = useGameStore((s) => s.activeJob);
  const beam = useRef<THREE.Mesh>(null);
  const box = useRef<THREE.Mesh>(null);
  const coin = useRef<THREE.Group>(null);
  const coinText = useRef<any>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (beam.current) {
      const k = 1 + Math.sin(t * 4) * 0.12;
      beam.current.scale.set(k, 1, k);
    }
    if (box.current) {
      const busy = t < jobFx.busyUntil;
      box.current.visible = busy;
      if (busy) {
        const p = Math.min(1, (t - jobFx.startedAt) / (HANDOVER_SECONDS * 0.6));
        const x = THREE.MathUtils.lerp(jobFx.from[0], jobFx.to[0], p);
        const z = THREE.MathUtils.lerp(jobFx.from[1], jobFx.to[1], p);
        box.current.position.set(x, 1.4 + Math.sin(p * Math.PI) * 1.2, z);
        box.current.rotation.y = t * 6;
      }
    }
    if (coin.current) {
      const show = t < jobFx.coinUntil;
      coin.current.visible = show;
      if (show) {
        const p = 1 - (jobFx.coinUntil - t) / 2.2;
        coin.current.position.set(jobFx.to[0], 3 + p * 2.5, jobFx.to[1]);
        coin.current.rotation.y = t * 5;
        if (coinText.current) coinText.current.text = `+${shekel(jobFx.earned)}`;
      }
    }
  });

  const job = activeJob ? JOBS.find((j) => j.id === activeJob.jobId) : undefined;

  return (
    <group>
      {/* Package flying from the player to the person at the stop */}
      <mesh ref={box} visible={false} castShadow>
        <boxGeometry args={[0.5, 0.35, 0.4]} />
        <meshStandardMaterial color={job?.boxColor ?? '#c08a4a'} />
      </mesh>
      {/* Coin and the money earned at this stop */}
      <group ref={coin} visible={false}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.12, 24]} />
          <meshStandardMaterial color="#facc15" emissive="#f59e0b" emissiveIntensity={0.8} metalness={0.6} roughness={0.3} />
        </mesh>
        <Billboard position={[0, 1, 0]}>
          <Text ref={coinText} font={HEBREW_FONT} fontSize={0.9} color="#4ade80" outlineWidth={0.08} outlineColor="#052e16">
            +₪0
          </Text>
        </Billboard>
      </group>

      {job &&
        job.targets.map(([x, z], i) => {
          const done = i < activeJob!.done;
          const current = i === activeJob!.done;
          return (
            <group key={i} position={[x, 0, z]}>
              <group rotation={[0, Math.PI, 0]}>
                <Npc shirt={SHIRTS[i % SHIRTS.length]} wave={current || done} scale={job.id === 'job-camp' ? 0.75 : 1} />
              </group>
              {job.id === 'job-camp' && (
                <>
                  <group position={[1, 0, 0.6]}><Npc shirt="#06b6d4" scale={0.6} wave={done} /></group>
                  <group position={[-1, 0, 0.5]}><Npc shirt="#84cc16" scale={0.62} wave={done} /></group>
                </>
              )}
              {current && (
                <>
                  <mesh ref={beam} position={[0, 6, 0]}>
                    <cylinderGeometry args={[0.9, 0.9, 12, 16, 1, true]} />
                    <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={1.6} transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
                  </mesh>
                  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                    <ringGeometry args={[1.6, 2.2, 32]} />
                    <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={1.2} />
                  </mesh>
                </>
              )}
              {(current || done) && (
                <NearSign min={0} max={current ? 70 : 14}>
                  <Billboard position={[0, 3.1, 0]}>
                    <Text font={HEBREW_FONT} direction="rtl" fontSize={0.5} color={done ? '#86efac' : '#fef08a'} outlineWidth={0.06} outlineColor="#0f172a">
                      {done ? 'תודה רבה!' : job.stopLabel}
                    </Text>
                  </Billboard>
                </NearSign>
              )}
            </group>
          );
        })}
    </group>
  );
};

/** A summer-job stand in each city: walk to it and press E to start working. */
export const JobStands: React.FC = () => {
  const jobYear = useGameStore((s) => s.jobYear);
  const year = useGameStore((s) => s.year);
  const activeJob = useGameStore((s) => s.activeJob);
  const icon = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (icon.current) {
      const t = clock.getElapsedTime();
      icon.current.children.forEach((c, i) => {
        c.position.y = 3.6 + Math.sin(t * 2.5 + i) * 0.2;
        c.rotation.y = t * 1.5;
      });
    }
  });
  const available = jobYear !== year && !activeJob;
  if (activeJob) return null;
  return (
    <group>
      <group ref={icon}>
        {JOBS.map((job) =>
          available ? (
            <group key={job.id} position={[job.stand[0], 3.6, job.stand[1]]}>
              {/* Floating briefcase */}
              <mesh castShadow>
                <boxGeometry args={[0.9, 0.6, 0.3]} />
                <meshStandardMaterial color="#16a34a" emissive="#16a34a" emissiveIntensity={0.6} />
              </mesh>
              <mesh position={[0, 0.38, 0]}>
                <torusGeometry args={[0.18, 0.05, 8, 16, Math.PI]} />
                <meshStandardMaterial color="#14532d" />
              </mesh>
            </group>
          ) : (
            <group key={job.id} />
          ),
        )}
      </group>
      {JOBS.map((job) => (
        <group key={job.id} position={[job.stand[0], 0, job.stand[1]]}>
          {/* Counter and awning */}
          <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.2, 1.1, 1]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[0, 2.25, 0.1]} castShadow>
            <boxGeometry args={[2.6, 0.18, 1.5]} />
            <meshStandardMaterial color={available ? '#16a34a' : '#64748b'} />
          </mesh>
          {[-1.1, 1.1].map((dx) => (
            <mesh key={dx} position={[dx, 1.2, -0.35]}>
              <cylinderGeometry args={[0.06, 0.06, 2.1, 8]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
          ))}
          <mesh position={[0, 1.25, 0.55]}>
            <boxGeometry args={[0.5, 0.3, 0.4]} />
            <meshStandardMaterial color={job.boxColor} />
          </mesh>
          <group position={[0, 0, -0.9]}>
            <Npc shirt="#0ea5e9" />
          </group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 1.6]}>
            <ringGeometry args={[0.9, 1.25, 28]} />
            <meshStandardMaterial color={available ? '#22c55e' : '#94a3b8'} emissive={available ? '#22c55e' : '#000'} emissiveIntensity={0.7} />
          </mesh>
          <NearSign min={10} max={26}>
            <Billboard position={[0, 4.7, 0]}>
              <Text font={HEBREW_FONT} direction="rtl" fontSize={0.45} color="#bbf7d0" outlineWidth={0.06} outlineColor="#052e16" textAlign="center">
                {available ? `עבודה בקיץ: ${shekel(job.pay)}` : 'עבדתם השנה'}
              </Text>
            </Billboard>
          </NearSign>
        </group>
      ))}
    </group>
  );
};

/** Yellow arrow on the ground next to the player, pointing to the next job stop. */
export const NavArrow: React.FC = () => {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!g.current) return;
    const s = useGameStore.getState();
    const job = s.activeJob ? JOBS.find((j) => j.id === s.activeJob!.jobId) : undefined;
    const target = job?.targets[s.activeJob!.done];
    if (!target || s.trainRide) {
      g.current.visible = false;
      return;
    }
    const [px, , pz] = s.playerPos;
    const dx = target[0] - px;
    const dz = target[1] - pz;
    const d = Math.hypot(dx, dz);
    g.current.visible = d > 3.5;
    const rot = Math.atan2(dx, dz);
    const bob = 0.15 * Math.sin(clock.getElapsedTime() * 5);
    g.current.position.set(px + Math.sin(rot) * (0.9 + bob), 3.1, pz + Math.cos(rot) * (0.9 + bob));
    g.current.rotation.set(0, rot, 0);
  });
  return (
    <group ref={g} visible={false} scale={1.5}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.35]}>
        <coneGeometry args={[0.45, 0.8, 4]} />
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[0, 0, -0.25]}>
        <boxGeometry args={[0.22, 0.08, 0.6]} />
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
};
