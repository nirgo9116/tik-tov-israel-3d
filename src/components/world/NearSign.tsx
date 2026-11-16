import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const tmp = new THREE.Vector3();

/** Shows its children only when the camera is between `min` and `max` units away, to keep the screen clear. */
export const NearSign: React.FC<{ min?: number; max?: number; children: React.ReactNode }> = ({ min = 5, max = 30, children }) => {
  const g = useRef<THREE.Group>(null);
  useFrame(({ camera }) => {
    if (!g.current) return;
    (g.current.children[0] ?? g.current).getWorldPosition(tmp);
    const d = tmp.distanceTo(camera.position);
    g.current.visible = d > min && d < max;
  });
  return <group ref={g}>{children}</group>;
};
