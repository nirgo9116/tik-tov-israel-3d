import React from 'react';
import { CITY_HUBS, stageInfo, useGameStore } from '../../store/gameStore';

const shekel = (n: number) => `₪${n.toLocaleString('he-IL')}`;

/** Opens at the start of every stage (and from the stage badge): what this world is about and its budget. */
export const StageIntroModal: React.FC = () => {
  const open = useGameStore((s) => s.stageIntroOpen);
  const stage = useGameStore((s) => s.stage);
  const close = useGameStore((s) => s.setStageIntroOpen);
  const liteMode = useGameStore((s) => s.liteMode);
  const startTrainRide = useGameStore((s) => s.startTrainRide);
  const setOpenHub = useGameStore((s) => s.setOpenHub);
  if (!open) return null;
  const st = stageInfo(stage);
  const city = CITY_HUBS.find((h) => h.id === st.city)!;
  return (
    <div className="modal-backdrop">
      <div className="modal-card stage-intro" role="dialog" aria-label={st.name} style={{ borderColor: st.color }}>
        <span className="stage-badge" style={{ backgroundColor: st.color }}>
          שלב {stage} מתוך 3
        </span>
        <h2>{st.name}</h2>
        <div className="stage-budget" style={{ color: st.color }}>
          תקציב: {shekel(st.budget)}
        </div>
        <ul>
          {st.intro.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            className="btn-invest"
            onClick={() => {
              close(false);
              if (liteMode) setOpenHub(st.city);
              else startTrainRide(st.city);
            }}
          >
            {liteMode ? `לפתוח את ${city.hubTitle}` : `ברכבת ל${city.hebrewName}`}
          </button>
          <button className="btn-mini" onClick={() => close(false)}>
            אסתובב קודם
          </button>
        </div>
      </div>
    </div>
  );
};
