import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { HEBREW_FONT } from '../../fonts';
import { NearSign } from './NearSign';
import type { Holding } from '../../types/game';

const shekel = (n: number) => `₪${Math.round(n).toLocaleString('he-IL')}`;

/** The savings orchard stands north of the Jerusalem bank. */
const ORIGIN: [number, number] = [14, 13.5];

/** Deterministic points on the canopy for the fruit. */
function fruitSpots(count: number, radius: number): Array<[number, number, number]> {
  const out: Array<[number, number, number]> = [];
  for (let i = 0; i < count; i++) {
    const y = 1 - (i + 0.5) / count; // from top to bottom
    const r = Math.sqrt(1 - y * y);
    const a = i * 2.39996; // golden angle
    out.push([Math.cos(a) * r * radius, y * radius * 0.8, Math.sin(a) * r * radius]);
  }
  return out;
}

/** One savings tree: size follows the money in the deposit, fruit = last year's interest. */
const SavingsTree: React.FC<{ h: Holding; x: number; z: number }> = ({ h, x, z }) => {
  const g = useRef<THREE.Group>(null);
  const scale = Math.min(2.2, 0.7 + Math.sqrt(h.currentValue / 10000) * 0.35);
  const fruit = h.orchard?.lastFruit ?? 0;
  const count = Math.max(0, Math.min(40, Math.round(fruit / 50)));
  const healthy = h.orchard?.lastRealPositive ?? true;
  const spots = useMemo(() => fruitSpots(count, 1.15), [count]);
  const linked = h.assetKey === 'cpiLinked';
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.8 + x) * 0.02;
  });
  return (
    <group position={[x, 0, z]}>
      <group ref={g} scale={scale}>
        <mesh position={[0, 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.2, 1.4, 8]} />
          <meshStandardMaterial color="#7c4a21" roughness={0.9} />
        </mesh>
        <group position={[0, 1.9, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[1.1, 14, 12]} />
            <meshStandardMaterial color={linked ? '#4d7c0f' : '#15803d'} roughness={0.8} />
          </mesh>
          {spots.map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[healthy ? 0.13 : 0.08, 8, 8]} />
              <meshStandardMaterial
                color={healthy ? (linked ? '#facc15' : '#f97316') : '#a16207'}
                emissive={healthy ? (linked ? '#facc15' : '#f97316') : '#000000'}
                emissiveIntensity={healthy ? 0.25 : 0}
              />
            </mesh>
          ))}
        </group>
      </group>
      <NearSign min={0} max={26}>
        <Billboard position={[0, 2.2 * scale + 1.4, 0]}>
          <Text font={HEBREW_FONT} direction="rtl" fontSize={0.34} color="#f8fafc" outlineWidth={0.04} outlineColor="#052e16" textAlign="center" maxWidth={4.6}>
            {`${h.name}: ${shekel(h.currentValue)}`}
          </Text>
          <Text position={[0, -0.42, 0]} font={HEBREW_FONT} direction="rtl" fontSize={0.26} color={healthy ? '#bbf7d0' : '#fde68a'} outlineWidth={0.03} outlineColor="#052e16" textAlign="center" maxWidth={4.6}>
            {fruit > 0
              ? `פירות השנה: ${shekel(fruit)} ${h.orchard?.mode === 'pick' ? '(נקטפו)' : '(נשתלו מחדש)'}${healthy ? '' : ' · פחות מהאינפלציה'}`
              : 'הפירות יגדלו בסוף השנה'}
          </Text>
        </Billboard>
      </NearSign>
    </group>
  );
};

/** Orchard of the student's savings, next to the bank in stage 1. */
export const Orchard: React.FC = () => {
  const holdings = useGameStore((s) => s.holdings);
  const trees = holdings.filter((h) => h.orchard);
  return (
    <group>
      {/* Low stone wall and soil bed */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[ORIGIN[0], 0.03, ORIGIN[1]]} receiveShadow>
        <planeGeometry args={[11, 5.5]} />
        <meshStandardMaterial color="#8b5e34" roughness={1} />
      </mesh>
      {[-1, 1].map((sz) => (
        <mesh key={sz} position={[ORIGIN[0], 0.25, ORIGIN[1] + sz * 2.85]}>
          <boxGeometry args={[11.4, 0.5, 0.3]} />
          <meshStandardMaterial color="#e7dcc4" />
        </mesh>
      ))}
      {trees.map((h, i) => (
        <SavingsTree key={h.id} h={h} x={ORIGIN[0] + 2.8 - i * 5.6} z={ORIGIN[1]} />
      ))}
      <NearSign min={0} max={34}>
        <Billboard position={[ORIGIN[0], trees.length ? 0.9 : 1.6, ORIGIN[1] - 3.4]}>
          <Text font={HEBREW_FONT} direction="rtl" fontSize={0.42} color="#bbf7d0" outlineWidth={0.05} outlineColor="#052e16" textAlign="center" maxWidth={10}>
            {trees.length ? 'פרדס החיסכון שלי' : 'פרדס החיסכון: כאן יגדלו העצים של הפיקדונות שלכם'}
          </Text>
        </Billboard>
      </NearSign>
    </group>
  );
};
