import React from 'react';
import { X } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { INTERIORS } from '../../data/interiors';
import { pastValues } from '../world/InteriorScene';

/** Info panel for a station inside a building, with the past values of its data series. */
export const StationInfoModal: React.FC = () => {
  const interior = useGameStore((s) => s.interior);
  const stationId = useGameStore((s) => s.stationInfo);
  const year = useGameStore((s) => s.year);
  const close = useGameStore((s) => s.setStationInfo);
  if (!interior || !stationId) return null;
  const st = INTERIORS[interior].stations.find((x) => x.id === stationId);
  if (!st || st.action.kind !== 'info') return null;
  const { title, body, series } = st.action;
  const vals = series ? pastValues(series.key, year) : [];
  const maxAbs = Math.max(5, ...vals.map((d) => Math.abs(d.v)));
  return (
    <div className="modal-backdrop" onClick={() => close(null)}>
      <div className="modal-card station-card" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            {series?.fictional && (
              <span className="stage-badge" style={{ backgroundColor: '#7c3aed' }}>
                נתונים בדויים
              </span>
            )}
            <h2>{title}</h2>
          </div>
          <button className="close-btn" onClick={() => close(null)} aria-label="סגירה">
            <X size={20} />
          </button>
        </div>
        {body.map((p, i) => (
          <p key={i} className="station-p">
            {p}
          </p>
        ))}
        {series && (
          <div className="station-chart">
            <div className="station-chart-title">{series.label}: השנים שכבר הסתיימו במשחק</div>
            {vals.length === 0 ? (
              <p className="station-p">עוד אין נתונים. הם יופיעו אחרי שהמורה יעביר שנה.</p>
            ) : (
              <div className="station-bars">
                {vals.map((d) => (
                  <div key={d.year} className="station-bar-col">
                    <div className="station-bar-area">
                      <div
                        className={`station-bar ${d.v >= 0 ? 'up' : 'down'}`}
                        style={{ height: `${(Math.abs(d.v) / maxAbs) * 50}%` }}
                      />
                    </div>
                    <span className="station-val">{d.v}%</span>
                    <span className="station-year">{d.year}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="station-src">
              {series.fictional ? 'הנתונים הומצאו לצורך הלימוד.' : 'מקור: נתוני העבר שבמשחק (פירוט מקורות במסך "למורה").'}
            </p>
          </div>
        )}
        <p className="station-q">שאלה ליומן: מה הנתונים האלה אומרים לכם על ההחלטה הבאה שלכם?</p>
      </div>
    </div>
  );
};
