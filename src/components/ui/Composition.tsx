import React from 'react';
import { Slice, total } from '../../data/composition';

const shekel = (n: number) => `₪${Math.round(n).toLocaleString('he-IL')}`;
const pct = (v: number, t: number) => (t > 0 ? Math.round((v / t) * 100) : 0);

/** A thin stacked bar, one segment per slice. */
export const MixBar: React.FC<{ slices: Slice[]; height?: number }> = ({ slices, height = 12 }) => {
  const t = total(slices);
  return (
    <div className="mix-bar" style={{ height }}>
      {slices.map((s) => (
        <div key={s.key} style={{ width: `${(s.value / t) * 100}%`, backgroundColor: s.color }} title={`${s.label}: ${shekel(s.value)} (${pct(s.value, t)}%)`} />
      ))}
    </div>
  );
};

/** Donut chart with the total in the middle. */
export const Donut: React.FC<{ slices: Slice[]; size?: number; caption?: string }> = ({ slices, size = 170, caption }) => {
  const t = total(slices);
  const r = 40;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label="הרכב התיק">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#1e293b" strokeWidth="16" />
      {slices.map((s) => {
        const len = (s.value / t) * c;
        const el = (
          <circle
            key={s.key}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="16"
            strokeDasharray={`${len} ${c - len}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 50 50)"
          />
        );
        offset += len;
        return el;
      })}
      <text x="50" y="48" textAnchor="middle" fontSize="9" fill="#f8fafc" fontWeight="800">
        {shekel(t)}
      </text>
      {caption && (
        <text x="50" y="60" textAnchor="middle" fontSize="6" fill="#94a3b8">
          {caption}
        </text>
      )}
    </svg>
  );
};

/** Legend: colour, name, amount and share. */
export const MixLegend: React.FC<{ slices: Slice[] }> = ({ slices }) => {
  const t = total(slices);
  return (
    <ul className="mix-legend">
      {slices.map((s) => (
        <li key={s.key}>
          <span className="mix-dot" style={{ backgroundColor: s.color }} />
          <span className="mix-name">{s.label}</span>
          <span className="mix-amt">{shekel(s.value)}</span>
          <b>{pct(s.value, t)}%</b>
        </li>
      ))}
    </ul>
  );
};

/** One 100% bar per year, to show how the mix changed during the stage. */
export const MixByYear: React.FC<{ rows: Array<{ label: string; slices: Slice[] }> }> = ({ rows }) => (
  <div className="mix-years">
    {rows.map((r) => {
      const t = total(r.slices);
      return (
        <div key={r.label} className="mix-year-col">
          <div className="mix-year-bar">
            {[...r.slices].reverse().map((s) => (
              <div key={s.key} style={{ height: `${(s.value / t) * 100}%`, backgroundColor: s.color }} title={`${s.label}: ${pct(s.value, t)}%`} />
            ))}
          </div>
          <span>{r.label}</span>
        </div>
      );
    })}
  </div>
);
