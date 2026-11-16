import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { CITY_HUBS, useGameStore } from '../../store/gameStore';
import { HEBREW_FONT } from '../../fonts';
import { Landmark, LANDMARK_SIGN_HEIGHT } from './Landmarks';

export const CityHubs: React.FC = () => {
  const nearbyHub = useGameStore((s) => s.nearbyHub);
  const enterBuilding = useGameStore((s) => s.enterBuilding);
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
              <Landmark id={hub.id} />
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
                  color="#fde68a"
                  outlineWidth={0.08}
                  outlineColor="#0f172a"
                  anchorY="top"
                >
                  {hub.hubTitle}
                </Text>
              </Billboard>
            </group>

            {/* Glowing Entry Pad */}
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
                  color={hub.color}
                  emissive={hub.color}
                  emissiveIntensity={isNear ? 1.5 : 0.7}
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
                  color="#ffffff"
                  emissive={hub.color}
                  emissiveIntensity={1}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
};
