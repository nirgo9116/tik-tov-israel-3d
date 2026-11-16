import React, { useRef } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';

/** Invisible floor that catches clicks/taps and sends the player walking there. */
export const WalkPlane: React.FC<{ size: [number, number] }> = ({ size }) => {
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    const s = useGameStore.getState();
    if (s.openHub || s.tikOpen || s.trainOpen || s.trainRide || s.overview) return;
    s.setMoveTarget([e.point.x, e.point.z]);
  };
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} onClick={onClick}>
      <planeGeometry args={size} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
};

/** Pulsing ring where the player is walking to. */
export const WalkMarker: React.FC = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = useGameStore.getState().moveTarget;
    if (!ref.current) return;
    ref.current.visible = Boolean(t);
    if (t) {
      ref.current.position.set(t[0], 0.06, t[1]);
      const k = 1 + Math.sin(clock.getElapsedTime() * 8) * 0.15;
      ref.current.scale.set(k, k, 1);
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <ringGeometry args={[0.35, 0.55, 24]} />
      <meshBasicMaterial color="#facc15" />
    </mesh>
  );
};
