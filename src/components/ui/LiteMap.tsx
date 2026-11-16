import React from 'react';
import { CITY_HUBS, cityStage, useGameStore } from '../../store/gameStore';

/**
 * Light mode: a flat map of Israel with four city buttons and no 3D.
 * Works on old school computers and without a graphics card.
 */
export const LiteMap: React.FC = () => {
  const setOpenHub = useGameStore((s) => s.setOpenHub);
  const holdings = useGameStore((s) => s.holdings);
  const stage = useGameStore((s) => s.stage);
  const setJobsOpen = useGameStore((s) => s.setJobsOpen);
  return (
    <div className="lite-root">
      <div className="lite-map">
        <svg viewBox="0 0 200 400" className="lite-svg" aria-hidden="true">
          <rect x="0" y="0" width="200" height="400" fill="#0b2545" />
          <path
            d="M70 20 L120 15 L130 60 L135 110 L150 150 L140 190 L125 230 L115 290 L100 385 L80 300 L70 240 L60 190 L55 140 L60 90 Z"
            fill="#1f6f50"
            stroke="#34d399"
            strokeWidth="1.5"
          />
          <text x="20" y="200" fill="#7dd3fc" fontSize="11" transform="rotate(-90 20 200)">הים התיכון</text>
        </svg>
        {CITY_HUBS.map((hub) => {
          const pos: Record<string, { top: string; left: string }> = {
            haifa: { top: '12%', left: '38%' },
            telaviv: { top: '31%', left: '24%' },
            jerusalem: { top: '47%', left: '70%' },
            beersheva: { top: '64%', left: '48%' },
          };
          const count = holdings.filter((h) => {
            if (hub.id === 'jerusalem') return h.category === 'bank';
            if (hub.id === 'haifa') return h.category === 'realestate';
            if (hub.id === 'telaviv') return h.category === 'index' || h.category === 'stock';
            return false;
          }).length;
          const hs = cityStage(hub.id);
          const active = hs === stage;
          return (
            <button
              key={hub.id}
              className={`lite-city${active || hs === null ? '' : ' lite-locked'}`}
              style={{ ...pos[hub.id], borderColor: active ? hub.color : '#475569' }}
              onClick={() => (hs === null ? setJobsOpen(true) : setOpenHub(hub.id))}
            >
              <span className="lite-dot" style={{ backgroundColor: active ? hub.color : '#64748b' }} />
              <strong>{hub.hebrewName}</strong>
              <span>
                {hs === null ? 'עבודת קיץ' : active ? `שלב ${hs}: ${hub.hubTitle}` : hs > stage ? `נעול: נפתח בשלב ${hs}` : `שלב ${hs} הסתיים`}
              </span>
              {count > 0 && <span className="lite-count">{count} בתיק</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
