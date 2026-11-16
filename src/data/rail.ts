import type { CityHubId } from '../types/game';

/** The railway in the 3D world: a small graph of points [x, z]. */
export const RAIL_NODES: Record<string, [number, number]> = {
  haifa: [-8, -20],
  bend: [2.5, -20],
  junction: [2.5, 7],
  jerusalem: [2.5, 11],
  beersheva: [2.5, 24],
  telaviv: [-9, 7],
};
export const RAIL_EDGES: Array<[string, string]> = [
  ['haifa', 'bend'],
  ['bend', 'junction'],
  ['junction', 'jerusalem'],
  ['jerusalem', 'beersheva'],
  ['junction', 'telaviv'],
];
export const STATIONS: CityHubId[] = ['haifa', 'telaviv', 'jerusalem', 'beersheva'];

/** Nearest station to a point. */
export function nearestStation(x: number, z: number): CityHubId {
  let best: CityHubId = 'telaviv';
  let d = Infinity;
  for (const s of STATIONS) {
    const [sx, sz] = RAIL_NODES[s];
    const dd = Math.hypot(x - sx, z - sz);
    if (dd < d) {
      d = dd;
      best = s;
    }
  }
  return best;
}

/** Points along the track from one station to another (breadth-first search on the small graph). */
export function railPath(from: string, to: string): Array<[number, number]> {
  const prev: Record<string, string | null> = { [from]: null };
  const queue = [from];
  while (queue.length) {
    const n = queue.shift()!;
    if (n === to) break;
    for (const [a, b] of RAIL_EDGES) {
      const m = a === n ? b : b === n ? a : null;
      if (m && !(m in prev)) {
        prev[m] = n;
        queue.push(m);
      }
    }
  }
  const out: Array<[number, number]> = [];
  for (let n: string | null = to; n; n = prev[n] ?? null) out.unshift(RAIL_NODES[n]);
  return out;
}

export function pathLength(p: Array<[number, number]>): number {
  let L = 0;
  for (let i = 1; i < p.length; i++) L += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
  return L;
}

/** Position and heading at distance d along a path. */
export function pointAt(p: Array<[number, number]>, d: number): { x: number; z: number; rot: number } {
  for (let i = 1; i < p.length; i++) {
    const [ax, az] = p[i - 1];
    const [bx, bz] = p[i];
    const L = Math.hypot(bx - ax, bz - az);
    if (d <= L || i === p.length - 1) {
      const t = L === 0 ? 0 : Math.min(1, Math.max(0, d / L));
      return { x: ax + (bx - ax) * t, z: az + (bz - az) * t, rot: Math.atan2(bx - ax, bz - az) };
    }
    d -= L;
  }
  const [x, z] = p[0];
  return { x, z, rot: 0 };
}
