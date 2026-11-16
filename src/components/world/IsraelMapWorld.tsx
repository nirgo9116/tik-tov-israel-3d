import React, { useMemo } from 'react';
import { HEBREW_FONT } from '../../fonts';
import { Text, Billboard } from '@react-three/drei';
import { Scenery } from './Landmarks';

export const IsraelMapWorld: React.FC = () => {
  const highwayDashes = useMemo(() => {
    const list: { x: number; z: number; rotY: number }[] = [];
    // Route 6 North-South spine (x = -4)
    for (let z = -34; z <= 34; z += 5) {
      list.push({ x: -4, z, rotY: 0 });
    }
    // Highway 1 Tel Aviv -> Jerusalem (z = 0, x from -16 to +12)
    for (let x = -14; x <= 10; x += 5) {
      list.push({ x, z: 0, rotY: Math.PI / 2 });
    }
    return list;
  }, []);

  return (
    <group>
      {/* Mediterranean Sky & Horizon Fog */}
      <color attach="background" args={['#0c192c']} />
      <fog attach="fog" args={['#0c192c', 65, 150]} />

      {/* Sunlit Mediterranean Lighting */}
      <hemisphereLight args={['#bae6fd', '#334155', 0.95]} />
      <directionalLight
        position={[35, 60, 20]}
        intensity={1.55}
        color="#fef3c7"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-65}
        shadow-camera-right={65}
        shadow-camera-top={65}
        shadow-camera-bottom={-65}
      />

      {/* MEDITERRANEAN SEA (West Coastline) */}
      <mesh rotation={[-Math.PI / 2, 0, -0.14]} position={[-46, -0.15, 0]} receiveShadow>
        <planeGeometry args={[52, 160]} />
        <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.4} />
      </mesh>
      {/* Golden Coastal Beach Strip */}
      <mesh rotation={[-Math.PI / 2, 0, -0.14]} position={[-22, -0.06, 0]} receiveShadow>
        <planeGeometry args={[5, 150]} />
        <meshStandardMaterial color="#eab308" roughness={0.9} />
      </mesh>

      {/* REGION 1: HAIFA & GALILEE (North - Lush Mediterranean Green) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4, -0.04, -32]} receiveShadow>
        <planeGeometry args={[56, 36]} />
        <meshStandardMaterial color="#166534" roughness={0.9} />
      </mesh>
      {/* Mount Carmel & Galilee Hills */}
      {[
        [-20, -40, 6, 4.5],
        [6, -42, 8, 5.5],
        [18, -32, 7, 4.8],
        [-22, -24, 5, 3.5],
      ].map(([hx, hz, r, h], idx) => (
        <mesh key={`galilee-${idx}`} position={[hx, h / 2 - 0.5, hz]} castShadow receiveShadow>
          <coneGeometry args={[r, h, 7]} />
          <meshStandardMaterial color="#15803d" roughness={0.85} />
        </mesh>
      ))}
      {/* Haifa Port Cranes & Cargo Ship */}
      <group position={[-20, 0, -34]}>
        <mesh position={[-3, 0.4, 0]} castShadow>
          <boxGeometry args={[4.5, 0.8, 1.8]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        <mesh position={[-1, 2.2, -2]} castShadow>
          <boxGeometry args={[0.4, 4.4, 0.4]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
        <mesh position={[-2.2, 4.1, -2]} castShadow>
          <boxGeometry args={[3.2, 0.35, 0.35]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      </group>

      {/* REGION 2: CENTRAL COASTAL PLAIN & JUDEAN HILLS (Tel Aviv & Jerusalem) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4, -0.04, 0]} receiveShadow>
        <planeGeometry args={[56, 30]} />
        <meshStandardMaterial color="#3f6212" roughness={0.9} />
      </mesh>
      {/* Judean Hills & Jerusalem Stone Terraces (East) */}
      {[
        [24, -10, 7, 5.2],
        [26, 8, 8, 6.0],
        [20, 14, 6, 4.2],
        [12, -12, 5.5, 3.8],
      ].map(([jx, jz, r, h], idx) => (
        <mesh key={`judea-${idx}`} position={[jx, h / 2 - 0.5, jz]} castShadow receiveShadow>
          <coneGeometry args={[r, h, 6]} />
          <meshStandardMaterial color="#a8a29e" roughness={0.85} />
        </mesh>
      ))}
      <Scenery />

      {/* REGION 3: BE'ER SHEVA & THE NEGEV DESERT (South - Golden Sandstone) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4, -0.04, 32]} receiveShadow>
        <planeGeometry args={[56, 36]} />
        <meshStandardMaterial color="#b45309" roughness={0.95} />
      </mesh>
      {/* Negev Desert Mesas & Solar Array */}
      {[
        [16, 28, 7, 4.5],
        [-18, 36, 6.5, 4.0],
        [14, 42, 8, 5.0],
      ].map(([nx, nz, r, h], idx) => (
        <mesh key={`negev-${idx}`} position={[nx, h / 2 - 0.5, nz]} castShadow receiveShadow>
          <cylinderGeometry args={[r * 0.55, r, h, 7]} />
          <meshStandardMaterial color="#d97706" roughness={0.9} />
        </mesh>
      ))}
      {/* Negev Solar Thermal Tower & Panels */}
      <group position={[8, 0, 34]}>
        <mesh position={[0, 4.5, 0]} castShadow>
          <cylinderGeometry args={[0.45, 0.8, 9, 12]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0, 9.2, 0]}>
          <sphereGeometry args={[0.85, 16, 16]} />
          <meshStandardMaterial color="#fef08a" emissive="#f59e0b" emissiveIntensity={2} />
        </mesh>
        {[-3, 3].map((px, i) => (
          <mesh key={i} position={[px, 0.8, 2.5]} rotation={[-0.4, 0, 0]} castShadow>
            <boxGeometry args={[2.4, 0.15, 1.8]} />
            <meshStandardMaterial color="#1d4ed8" metalness={0.7} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* DEAD SEA / JORDAN VALLEY (Eastern Border) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[34, -0.1, 14]} receiveShadow>
        <planeGeometry args={[8, 34]} />
        <meshStandardMaterial color="#06b6d4" roughness={0.25} />
      </mesh>

      {/* ISRAEL'S NATIONAL HIGHWAY NETWORK */}
      {/* Route 6 (Trans-Israel North-South Highway: Haifa -> Center -> Be'er Sheva) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4, 0.01, 0]} receiveShadow>
        <planeGeometry args={[10, 74]} />
        <meshStandardMaterial color="#111827" roughness={0.8} />
      </mesh>
      {/* Highway 1 (Tel Aviv <-> Jerusalem East-West Corridor) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1, 0.01, 0]} receiveShadow>
        <planeGeometry args={[34, 10]} />
        <meshStandardMaterial color="#111827" roughness={0.8} />
      </mesh>
      {/* Coastal Connector to Haifa */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8, 0.01, -26]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#111827" roughness={0.8} />
      </mesh>

      {/* Road Center Markings */}
      {highwayDashes.map((d, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, d.rotY]} position={[d.x, 0.03, d.z]}>
          <planeGeometry args={[0.32, 2.4]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.25} />
        </mesh>
      ))}

      {/* Highway Direction Signs */}
      <Billboard position={[-4, 3.6, -16]}>
        <Text font={HEBREW_FONT} direction="rtl" fontSize={0.85} color="#38bdf8" outlineWidth={0.08} outlineColor="#0f172a">
          צפון: חיפה והגליל
        </Text>
      </Billboard>
      <Billboard position={[3, 3.6, -4.5]}>
        <Text font={HEBREW_FONT} direction="rtl" fontSize={0.85} color="#34d399" outlineWidth={0.08} outlineColor="#0f172a">
          מזרח: ירושלים, כביש 1
        </Text>
      </Billboard>
      <Billboard position={[-4, 3.6, 16]}>
        <Text font={HEBREW_FONT} direction="rtl" fontSize={0.85} color="#c084fc" outlineWidth={0.08} outlineColor="#0f172a">
          דרום: באר שבע והנגב
        </Text>
      </Billboard>
    </group>
  );
};
