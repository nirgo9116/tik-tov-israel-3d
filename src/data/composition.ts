import type { Holding } from '../types/game';

/** One slice of the portfolio: free cash or one kind of asset. */
export interface Slice {
  key: string;
  label: string;
  value: number;
  color: string;
}

export const SLICE_STYLE: Record<string, { label: string; color: string }> = {
  cash: { label: 'כסף פנוי', color: '#94a3b8' },
  deposit: { label: 'פיקדון רגיל', color: '#10b981' },
  cpiLinked: { label: 'פיקדון צמוד מדד', color: '#2dd4bf' },
  ta125: { label: 'קרן מדד ת"א-125', color: '#3b82f6' },
  fictionalStock: { label: 'מניה בודדת (בדויה)', color: '#ec4899' },
  housingRent: { label: 'דירה להשקעה', color: '#f59e0b' },
  housing: { label: 'קבוצת רכישה', color: '#f97316' },
  mortgaged: { label: 'דירה (הון עצמי)', color: '#eab308' },
};

/** Free cash first, then each asset kind, summed over holdings. Empty slices are left out. */
export function composition(cash: number, holdings: Holding[]): Slice[] {
  const byKey = new Map<string, number>();
  for (const h of holdings) {
    const k = h.mortgage && h.mortgage.loan > 0 ? 'mortgaged' : h.assetKey;
    byKey.set(k, (byKey.get(k) ?? 0) + h.currentValue);
  }
  const out: Slice[] = [];
  if (cash > 0) out.push({ key: 'cash', ...SLICE_STYLE.cash, value: cash });
  for (const [key, value] of byKey) {
    if (value <= 0) continue;
    const st = SLICE_STYLE[key] ?? { label: key, color: '#a3a3a3' };
    out.push({ key, label: st.label, color: st.color, value });
  }
  return out;
}

export const total = (slices: Slice[]) => slices.reduce((s, x) => s + x.value, 0);
