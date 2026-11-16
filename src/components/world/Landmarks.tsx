import React from 'react';
import { CityHubId } from '../../types/game';

/**
 * Stylized landmarks for each city, built from simple shapes so the game stays
 * light enough for school computers. Coordinates are local to the city's
 * footprint (ground level y = 0), which stays inside CITY_HUBS[].size for collisions.
 */

type V3 = [number, number, number];

/** A tower with darker floor bands, so it reads as a building with storeys. */
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
}> = ({ position, w, d, h, color, band = '#0f172a', round, sides, glass }) => {
  const floors = Math.max(2, Math.floor(h / 1.6));
  const shape = (scale: number, height: number) =>
    round || sides ? (
      <cylinderGeometry args={[(w / 2) * scale, (w / 2) * scale, height, sides ?? 24]} />
    ) : (
      <boxGeometry args={[w * scale, height, d * scale]} />
    );
  return (
    <group position={position}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        {shape(1, h)}
        <meshStandardMaterial color={color} metalness={glass ? 0.25 : 0.05} roughness={glass ? 0.3 : 0.75} emissive={glass ? color : '#000000'} emissiveIntensity={glass ? 0.12 : 0} />
      </mesh>
      {Array.from({ length: floors - 1 }, (_, i) => (
        <mesh key={i} position={[0, ((i + 1) * h) / floors, 0]}>
          {shape(1.015, 0.12)}
          <meshStandardMaterial color={band} roughness={0.6} />
        </mesh>
      ))}
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

const StoneHouse: React.FC<{ position: V3; w: number; d: number; h: number }> = ({ position, w, d, h }) => (
  <group position={position}>
    <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={STONE} roughness={0.95} />
    </mesh>
    {/* Arched-window band */}
    <mesh position={[0, h * 0.6, d / 2 + 0.01]}>
      <boxGeometry args={[w * 0.7, h * 0.18, 0.02]} />
      <meshStandardMaterial color="#5b4a2f" />
    </mesh>
  </group>
);

/** TEL AVIV: the three Azrieli towers (round, triangular, square), Bauhaus houses and palms. */
const TelAviv: React.FC = () => (
  <group>
    <Tower position={[-2.5, 0, -2.5]} w={3.4} d={3.4} h={18} color="#c7d2e0" band="#475569" round glass />
    <Tower position={[1.6, 0, -3]} w={3.8} d={3.8} h={16.5} color="#d5dde8" band="#475569" sides={3} glass />
    <Tower position={[0, 0, 2.5]} w={3.2} d={3.2} h={15} color="#b8c4d4" band="#475569" glass />
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
      <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[8, 4.4, 5.5]} />
        <meshStandardMaterial color={STONE} roughness={0.9} />
      </mesh>
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
    <Tower position={[-4.5, 0, 2]} w={2.2} d={2} h={6} color="#f1e7d0" band="#a8a29e" />
    <Tower position={[-4.5, 1.2, -1.5]} w={2.2} d={2} h={7.5} color="#efe4cc" band="#a8a29e" />
    <Tower position={[2.2, 0.8, -1.8]} w={2} d={2} h={8.5} color="#e7dcc4" band="#a8a29e" />
    <Tower position={[1.6, 0, 3.4]} w={2.4} d={1.8} h={4.5} color="#f5ecd8" band="#a8a29e" />
  </group>
);

/** BE'ER SHEVA: Gav-Yam high-tech park glass towers and the desert. */
const BeerSheva: React.FC = () => (
  <group>
    <Tower position={[-3.2, 0, 0.5]} w={3} d={3} h={11} color="#7dd3fc" band="#0369a1" glass />
    <Tower position={[0.6, 0, -1.8]} w={3} d={3} h={9} color="#38bdf8" band="#0369a1" glass />
    <Tower position={[3.8, 0, 1.2]} w={2.6} d={2.6} h={7} color="#bae6fd" band="#0369a1" glass />
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

/** Extra scenery outside the city footprints. */
export const Scenery: React.FC = () => (
  <group>
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
