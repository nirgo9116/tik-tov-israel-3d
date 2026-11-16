import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { CITY_HUBS, useGameStore } from '../../store/gameStore';
import { HEBREW_FONT } from '../../fonts';
import { NearSign } from './NearSign';
import { RAIL_EDGES, RAIL_NODES, STATIONS, pathLength, pointAt, railPath } from '../../data/rail';

const TRAIN_SPEED = 13;
const CAR_GAP = 3.3;

/** Track: gravel bed, two rails and sleepers along every edge, plus a platform at each station. */
export const Railway: React.FC = () => {
  const jobOn = useGameStore((s) => Boolean(s.activeJob));
  const sleepers = useMemo(() => {
    const out: Array<{ x: number; z: number; rot: number }> = [];
    for (const [a, b] of RAIL_EDGES) {
      const [ax, az] = RAIL_NODES[a];
      const [bx, bz] = RAIL_NODES[b];
      const L = Math.hypot(bx - ax, bz - az);
      const rot = Math.atan2(bx - ax, bz - az);
      for (let d = 0.4; d < L; d += 0.9) out.push({ x: ax + ((bx - ax) * d) / L, z: az + ((bz - az) * d) / L, rot });
    }
    return out;
  }, []);
  const inst = useRef<THREE.InstancedMesh>(null);
  React.useLayoutEffect(() => {
    const m = new THREE.Object3D();
    sleepers.forEach((s, i) => {
      m.position.set(s.x, 0.09, s.z);
      m.rotation.set(0, s.rot, 0);
      m.updateMatrix();
      inst.current!.setMatrixAt(i, m.matrix);
    });
    inst.current!.instanceMatrix.needsUpdate = true;
  }, [sleepers]);

  return (
    <group>
      {RAIL_EDGES.map(([a, b]) => {
        const [ax, az] = RAIL_NODES[a];
        const [bx, bz] = RAIL_NODES[b];
        const L = Math.hypot(bx - ax, bz - az);
        const rot = Math.atan2(bx - ax, bz - az);
        return (
          <group key={a + b} position={[(ax + bx) / 2, 0, (az + bz) / 2]} rotation={[0, rot, 0]}>
            <mesh position={[0, 0.04, 0]} receiveShadow>
              <boxGeometry args={[1.8, 0.08, L + 1.8]} />
              <meshStandardMaterial color="#8b8178" roughness={1} />
            </mesh>
            {[-0.45, 0.45].map((dx) => (
              <mesh key={dx} position={[dx, 0.16, 0]}>
                <boxGeometry args={[0.09, 0.08, L + 1.8]} />
                <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.35} />
              </mesh>
            ))}
          </group>
        );
      })}
      <instancedMesh ref={inst} args={[undefined, undefined, sleepers.length]} receiveShadow>
        <boxGeometry args={[1.4, 0.06, 0.22]} />
        <meshStandardMaterial color="#5b4636" roughness={1} />
      </instancedMesh>
      {STATIONS.map((id) => {
        const [x, z] = RAIL_NODES[id];
        const hub = CITY_HUBS.find((h) => h.id === id)!;
        const ns = id !== 'telaviv' && id !== 'haifa';
        return (
          <group key={id} position={[x + (ns ? 1.7 : 0), 0, z + (ns ? 0 : -1.7)]} rotation={[0, ns ? 0 : Math.PI / 2, 0]}>
            <mesh position={[0, 0.25, 0]} receiveShadow castShadow>
              <boxGeometry args={[1.4, 0.5, 6]} />
              <meshStandardMaterial color="#d6d3d1" />
            </mesh>
            <mesh position={[0.2, 2.2, 0]} castShadow>
              <boxGeometry args={[1.6, 0.12, 4.5]} />
              <meshStandardMaterial color={hub.color} />
            </mesh>
            {[-1.8, 1.8].map((dz) => (
              <mesh key={dz} position={[0.4, 1.3, dz]}>
                <cylinderGeometry args={[0.06, 0.06, 1.7, 8]} />
                <meshStandardMaterial color="#475569" />
              </mesh>
            ))}
            {!jobOn && (
              <NearSign min={10} max={24}>
                <Billboard position={[0, 3.1, 0]}>
                  <Text font={HEBREW_FONT} direction="rtl" fontSize={0.42} color="#f8fafc" outlineWidth={0.05} outlineColor="#0f172a">
                    {`תחנת רכבת ${hub.hebrewName}`}
                  </Text>
                </Billboard>
              </NearSign>
            )}
          </group>
        );
      })}
    </group>
  );
};

/** One passenger car: white body, coloured stripe, windows. */
const TrainCar: React.FC<{ front?: boolean }> = ({ front }) => (
  <group>
    <mesh position={[0, 0.95, 0]} castShadow>
      <boxGeometry args={[1.25, 1.4, 3]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.2} />
    </mesh>
    <mesh position={[0, 0.55, 0]}>
      <boxGeometry args={[1.27, 0.22, 3.02]} />
      <meshStandardMaterial color="#dc2626" />
    </mesh>
    <mesh position={[0, 1.2, 0]}>
      <boxGeometry args={[1.28, 0.42, 2.6]} />
      <meshStandardMaterial color="#1e293b" roughness={0.1} metalness={0.6} />
    </mesh>
    {front && (
      <mesh position={[0, 1.1, 1.52]}>
        <boxGeometry args={[1.0, 0.5, 0.04]} />
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.8} />
      </mesh>
    )}
  </group>
);

