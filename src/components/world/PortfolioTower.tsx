import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { stageInfo, useGameStore } from '../../store/gameStore';
import { composition, SLICE_STYLE } from '../../data/composition';
import { HEBREW_FONT } from '../../fonts';
import { NearSign } from './NearSign';
import type { CityHubId } from '../../types/game';

/** Where the tower stands next to each stage building (beside the entry pad). */
const TOWER_SPOT: Partial<Record<CityHubId, [number, number]>> = {
  jerusalem: [7, -1.8],
  telaviv: [-10.5, 0.8],
  haifa: [-14.6, -26],
};

const KEYS = Object.keys(SLICE_STYLE);

/**
 * A stack of coloured blocks: each block's height is that slice's share of the portfolio.
 * It grows and shrinks smoothly when the student invests or a year's returns are applied.
 */
export const PortfolioTower: React.FC<{ position: [number, number, number]; height: number }> = ({ position, height }) => {
  const cash = useGameStore((s) => s.cash);
  const holdings = useGameStore((s) => s.holdings);
  const slices = composition(cash, holdings);
  const sum = slices.reduce((a, x) => a + x.value, 0) || 1;
  const blocks = useRef<Record<string, THREE.Mesh | null>>({});
  const labels = useRef<Record<string, THREE.Group | null>>({});
  const shown = useRef<Record<string, number>>({});

  useFrame((_, dt) => {
    let y = 0;
    for (const key of KEYS) {
      const target = ((slices.find((x) => x.key === key)?.value ?? 0) / sum) * height;
      const cur = shown.current[key] ?? 0;
      const h = cur + (target - cur) * Math.min(1, dt * 4);
      shown.current[key] = h;
      const m = blocks.current[key];
      if (m) {
        m.visible = h > 0.02;
        m.scale.y = Math.max(0.001, h);
        m.position.y = y + h / 2;
      }
      const l = labels.current[key];
      if (l) {
        l.visible = h > height * 0.07;
        l.position.y = y + h / 2;
      }
      y += h;
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <cylinderGeometry args={[1.4, 1.5, 0.12, 24]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      {KEYS.map((key) => {
        const s = slices.find((x) => x.key === key);
        const pct = s ? Math.round((s.value / sum) * 100) : 0;
        return (
          <React.Fragment key={key}>
            <mesh ref={(m) => (blocks.current[key] = m)} visible={false} castShadow>
              <boxGeometry args={[1.5, 1, 1.5]} />
              <meshStandardMaterial color={SLICE_STYLE[key].color} roughness={0.45} emissive={SLICE_STYLE[key].color} emissiveIntensity={0.15} />
            </mesh>
            <group ref={(g) => (labels.current[key] = g)} visible={false}>
              <Billboard position={[0, 0, 0]}>
                <Text position={[0, 0, 0.9]} font={HEBREW_FONT} direction="rtl" fontSize={height > 4 ? 0.32 : 0.2} color="#ffffff" outlineWidth={0.04} outlineColor="#0f172a">
                  {`${SLICE_STYLE[key].label} ${pct}%`}
                </Text>
              </Billboard>
            </group>
          </React.Fragment>
        );
      })}
      <Billboard position={[0, height + 0.7, 0]}>
        <Text font={HEBREW_FONT} direction="rtl" fontSize={height > 4 ? 0.42 : 0.26} color="#fde68a" outlineWidth={0.05} outlineColor="#0f172a">
          הרכב התיק שלי
        </Text>
      </Billboard>
    </group>
  );
};

/** The tower in the open world, next to the building of the current stage. */
export const StageTower: React.FC = () => {
  const stage = useGameStore((s) => s.stage);
  const spot = TOWER_SPOT[stageInfo(stage).city];
  if (!spot) return null;
  return (
    <NearSign min={0} max={60}>
      <PortfolioTower position={[spot[0], 0, spot[1]]} height={6} />
    </NearSign>
  );
};
