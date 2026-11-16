import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { HISTORY } from '../../data/history';
import { INTERIORS, ROOM_HALF_D, ROOM_HALF_W, Station } from '../../data/interiors';
import type { CityHubId } from '../../types/game';
import { HEBREW_FONT } from '../../fonts';
import { Npc } from './JobMarkers';
import { runStation } from '../ui/stations';
import { PortfolioTower } from './PortfolioTower';

const H = 4.6; // ceiling height

/** Past values of a series: only years that already ended in the game (no peeking ahead). */
export function pastValues(key: string, currentYear: number): Array<{ year: number; v: number }> {
  return HISTORY.filter((y) => y.year < currentYear).map((y) => ({
    year: y.year,
    v: key === 'boiRateEnd' ? y.boiRateEnd : key === 'cpi' ? y.cpi : (y.returns as Record<string, number>)[key],
  }));
}

/** A wall board with a bar per finished year. */
const DataBoard: React.FC<{ station: Station; accent: string }> = ({ station, accent }) => {
  const year = useGameStore((s) => s.year);
  if (station.action.kind !== 'info' || !station.action.series) return null;
  const series = station.action.series;
  const vals = pastValues(series.key, year);
  const [sx, sz] = station.pos;
  // Put the board on the wall nearest the station
  let pos: [number, number, number];
  let rotY: number;
  if (sx <= -6.5) {
    pos = [-ROOM_HALF_W + 0.06, 2.4, sz];
    rotY = Math.PI / 2;
  } else if (sx >= 6.5) {
    pos = [ROOM_HALF_W - 0.06, 2.4, sz];
    rotY = -Math.PI / 2;
  } else {
    pos = [sx, 2.6, -ROOM_HALF_D + 0.06];
    rotY = 0;
  }
  const W = 5.2;
  const maxAbs = Math.max(5, ...vals.map((d) => Math.abs(d.v)));
  const slot = W / 8;
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <mesh>
        <boxGeometry args={[W + 0.6, 3.2, 0.08]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[W + 0.2, 0.02, 0.02]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <Text position={[0, 1.35, 0.06]} font={HEBREW_FONT} direction="rtl" fontSize={0.22} color="#f8fafc" anchorX="center">
        {series.label + (series.fictional ? ' · בדוי' : '')}
      </Text>
      {vals.length === 0 && (
        <Text position={[0, 0.3, 0.06]} font={HEBREW_FONT} direction="rtl" fontSize={0.2} color="#cbd5e1" maxWidth={W} textAlign="center" anchorX="center">
          עוד אין נתונים. הם יופיעו אחרי שהמורה יעביר שנה.
        </Text>
      )}
      {vals.map((d, i) => {
        const h = (Math.abs(d.v) / maxAbs) * 1.05 + 0.02;
        const x = W / 2 - slot / 2 - i * slot; // right to left, like Hebrew reading
        const up = d.v >= 0;
        return (
          <group key={d.year} position={[x, 0, 0.07]}>
            <mesh position={[0, up ? h / 2 : -h / 2, 0]}>
              <boxGeometry args={[slot * 0.6, h, 0.04]} />
              <meshStandardMaterial color={up ? accent : '#ef4444'} emissive={up ? accent : '#ef4444'} emissiveIntensity={0.5} />
            </mesh>
            <Text position={[0, up ? h + 0.13 : -h - 0.13, 0.01]} font={HEBREW_FONT} fontSize={0.14} color="#f8fafc">
              {`${d.v}%`}
            </Text>
            <Text position={[0, -1.35, 0.01]} font={HEBREW_FONT} fontSize={0.15} color="#cbd5e1">
              {String(d.year)}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

/** Glowing floor ring and a label at each station. */
const StationMarker: React.FC<{ station: Station; accent: string }> = ({ station, accent }) => {
  const near = useGameStore((s) => s.nearbyStation === station.id);
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ring.current) ring.current.rotation.z = clock.getElapsedTime() * 0.8;
  });
  const color = station.action.kind === 'exit' ? '#22c55e' : station.action.kind === 'invest' ? '#facc15' : accent;
  return (
    <group
      position={[station.pos[0], 0, station.pos[1]]}
      onClick={(e) => {
        // Click a station: use it when standing on it, otherwise walk there
        e.stopPropagation();
        const s = useGameStore.getState();
        if (s.nearbyStation === station.id && s.interior) runStation(s.interior, station.id);
        else s.setMoveTarget(station.pos);
      }}
    >
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.75, 1.0, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={near ? 1.4 : 0.6} />
      </mesh>
      <Billboard position={[0, 2.7, 0]}>
        <Text font={HEBREW_FONT} direction="rtl" fontSize={near ? 0.32 : 0.26} color={near ? '#fef9c3' : '#f8fafc'} outlineWidth={0.04} outlineColor="#0f172a">
          {station.label}
        </Text>
      </Billboard>
    </group>
  );
};

/** City-specific furniture. Every piece belongs to the building's money topic. */
const Props: React.FC<{ id: CityHubId; accent: string }> = ({ id, accent }) => {
  if (id === 'jerusalem')
    return (
      <group>
        {/* Teller counter with glass, tellers behind it */}
        <mesh position={[0, 0.6, -4.6]} castShadow receiveShadow>
          <boxGeometry args={[12, 1.2, 1.2]} />
          <meshStandardMaterial color="#8b6b4a" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.65, -4.6]}>
          <boxGeometry args={[12, 0.9, 0.05]} />
          <meshStandardMaterial color="#bae6fd" transparent opacity={0.35} />
        </mesh>
        {[-3.5, 0, 3.5].map((x, i) => (
          <group key={x} position={[x, 0, -5.6]}>
            <Npc shirt={['#1d4ed8', '#047857', '#7c3aed'][i]} />
          </group>
        ))}
        {/* Vault door: where deposits are kept */}
        <group position={[-6.5, 2.2, -ROOM_HALF_D + 0.1]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.3, 1.3, 0.25, 32]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0, 0.2]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.45, 0.07, 8, 24]} />
            <meshStandardMaterial color="#e5e7eb" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
        {/* Queue posts */}
        {[-2, -0.7, 0.7, 2].map((x) => (
          <mesh key={x} position={[x, 0.5, -1.6]}>
            <cylinderGeometry args={[0.06, 0.08, 1, 10]} />
            <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        {/* Stone columns */}
        {[-8.5, 8.5].flatMap((x) => [-4, 2].map((z) => (
          <mesh key={`${x}${z}`} position={[x, H / 2, z]} castShadow>
            <cylinderGeometry args={[0.35, 0.4, H, 16]} />
            <meshStandardMaterial color="#efe6d2" />
          </mesh>
        )))}
      </group>
    );
  if (id === 'telaviv')
    return (
      <group>
        {[-4.5, 4.5].map((x) => (
          <group key={x} position={[x, 0, -1]}>
            <mesh position={[0, 0.5, 0]} castShadow>
              <boxGeometry args={[4, 1, 1.6]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
            {[-1.3, 0, 1.3].map((dx, i) => (
              <mesh key={dx} position={[dx, 1.35, -0.3]} rotation={[-0.15, 0, 0]}>
                <boxGeometry args={[1, 0.65, 0.05]} />
                <meshStandardMaterial color="#0f172a" emissive={i === 1 ? accent : '#22c55e'} emissiveIntensity={0.55} />
              </mesh>
            ))}
            <group position={[0, 0, 1.2]} rotation={[0, Math.PI, 0]}>
              <Npc shirt="#1e3a8a" />
            </group>
          </group>
        ))}
        {/* Ticker strip above the index wall */}
        <mesh position={[0, 4.25, -ROOM_HALF_D + 0.08]}>
          <boxGeometry args={[ROOM_HALF_W * 2 - 0.4, 0.4, 0.05]} />
          <meshStandardMaterial color="#020617" emissive="#0ea5e9" emissiveIntensity={0.25} />
        </mesh>
      </group>
    );
  if (id === 'haifa')
    return (
      <group>
        <mesh position={[0, 0.5, -3.6]} castShadow>
          <boxGeometry args={[6, 1, 1.4]} />
          <meshStandardMaterial color="#7c5a3a" />
        </mesh>
        <group position={[0, 0, -4.9]}>
          <Npc shirt="#b45309" />
        </group>
        {/* Apartment listings on the wall */}
        {[-3.5, -1.5, 0.5, 2.5].map((z, i) => (
          <mesh key={z} position={[-ROOM_HALF_W + 0.06, 2.3, z]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[1.4, 1, 0.05]} />
            <meshStandardMaterial color={['#fde68a', '#bfdbfe', '#bbf7d0', '#fecaca'][i]} />
          </mesh>
        ))}
        {/* Table with a building model */}
        <mesh position={[-6.5, 0.45, 1.5]} castShadow>
          <boxGeometry args={[3, 0.9, 3]} />
          <meshStandardMaterial color="#a8a29e" />
        </mesh>
        {[[0, 0, 1.2, 1.6], [0.9, 0.6, 0.8, 1], [-0.8, -0.5, 0.8, 0.7]].map(([x, z, w, h], i) => (
          <mesh key={i} position={[-6.5 + x, 0.9 + h / 2, 1.5 + z]} castShadow>
            <boxGeometry args={[w, h, w]} />
            <meshStandardMaterial color="#f5f5f4" />
          </mesh>
        ))}
      </group>
    );
  return (
    <group>
      <mesh position={[0, 0.5, -3.6]} castShadow>
        <boxGeometry args={[5, 1, 1.4]} />
        <meshStandardMaterial color="#6b4f3a" />
      </mesh>
      <group position={[0, 0, -4.9]}>
        <Npc shirt="#7e22ce" />
      </group>
      {/* Solar farm model */}
      <mesh position={[6, 0.45, 0]} castShadow>
        <boxGeometry args={[3, 0.9, 3]} />
        <meshStandardMaterial color="#d6c3a0" />
      </mesh>
      {[-0.9, 0, 0.9].flatMap((x) => [-0.8, 0.2].map((z) => (
        <mesh key={`${x}${z}`} position={[6 + x, 1.05, z]} rotation={[-0.6, 0, 0]}>
          <boxGeometry args={[0.75, 0.04, 0.6]} />
          <meshStandardMaterial color="#1e3a8a" metalness={0.6} roughness={0.2} />
        </mesh>
      )))}
      {/* Negev map */}
      <mesh position={[-ROOM_HALF_W + 0.06, 2.3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[4, 2.4, 0.05]} />
        <meshStandardMaterial color="#e8c48a" />
      </mesh>
    </group>
  );
};

export const InteriorScene: React.FC<{ id: CityHubId }> = ({ id }) => {
  const def = INTERIORS[id];
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: def.wall, side: THREE.DoubleSide }), [def.wall]);
  return (
    <group>
      <color attach="background" args={['#0b1220']} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#ffffff', '#555555', 0.6]} />
      <pointLight position={[0, H - 0.4, 0]} intensity={30} distance={22} castShadow />
      <pointLight position={[-6, H - 0.4, -3]} intensity={14} distance={14} />
      <pointLight position={[6, H - 0.4, -3]} intensity={14} distance={14} />

      {/* Floor, ceiling, walls */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_HALF_W * 2, ROOM_HALF_D * 2]} />
        <meshStandardMaterial color={def.floor} roughness={0.5} />
      </mesh>
      <mesh position={[0, H / 2, -ROOM_HALF_D]} material={wallMat}>
        <planeGeometry args={[ROOM_HALF_W * 2, H]} />
      </mesh>
      <mesh position={[-ROOM_HALF_W, H / 2, 0]} rotation={[0, Math.PI / 2, 0]} material={wallMat}>
        <planeGeometry args={[ROOM_HALF_D * 2, H]} />
      </mesh>
      <mesh position={[ROOM_HALF_W, H / 2, 0]} rotation={[0, Math.PI / 2, 0]} material={wallMat}>
        <planeGeometry args={[ROOM_HALF_D * 2, H]} />
      </mesh>
      {/* The front wall is left out (cut-away view), only a low skirting marks it */}
      {[-6, 6].map((x) => (
        <mesh key={x} position={[x, 0.2, ROOM_HALF_D]}>
          <boxGeometry args={[8, 0.4, 0.15]} />
          <meshStandardMaterial color={def.wall} />
        </mesh>
      ))}
      {/* Accent stripe */}
      <mesh position={[0, 0.25, -ROOM_HALF_D + 0.03]}>
        <boxGeometry args={[ROOM_HALF_W * 2, 0.5, 0.04]} />
        <meshStandardMaterial color={def.accent} />
      </mesh>
      {/* Door */}
      <group position={[0, 0, ROOM_HALF_D]}>
        {[-1.2, 1.2].map((x) => (
          <mesh key={x} position={[x, 1.3, 0]}>
            <boxGeometry args={[0.18, 2.6, 0.18]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
        ))}
        <mesh position={[0, 2.65, 0]}>
          <boxGeometry args={[2.6, 0.2, 0.18]} />
          <meshStandardMaterial color="#16a34a" emissive="#16a34a" emissiveIntensity={0.7} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -0.6]}>
          <planeGeometry args={[2.2, 1.2]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>
      <Text position={[0, H - 0.6, -ROOM_HALF_D + 0.08]} font={HEBREW_FONT} direction="rtl" fontSize={0.42} color={def.accent} outlineWidth={0.03} outlineColor="#0f172a" visible={id !== 'telaviv'}>
        {def.title}
      </Text>

      <Props id={id} accent={def.accent} />
      <PortfolioTower position={[7.8, 0, 5]} height={3} />
      {def.stations.map((st) => (
        <React.Fragment key={st.id}>
          <StationMarker station={st} accent={def.accent} />
          <DataBoard station={st} accent={def.accent} />
        </React.Fragment>
      ))}
    </group>
  );
};