/**
 * The train. Idle: it shuttles between Haifa and Be'er Sheva. During the player's ride it follows
 * the ride's track with the camera, then drops the player at the city.
 */
export const Train: React.FC = () => {
  const { camera } = useThree();
  const cars = useRef<Array<THREE.Group | null>>([]);
  const ride = useGameStore((s) => s.trainRide);
  const finishTrainRide = useGameStore((s) => s.finishTrainRide);
  const idlePath = useMemo(() => railPath('haifa', 'beersheva'), []);
  const idleLen = useMemo(() => pathLength(idlePath), [idlePath]);
  const rideState = useRef<{ ride: typeof ride; d: number; wait: number }>({ ride: null, d: 0, wait: 0 });
  const idle = useRef({ d: 10, dir: 1, wait: 0 });

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    let path = idlePath;
    let head: number;
    let reversed = false;
    if (ride) {
      const st = rideState.current;
      if (st.ride !== ride) {
        st.ride = ride;
        st.d = CAR_GAP * 2;
        st.wait = 0.6;
      }
      path = ride.path;
      const L = pathLength(path);
      if (st.wait > 0) st.wait -= dt;
      else st.d = Math.min(L, st.d + TRAIN_SPEED * dt * Math.min(1, (L - st.d) / 4 + 0.25));
      head = st.d;
      if (st.d >= L - 0.05) {
        st.ride = null;
        finishTrainRide();
      }
      const p = pointAt(path, head);
      // Camera beside and above the train
      const cam = new THREE.Vector3(p.x - Math.sin(p.rot) * 9 + Math.cos(p.rot) * 6, 7, p.z - Math.cos(p.rot) * 9 - Math.sin(p.rot) * 6);
      camera.up.set(0, 1, 0);
      camera.position.lerp(cam, 1 - Math.exp(-3 * dt));
      camera.lookAt(p.x, 1, p.z);
    } else {
      const s = idle.current;
      if (s.wait > 0) s.wait -= dt;
      else {
        s.d += s.dir * 7 * dt;
        if (s.d > idleLen) {
          s.d = idleLen;
          s.dir = -1;
          s.wait = 3;
        } else if (s.d < CAR_GAP * 2) {
          s.d = CAR_GAP * 2;
          s.dir = 1;
          s.wait = 3;
        }
      }
      reversed = s.dir < 0;
      head = s.d;
    }
    cars.current.forEach((g, i) => {
      if (!g) return;
      const d = reversed ? head - CAR_GAP * 2 + i * CAR_GAP : head - i * CAR_GAP;
      const p = pointAt(path, Math.max(0, d));
      g.position.set(p.x, 0.15, p.z);
      g.rotation.y = p.rot + (reversed ? Math.PI : 0);
    });
  });

  return (
    <group>
      {[0, 1, 2].map((i) => (
        <group key={i} ref={(g) => (cars.current[i] = g)}>
          <TrainCar front={i === 0} />
        </group>
      ))}
    </group>
  );
};

/** A low-poly car. */
const CarMesh: React.FC<{ color: string }> = ({ color }) => (
  <group>
    <mesh position={[0, 0.45, 0]} castShadow>
      <boxGeometry args={[1.2, 0.5, 2.4]} />
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.35} />
    </mesh>
    <mesh position={[0, 0.88, -0.15]} castShadow>
      <boxGeometry args={[1.05, 0.42, 1.3]} />
      <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.15} />
    </mesh>
    {[[-0.6, 0.8], [0.6, 0.8], [-0.6, -0.8], [0.6, -0.8]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.22, z]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.22, 0.22, 0.15, 12]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
    ))}
    <mesh position={[0, 0.5, 1.21]}>
      <boxGeometry args={[0.9, 0.12, 0.02]} />
      <meshStandardMaterial color="#fef9c3" emissive="#fef9c3" emissiveIntensity={0.8} />
    </mesh>
  </group>
);

/** Background traffic on the highways. Cars stop when the player is in front of them. */
const CAR_ROUTES: Array<{ color: string; loop: Array<[number, number]>; speed: number; start: number }> = [
  { color: '#ef4444', loop: [[-6.5, -36], [-6.5, 36], [-1.5, 36], [-1.5, -36], [-6.5, -36]], speed: 9, start: 0 },
  { color: '#e5e7eb', loop: [[-17, 2.5], [15, 2.5], [15, -2.5], [-17, -2.5], [-17, 2.5]], speed: 8, start: 20 },
];

export const Traffic: React.FC = () => {
  const refs = useRef<Array<THREE.Group | null>>([]);
  const dist = useRef(CAR_ROUTES.map((r) => r.start));
  const lens = useMemo(() => CAR_ROUTES.map((r) => pathLength(r.loop)), []);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    const [px, , pz] = useGameStore.getState().playerPos;
    CAR_ROUTES.forEach((r, i) => {
      const g = refs.current[i];
      if (!g) return;
      const p = pointAt(r.loop, dist.current[i]);
      const ahead = { x: p.x + Math.sin(p.rot) * 2.5, z: p.z + Math.cos(p.rot) * 2.5 };
      const blocked = Math.hypot(px - ahead.x, pz - ahead.z) < 2.2;
      if (!blocked) dist.current[i] = (dist.current[i] + r.speed * dt) % lens[i];
      g.position.set(p.x, 0, p.z);
      g.rotation.y = p.rot;
    });
  });
  return (
    <group>
      {CAR_ROUTES.map((r, i) => (
        <group key={i} ref={(g) => (refs.current[i] = g)}>
          <CarMesh color={r.color} />
        </group>
      ))}
    </group>
  );
};
