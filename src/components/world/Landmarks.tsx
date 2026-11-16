import React, { createContext, useContext, useMemo } from 'react';
import * as THREE from 'three';
import { FacadeKind, facadeTexture, repeated } from './textures';
import { CityHubId } from '../../types/game';

/**
 * Stylized landmarks for each city, built from simple shapes so the game stays
 * light enough for school computers. Coordinates are local to the city's
 * footprint (ground level y = 0), which stays inside CITY_HUBS[].size for collisions.
 */

type V3 = [number, number, number];

/** What is inside a building when it is revealed: offices or homes. */
export type InteriorKind = 'office' | 'home';
/** True while the player is close: buildings show their floors, furniture and people. */
export const RevealCtx = createContext<{ on: boolean; kind: InteriorKind }>({ on: false, kind: 'office' });

const PEOPLE = ['#ef4444', '#3b82f6', '#a855f7', '#f59e0b', '#14b8a6'];

/** Floors with furniture and small people, seen through the faded facade. */
const BuildingInside: React.FC<{ w: number; d: number; h: number; curved: boolean; kind: InteriorKind }> = ({ w, d, h, curved, kind }) => {
  const floorH = 2.2;
  const floors = Math.max(1, Math.floor(h / floorH));
  const inner = Math.min(w, d) * (curved ? 0.62 : 0.8);
  return (
    <group userData={{ inside: true }}>
      {Array.from({ length: floors }, (_, i) => {
        const y = i * floorH + 0.05;
        const p = PEOPLE[i % PEOPLE.length];
        return (
          <group key={i} position={[0, y, 0]}>
            <mesh>
              {curved ? <cylinderGeometry args={[w / 2 - 0.12, w / 2 - 0.12, 0.1, 20]} /> : <boxGeometry args={[w - 0.2, 0.1, d - 0.2]} />}
              <meshStandardMaterial color={kind === 'office' ? '#cbd5e1' : '#d6b88f'} />
            </mesh>
            {/* Ceiling light */}
            <mesh position={[0, floorH - 0.12, 0]}>
              <boxGeometry args={[inner * 0.6, 0.04, 0.2]} />
              <meshStandardMaterial color="#fffbe6" emissive="#fffbe6" emissiveIntensity={1.2} />
            </mesh>
            {kind === 'office' ? (
              <>
                {/* Desks with screens */}
                {[-1, 1].map((sx) => (
                  <group key={sx} position={[(sx * inner) / 4, 0, 0]}>
                    <mesh position={[0, 0.4, 0]}>
                      <boxGeometry args={[inner / 3, 0.08, 0.5]} />
                      <meshStandardMaterial color="#78716c" />
                    </mesh>
                    <mesh position={[0, 0.65, -0.12]}>
                      <boxGeometry args={[0.35, 0.25, 0.03]} />
                      <meshStandardMaterial color="#0f172a" emissive={i % 2 ? '#22c55e' : '#38bdf8'} emissiveIntensity={0.8} />
                    </mesh>
                  </group>
                ))}
              </>
            ) : (
              <>
                {/* Sofa and table */}
                <mesh position={[-inner / 4, 0.25, 0]}>
                  <boxGeometry args={[inner / 3, 0.4, 0.4]} />
                  <meshStandardMaterial color={i % 2 ? '#64748b' : '#9a3412'} />
                </mesh>
                <mesh position={[inner / 4, 0.35, 0]}>
                  <boxGeometry args={[0.5, 0.06, 0.5]} />
                  <meshStandardMaterial color="#a16207" />
                </mesh>
              </>
            )}
            {/* A person on this floor */}
            <group position={[(i % 2 ? -1 : 1) * inner * 0.12, 0, 0.25]}>
              <mesh position={[0, 0.35, 0]}>
                <cylinderGeometry args={[0.1, 0.12, 0.7, 8]} />
                <meshStandardMaterial color={p} />
              </mesh>
              <mesh position={[0, 0.8, 0]}>
                <sphereGeometry args={[0.11, 8, 8]} />
                <meshStandardMaterial color="#e0b48a" />
              </mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
};

/** A tower with a procedural window facade (no image downloads). */
const Tower: React.FC<{
  position: V3;
  w: number;
  d: number;
  h: number;
  color: string;
  band?: string;
  round?: boolean;
  sides?: number;
  glass?: boolean;
  facade?: FacadeKind;
}> = ({ position, w, d, h, color, round, sides, glass, facade }) => {
  const curved = Boolean(round || sides);
  const map = useMemo(() => {
    const kind: FacadeKind = facade ?? (glass ? 'glass' : 'residential');
    const across = curved ? (Math.PI * w) / 3.2 : Math.max(w, d) / 3.2;
    return repeated(facadeTexture(kind), Math.max(1, Math.round(across)), Math.max(1, h / 5.6));
  }, [facade, glass, curved, w, d, h]);
  const reveal = useContext(RevealCtx);
  return (
    <group position={position}>
      {reveal.on && <BuildingInside w={w} d={d} h={h} curved={curved} kind={reveal.kind} />}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        {curved ? <cylinderGeometry args={[w / 2, w / 2, h, sides ?? 28]} /> : <boxGeometry args={[w, h, d]} />}
        <meshStandardMaterial
          map={map}
          color={color}
          metalness={glass ? 0.3 : 0.02}
          roughness={glass ? 0.18 : 0.8}
          envMapIntensity={glass ? 1.8 : 0.6}
        />
      </mesh>
      {/* Roof cap */}
      <mesh position={[0, h + 0.15, 0]} castShadow>
        {curved ? <cylinderGeometry args={[w / 2 - 0.1, w / 2, 0.3, sides ?? 28]} /> : <boxGeometry args={[w - 0.2, 0.3, d - 0.2]} />}
        <meshStandardMaterial color="#64748b" roughness={0.7} />
      </mesh>
    </group>
  );
};

const Palm: React.FC<{ position: V3; h?: number }> = ({ position, h = 3.2 }) => (
  <group position={position}>
    <mesh position={[0, h / 2, 0]} castShadow>
      <cylinderGeometry args={[0.12, 0.18, h, 6]} />
      <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
    </mesh>
    {[0, 1, 2, 3, 4].map((i) => (
      <mesh key={i} position={[0, h, 0]} rotation={[0.9, (i * Math.PI * 2) / 5, 0]} castShadow>
        <coneGeometry args={[0.35, 1.8, 4]} />
        <meshStandardMaterial color="#15803d" roughness={0.8} />
      </mesh>
    ))}
  </group>
);

const STONE = '#e3d3ad';
const STONE_DARK = '#c9b78c';

/** Crenellated stone wall segment, like the walls of Jerusalem's Old City. */
const StoneWall: React.FC<{ position: V3; length: number; h: number; rotY?: number }> = ({ position, length, h, rotY = 0 }) => {
  const teeth = Math.floor(length / 0.9);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, h, 0.9]} />
        <meshStandardMaterial color={STONE} roughness={0.95} />
      </mesh>
      {Array.from({ length: teeth }, (_, i) => (
        <mesh key={i} position={[-length / 2 + 0.45 + i * 0.9, h + 0.25, 0]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.9]} />
          <meshStandardMaterial color={STONE} roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
};

const StoneHouse: React.FC<{ position: V3; w: number; d: number; h: number }> = ({ position, w, d, h }) => {
  const map = useMemo(() => repeated(facadeTexture('stone'), Math.max(1, Math.round(w / 2.4)), Math.max(1, h / 4.5)), [w, h]);
  const reveal = useContext(RevealCtx);
  return (
    <group position={position}>
      {reveal.on && <BuildingInside w={w} d={d} h={h} curved={false} kind={w > 5 ? 'office' : 'home'} />}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial map={map} roughness={0.95} />
      </mesh>
    </group>
  );
};

/** TEL AVIV: the three Azrieli towers (round, triangular, square), Bauhaus houses and palms. */
const TelAviv: React.FC = () => (
  <group>
    <Tower position={[-2.5, 0, -2.5]} w={3.4} d={3.4} h={18} color="#e2e8f0" round glass />
    <Tower position={[1.6, 0, -3]} w={3.8} d={3.8} h={16.5} color="#f1f5f9" sides={3} glass />
    <Tower position={[0, 0, 2.5]} w={3.2} d={3.2} h={15} color="#e2e8f0" glass />
    {/* Low glass podium: the stock exchange hall, facing the street */}
    <mesh position={[4.6, 1.1, 1.5]} castShadow receiveShadow>
      <boxGeometry args={[3, 2.2, 6]} />
      <meshStandardMaterial color="#3b82f6" metalness={0.2} roughness={0.3} />
    </mesh>
    {/* White Bauhaus houses with long horizontal balconies */}
    {[
      [-4.8, 4],
      [-2.2, 4.4],
    ].map(([x, z], i) => (
      <group key={i} position={[x, 0, z]}>
        <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 2.8, 1.8]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </mesh>
        {[0.9, 1.9].map((y) => (
          <mesh key={y} position={[0, y, 0.95]}>
            <boxGeometry args={[2.2, 0.12, 0.35]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
        ))}
      </group>
    ))}
  </group>
);

/** JERUSALEM: Old City wall, a citadel tower, stone houses and the Bank of Israel building. */
const Jerusalem: React.FC = () => (
  <group>
    <StoneWall position={[0.5, 0, 5]} length={12} h={2.6} />
    <StoneWall position={[6.3, 0, 0.5]} length={9} h={2.6} rotY={Math.PI / 2} />
    {/* Citadel tower */}
    <group position={[5.2, 0, -4]}>
      <mesh position={[0, 3.2, 0]} castShadow>
        <boxGeometry args={[2.4, 6.4, 2.4]} />
        <meshStandardMaterial color={STONE_DARK} roughness={0.95} />
      </mesh>
      <mesh position={[0, 7.4, 0]} castShadow>
        <cylinderGeometry args={[0.7, 0.8, 2, 8]} />
        <meshStandardMaterial color={STONE} roughness={0.95} />
      </mesh>
    </group>
    {/* Bank of Israel: low, wide modernist stone building */}
    <group position={[-2, 0, -1]}>
      <StoneHouse position={[0, 0, 0]} w={8} d={5.5} h={4.4} />
      <mesh position={[0, 4.6, 0]} castShadow>
        <boxGeometry args={[6, 0.6, 4]} />
        <meshStandardMaterial color={STONE_DARK} roughness={0.9} />
      </mesh>
      {/* Window columns on the street side */}
      {[-3, -1.5, 0, 1.5, 3].map((x) => (
        <mesh key={x} position={[-4.01, 2.2, x * 0.8]}>
          <boxGeometry args={[0.02, 3.4, 0.5]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      ))}
    </group>
    <StoneHouse position={[2.5, 0, 2.2]} w={2.2} d={2} h={2.4} />
    <StoneHouse position={[-5.6, 0, 3]} w={1.8} d={1.8} h={3} />
  </group>
);

/** HAIFA: apartment blocks climbing the Carmel, the Sail Tower and terraced gardens. */
const Haifa: React.FC = () => (
  <group>
    {/* Carmel slope behind the city */}
    <mesh position={[0, 1.5, -3.5]} rotation={[0.35, 0, 0]} receiveShadow>
      <boxGeometry args={[13, 3, 5]} />
      <meshStandardMaterial color="#166534" roughness={0.9} />
    </mesh>
    {/* Terraced gardens up the slope */}
    {[0, 1, 2, 3, 4].map((i) => (
      <mesh key={i} position={[-0.5, 0.3 + i * 0.55, 1.6 - i * 1.0]} receiveShadow castShadow>
        <boxGeometry args={[3.4 - i * 0.4, 0.5, 1]} />
        <meshStandardMaterial color={i % 2 ? '#22c55e' : '#4ade80'} roughness={0.8} />
      </mesh>
    ))}
    {/* Sail Tower (government complex) */}
    <group position={[4.4, 0, 1.5]}>
      <mesh position={[0, 7, 0]} scale={[1, 1, 0.45]} castShadow>
        <cylinderGeometry args={[0.6, 1.7, 14, 3]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.25} />
      </mesh>
    </group>
    {/* Apartment blocks on the slope: the real estate theme */}
    <Tower position={[-4.5, 0, 2]} w={2.2} d={2} h={6} color="#f1e7d0" />
    <Tower position={[-4.5, 1.2, -1.5]} w={2.2} d={2} h={7.5} color="#efe4cc" />
    <Tower position={[2.2, 0.8, -1.8]} w={2} d={2} h={8.5} color="#e7dcc4" />
    <Tower position={[1.6, 0, 3.4]} w={2.4} d={1.8} h={4.5} color="#f5ecd8" />
  </group>
);

/** BE'ER SHEVA: Gav-Yam high-tech park glass towers and the desert. */
const BeerSheva: React.FC = () => (
  <group>
    <Tower position={[-3.2, 0, 0.5]} w={3} d={3} h={11} color="#bae6fd" glass />
    <Tower position={[0.6, 0, -1.8]} w={3} d={3} h={9} color="#93c5fd" glass />
    <Tower position={[3.8, 0, 1.2]} w={2.6} d={2.6} h={7} color="#e0f2fe" glass />
    {/* Pedestrian bridge between towers */}
    <mesh position={[-1.3, 6, -0.6]} rotation={[0, 0.55, 0]} castShadow>
      <boxGeometry args={[4, 0.5, 0.8]} />
      <meshStandardMaterial color="#e2e8f0" metalness={0.4} roughness={0.3} />
    </mesh>
    {/* Desert acacia trees */}
    {[
      [-5.5, 4],
      [5.5, -3.5],
    ].map(([x, z], i) => (
      <group key={i} position={[x, 0, z]}>
        <mesh position={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.15, 1.6, 5]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[0, 1.8, 0]} scale={[1, 0.35, 1]} castShadow>
          <sphereGeometry args={[1.1, 8, 6]} />
          <meshStandardMaterial color="#65a30d" roughness={0.9} />
        </mesh>
      </group>
    ))}
  </group>
);

export const LANDMARK_SIGN_HEIGHT: Record<CityHubId, number> = {
  telaviv: 21,
  jerusalem: 11,
  haifa: 16,
  beersheva: 14,
};

export const Landmark: React.FC<{ id: CityHubId }> = ({ id }) => {
  if (id === 'telaviv') return <TelAviv />;
  if (id === 'jerusalem') return <Jerusalem />;
  if (id === 'haifa') return <Haifa />;
  return <BeerSheva />;
};

/** Many trees drawn as two instanced meshes, cheap even on school computers. */
const Forest: React.FC = () => {
  const spots = useMemo(() => {
    const out: Array<[number, number, number]> = [];
    let seed = 7;
    const r = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const clear = (x: number, z: number) =>
      Math.abs(x + 4) < 7 || (Math.abs(z) < 7 && x > -18 && x < 16) || // roads
      (Math.abs(x - 2.5) < 2.2 && z > -22 && z < 27) || (Math.abs(z - 7) < 2 && x > -11 && x < 4) || (Math.abs(z + 20) < 2 && x > -10 && x < 4) || // railway
      [[-10, -34, 9], [-18, -4, 10], [15, 3, 10], [-4, 34, 10]].some(([cx, cz, rr]) => Math.hypot(x - cx, z - cz) < rr);
    while (out.length < 140) {
      const x = -20 + r() * 44;
      const z = -44 + r() * 64; // north and centre only (the Negev stays open desert)
      if (!clear(x, z)) out.push([x, z, 0.7 + r() * 0.7]);
    }
    return out;
  }, []);
  const trunks = React.useRef<THREE.InstancedMesh>(null);
  const crowns = React.useRef<THREE.InstancedMesh>(null);
  React.useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    spots.forEach(([x, z, sc], i) => {
      m.compose(new THREE.Vector3(x, 0.6 * sc, z), new THREE.Quaternion(), new THREE.Vector3(sc, sc, sc));
      trunks.current?.setMatrixAt(i, m);
      m.compose(new THREE.Vector3(x, 1.9 * sc, z), new THREE.Quaternion(), new THREE.Vector3(sc, sc, sc));
      crowns.current?.setMatrixAt(i, m);
    });
    if (trunks.current) trunks.current.instanceMatrix.needsUpdate = true;
    if (crowns.current) crowns.current.instanceMatrix.needsUpdate = true;
  }, [spots]);
  return (
    <group>
      <instancedMesh ref={trunks} args={[undefined, undefined, spots.length]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.2, 6]} />
        <meshStandardMaterial color="#6b4423" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={crowns} args={[undefined, undefined, spots.length]} castShadow receiveShadow>
        <icosahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial color="#3f7d2c" roughness={0.85} flatShading />
      </instancedMesh>
    </group>
  );
};

const StreetLamp: React.FC<{ position: V3 }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 1.8, 0]}>
      <cylinderGeometry args={[0.06, 0.08, 3.6, 6]} />
      <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
    </mesh>
    <mesh position={[0, 3.6, 0]}>
      <sphereGeometry args={[0.18, 8, 8]} />
      <meshStandardMaterial color="#fef9c3" emissive="#fde68a" emissiveIntensity={1.2} />
    </mesh>
  </group>
);

