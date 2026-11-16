import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { CITY_HUBS, cityStage, useGameStore } from '../../store/gameStore';
import { HEBREW_FONT } from '../../fonts';
import { InteriorKind, Landmark, LANDMARK_SIGN_HEIGHT, RevealCtx } from './Landmarks';
import type { CityHubInfo } from '../../types/game';

const REVEAL: Record<string, { kind: InteriorKind; text: string }> = {
  telaviv: { kind: 'office', text: 'מגדלי משרדים: כאן עובדות חברות שהמניות שלהן נסחרות בבורסה' },
  jerusalem: { kind: 'home', text: 'בתים ובנק ישראל: כאן נקבעת הריבית שמשפיעה על החיסכון' },
  haifa: { kind: 'home', text: 'בנייני מגורים: דירות לגור בהן, או לקנות ולהשכיר' },
  beersheva: { kind: 'office', text: 'פארק הייטק: העובדים כאן מקבלים משכורת, וחלק ממנה נחסך' },
};

/** Fades a city's buildings when the player is close or inside, and shows what is in them. */
const RevealGroup: React.FC<{ hub: CityHubInfo; children: React.ReactNode }> = ({ hub, children }) => {
  const g = useRef<THREE.Group>(null);
  const [on, setOn] = useState(false);
  const opacity = useRef(1);
  useFrame((_, dt) => {
    const [px, , pz] = useGameStore.getState().playerPos;
    const [bx, , bz] = hub.position;
    const [bw, , bd] = hub.size;
    const near = Math.abs(px - bx) < bw / 2 + 3.5 && Math.abs(pz - bz) < bd / 2 + 3.5;
    if (near !== on) setOn(near);
    const target = near ? 0.18 : 1;
    if (Math.abs(opacity.current - target) < 0.005 || !g.current) return;
    opacity.current += (target - opacity.current) * Math.min(1, dt * 5);
    if (Math.abs(opacity.current - target) < 0.01) opacity.current = target;
    const o = opacity.current;
    const visit = (obj: THREE.Object3D) => {
      if (obj.userData.inside) return;
      const m = (obj as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (m && 'opacity' in m) {
        if (m.transparent !== o < 1) m.needsUpdate = true; // shader must be rebuilt when transparency switches
        m.transparent = o < 1;
        m.opacity = o;
        m.depthWrite = o >= 1;
      }
      obj.children.forEach(visit);
    };
    visit(g.current);
  });
  const info = REVEAL[hub.id];
  return (
    <RevealCtx.Provider value={{ on, kind: info.kind }}>
      <group ref={g}>{children}</group>
      {on && (
        <Billboard position={[0, 2.2, hub.size[2] / 2 + 0.5]}>
          <Text font={HEBREW_FONT} direction="rtl" fontSize={0.4} color="#fef9c3" outlineWidth={0.05} outlineColor="#0f172a" maxWidth={10} textAlign="center">
            {info.text}
          </Text>
        </Billboard>
      )}
    </RevealCtx.Provider>
  );
};

export const CityHubs: React.FC = () => {
  const nearbyHub = useGameStore((s) => s.nearbyHub);
  const enterBuilding = useGameStore((s) => s.enterBuilding);
  const stage = useGameStore((s) => s.stage);
  const ringRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ringRefs.current.forEach((mesh, i) => {
      if (mesh) {
        const scale = 1 + Math.sin(t * 3 + i) * 0.1;
        mesh.scale.set(scale, scale, 1);
      }
    });
  });

  return (
    <group>
      {CITY_HUBS.map((hub, index) => {
        const isNear = nearbyHub === hub.id;
        const [bx, , bz] = hub.position;
        const [ex, , ez] = hub.entryPos;
        const hubStage = cityStage(hub.id);
        const active = hubStage === stage;
        const status =
          hubStage === null ? 'עבודת קיץ בלבד' : active ? `שלב ${hubStage}: ${hub.hubTitle}` : hubStage > stage ? `נעול: נפתח בשלב ${hubStage}` : `שלב ${hubStage} הסתיים`;

        return (
          <group key={hub.id}>
            {/* City landmarks (clicking opens the city) */}
            <group
              position={[bx, 0, bz]}
              onClick={(e) => {
                e.stopPropagation();
                enterBuilding(hub.id);
              }}
            >
              <RevealGroup hub={hub}>
                <Landmark id={hub.id} />
              </RevealGroup>
              <Billboard position={[0, LANDMARK_SIGN_HEIGHT[hub.id], 0]}>
                <Text
                  font={HEBREW_FONT}
                  direction="rtl"
                  fontSize={1.45}
                  color="#ffffff"
                  outlineWidth={0.12}
                  outlineColor="#0f172a"
                  anchorY="bottom"
                >
                  {hub.hebrewName}
                </Text>
                <Text
                  font={HEBREW_FONT}
                  direction="rtl"
                  position={[0, -0.3, 0]}
                  fontSize={0.78}
                  color={active ? '#fde68a' : '#94a3b8'}
                  outlineWidth={0.08}
                  outlineColor="#0f172a"
                  anchorY="top"
                >
                  {status}
                </Text>
              </Billboard>
            </group>

            {/* Beacon over the building of the current stage */}
            {active && (
              <mesh position={[bx, 40, bz]}>
                <cylinderGeometry args={[1.2, 1.2, 80, 16, 1, true]} />
                <meshBasicMaterial color={hub.color} transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
              </mesh>
            )}

            {/* Glowing Entry Pad (grey when the stage is locked or over) */}
            {hubStage !== null && (
            <group
              position={[ex, 0.06, ez]}
              onClick={(e) => {
                e.stopPropagation();
                enterBuilding(hub.id);
              }}
            >
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[2.6, 32]} />
                <meshStandardMaterial
                  color={active ? hub.color : '#64748b'}
                  emissive={active ? hub.color : '#000000'}
                  emissiveIntensity={active ? (isNear ? 1.5 : 0.7) : 0}
                  transparent
                  opacity={0.78}
                />
              </mesh>
              <mesh
                ref={(el) => {
                  ringRefs.current[index] = el;
                }}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.02, 0]}
              >
                <ringGeometry args={[2.7, 3.25, 32]} />
                <meshStandardMaterial
                  color={active ? '#ffffff' : '#94a3b8'}
                  emissive={active ? hub.color : '#000000'}
                  emissiveIntensity={active ? 1 : 0}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
            )}
          </group>
        );
      })}
    </group>
  );
};
