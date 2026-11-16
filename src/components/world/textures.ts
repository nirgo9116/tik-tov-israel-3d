import * as THREE from 'three';

/**
 * Procedural textures drawn on a canvas at runtime: no image downloads,
 * so the game still works offline and on filtered school networks.
 */

const cache = new Map<string, THREE.CanvasTexture>();

function make(key: string, size: number, draw: (ctx: CanvasRenderingContext2D, size: number) => void) {
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  cache.set(key, tex);
  return tex;
}

/** Deterministic pseudo-random numbers, so every load looks the same. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export type FacadeKind = 'glass' | 'residential' | 'stone';

/** One tile = 4 window columns x 4 floors. */
export function facadeTexture(kind: FacadeKind) {
  return make(`facade-${kind}`, 256, (ctx, n) => {
    const r = rng(kind.length * 97);
    const base = kind === 'glass' ? '#9fb7cc' : kind === 'stone' ? '#e6d6b0' : '#f2e8d2';
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, n, n);
    const cell = n / 4;
    for (let fy = 0; fy < 4; fy++) {
      for (let wx = 0; wx < 4; wx++) {
        const x = wx * cell;
        const y = fy * cell;
        if (kind === 'glass') {
          const shade = 120 + Math.floor(r() * 70);
          ctx.fillStyle = `rgb(${shade - 40},${shade},${shade + 40})`;
          ctx.fillRect(x + 3, y + 6, cell - 6, cell - 10);
          ctx.fillStyle = 'rgba(255,255,255,0.25)';
          ctx.fillRect(x + 3, y + 6, (cell - 6) * 0.35, cell - 10);
        } else {
          const lit = r() < 0.18;
          ctx.fillStyle = lit ? '#fde68a' : kind === 'stone' ? '#5b4a2f' : '#475569';
          const ww = cell * 0.5;
          const wh = cell * 0.55;
          ctx.fillRect(x + (cell - ww) / 2, y + cell * 0.2, ww, wh);
          if (kind === 'stone') {
            ctx.beginPath();
            ctx.arc(x + cell / 2, y + cell * 0.2, ww / 2, Math.PI, 0);
            ctx.fill();
          } else {
            ctx.fillStyle = 'rgba(0,0,0,0.18)';
            ctx.fillRect(x + 2, y + cell * 0.78, cell - 4, 4);
          }
        }
      }
      ctx.fillStyle = kind === 'glass' ? 'rgba(30,41,59,0.55)' : 'rgba(0,0,0,0.08)';
      ctx.fillRect(0, fy * cell, n, 3);
    }
  });
}

/** Subtle noise over a base colour, for grass, sand and stone ground. */
export function groundTexture(base: string, seed = 1) {
  return make(`ground-${base}-${seed}`, 256, (ctx, n) => {
    const r = rng(seed * 131 + 7);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, n, n);
    for (let i = 0; i < 2600; i++) {
      const a = r() * 0.12;
      ctx.fillStyle = r() < 0.5 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a * 0.7})`;
      const s = 1 + r() * 3;
      ctx.fillRect(r() * n, r() * n, s, s);
    }
  });
}

/** Asphalt with fine grain. */
export function asphaltTexture() {
  return make('asphalt', 256, (ctx, n) => {
    const r = rng(42);
    ctx.fillStyle = '#2b2f36';
    ctx.fillRect(0, 0, n, n);
    for (let i = 0; i < 4000; i++) {
      const v = 30 + Math.floor(r() * 40);
      ctx.fillStyle = `rgb(${v},${v},${v + 4})`;
      ctx.fillRect(r() * n, r() * n, 1.5, 1.5);
    }
  });
}

/** Return a copy that shares the image but has its own repeat. */
export function repeated(tex: THREE.Texture, x: number, y: number) {
  const t = tex.clone();
  t.repeat.set(x, y);
  t.needsUpdate = true;
  return t;
}