/** Extra scenery outside the city footprints. */
export const Scenery: React.FC = () => (
  <group>
    <Forest />
    {[-30, -20, -10, 10, 20, 30].map((z) => (
      <StreetLamp key={z} position={[1.4, 0, z]} />
    ))}
    {/* Tel Aviv beach promenade palms */}
    {[-16, -12, -8, -4, 0, 4, 8].map((z) => (
      <Palm key={z} position={[-24.5, 0, z]} h={3 + (z % 3 === 0 ? 0.6 : 0)} />
    ))}
    {/* Chords Bridge at the entrance to Jerusalem (Highway 1) */}
    <group position={[5, 0, -6.5]}>
      {/* Bridge deck the cables hold */}
      <mesh position={[0.6, 1.2, -3]} castShadow>
        <boxGeometry args={[1.2, 0.25, 7]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
      </mesh>
      <mesh position={[0, 4.5, 0]} rotation={[0, 0, -0.25]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, 9, 8]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.3} roughness={0.3} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => {
        const len = 3 + i * 0.7;
        const ang = 0.35 + i * 0.09;
        return (
          <mesh key={i} position={[Math.sin(ang) * len * 0.5 - 1, 8.2 - Math.cos(ang) * len * 0.5, -0.4 - i * 0.6]} rotation={[0, 0, ang]}>
            <cylinderGeometry args={[0.02, 0.02, len, 4]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
        );
      })}
    </group>
    {/* Haifa port: container stacks */}
    {[
      [-16, -38, '#dc2626'],
      [-16, -36.4, '#2563eb'],
      [-17.6, -38, '#16a34a'],
      [-17.6, -36.4, '#f59e0b'],
    ].map(([x, z, c], i) => (
      <mesh key={i} position={[x as number, 0.5 + (i % 2) * 0, z as number]} castShadow>
        <boxGeometry args={[1.4, 1, 1.4]} />
        <meshStandardMaterial color={c as string} roughness={0.7} />
      </mesh>
    ))}
    {/* Ashalim-style solar field around the solar tower in the Negev */}
    {Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      const r = 3.6 + (i % 2) * 1.4;
      return (
        <mesh key={i} position={[8 + Math.cos(a) * r, 0.5, 34 + Math.sin(a) * r]} rotation={[-0.5, -a + Math.PI / 2, 0]} castShadow>
          <boxGeometry args={[1, 0.08, 0.7]} />
          <meshStandardMaterial color="#93c5fd" metalness={0.8} roughness={0.15} />
        </mesh>
      );
    })}
  </group>
);
