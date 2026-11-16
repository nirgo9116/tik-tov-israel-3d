import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { JOBS, useGameStore } from '../../store/gameStore';
import { HEBREW_FONT } from '../../fonts';

/** A tall glowing beacon at the next stop of the player's summer job. */
export const JobMarkers: React.FC = () => {
  const activeJob = useGameStore((s) => s.activeJob);
  const beam = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (beam.current) {
      const t = clock.getElapsedTime();
      beam.current.scale.set(1 + Math.sin(t * 4) * 0.12, 1, 1 + Math.sin(t * 4) * 0.12);
    }
  });
  if (!activeJob) return null;
  const job = JOBS.find((j) => j.id === activeJob.jobId);
  if (!job) return null;
  const [x, z] = job.targets[activeJob.done];
  return (
    <group position={[x, 0, z]}>
      <mesh ref={beam} position={[0, 6, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 12, 16, 1, true]} />
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={1.6} transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[1.4, 2, 32]} />
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={1.2} />
      </mesh>
      <Billboard position={[0, 4, 0]}>
        <Text font={HEBREW_FONT} direction="rtl" fontSize={0.9} color="#fef08a" outlineWidth={0.08} outlineColor="#0f172a">
          {`${activeJob.done + 1} מתוך ${job.targets.length}`}
        </Text>
      </Billboard>
    </group>
  );
};
