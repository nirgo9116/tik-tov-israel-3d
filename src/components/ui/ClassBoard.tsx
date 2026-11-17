import React, { useState } from 'react';
import { EyeOff, Eye, Trash2, Upload, X, Users } from 'lucide-react';
import { STAGES } from '../../store/gameStore';
import { parseShareCodes, ShareResult } from '../../data/share';

const shekel = (n: number) => `₪${Math.round(n).toLocaleString('he-IL')}`;
const PARTS: Array<[keyof ShareResult['rubric'], string, number]> = [
  ['reasoning', 'נימוק', 30],
  ['diversification', 'פיזור', 20],
  ['riskAdjusted', 'סיכון ותשואה', 20],
  ['learning', 'למידה', 15],
  ['consistency', 'עקביות', 15],
];

/**
 * Teacher: a big board for the projector. Results codes are pasted or loaded from files and kept
 * only in memory (closing the page clears them). Names are hidden by default; sorted by decision quality.
 */
export const ClassBoard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [results, setResults] = useState<ShareResult[]>([]);
  const [text, setText] = useState('');
  const [hideNames, setHideNames] = useState(true);
  const [focus, setFocus] = useState<number | null>(null);
  const [msg, setMsg] = useState('');

  const add = (raw: string) => {
    const found = parseShareCodes(raw);
    setResults((prev) => [...prev, ...found]);
    setMsg(found.length ? `נוספו ${found.length} תוצאות.` : 'לא נמצא קוד תקין. קוד מתחיל ב-TIKTOV1:');
  };

  const sorted = results.map((r, i) => ({ r, i })).sort((a, b) => b.r.rubric.total - a.r.rubric.total);
  const label = (r: ShareResult, idx: number) => (hideNames || !r.nick ? `תלמיד/ה ${idx + 1}` : r.nick);
  const shown = focus !== null ? results[focus] : null;

  return (
    <div className="board-root" role="dialog" aria-label="לוח הכיתה">
      <div className="board-top">
        <h1>
          <Users size={30} /> לוח הכיתה
        </h1>
        <div className="board-tools">
          <button className="btn-mini" onClick={() => setHideNames(!hideNames)}>
            {hideNames ? <EyeOff size={16} /> : <Eye size={16} />} {hideNames ? 'שמות מוסתרים' : 'כינויים מוצגים'}
          </button>
          <button className="btn-mini" onClick={() => { setResults([]); setFocus(null); }}>
            <Trash2 size={16} /> ניקוי הלוח
          </button>
          <button className="close-btn" onClick={onClose} aria-label="סגירה">
            <X size={22} />
          </button>
        </div>
      </div>

      <div className="board-input">
        <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} placeholder="הדביקו כאן קוד אחד או כמה קודים של תלמידים (מתחילים ב-TIKTOV1:)" />
        <button className="btn-invest" onClick={() => { add(text); setText(''); }}>
          הוספה ללוח
        </button>
        <label className="btn-mini board-file">
          <Upload size={16} /> קבצים
          <input
            type="file"
            accept=".txt,text/plain"
            multiple
            hidden
            onChange={async (e) => {
              const files = Array.from(e.target.files ?? []);
              const texts = await Promise.all(files.map((f) => f.text()));
              add(texts.join('\n'));
              e.target.value = '';
            }}
          />
        </label>
        {msg && <span className="board-msg">{msg}</span>}
      </div>

      {results.length === 0 ? (
        <div className="board-empty">
          <p>התלמידים יוצרים קוד בתיק שלהם: "התיק שלי" ← "שליחת התוצאות למורה", ושולחים אותו בערוץ של הכיתה.</p>
          <p>הלוח לא נשמר בשום מקום. כשסוגרים את הדף, הוא מתנקה.</p>
        </div>
      ) : (
        <div className="board-grid">
          {sorted.map(({ r, i }, rank) => (
            <button key={i} className={`board-card${focus === i ? ' on' : ''}`} onClick={() => setFocus(focus === i ? null : i)}>
              <div className="board-card-top">
                <b>{label(r, i)}</b>
                <span className="board-stage" style={{ background: STAGES[r.stage - 1].color }}>
                  {STAGES[r.stage - 1].short}
                </span>
              </div>
              <div className="board-score">
                {r.rubric.total}
                <small>/100</small>
              </div>
              <div className="board-parts">
                {PARTS.map(([k, name, max]) => (
                  <div key={k} className="board-part" title={`${name}: ${r.rubric[k]}/${max}`}>
                    <span>{name}</span>
                    <div className="board-part-bar">
                      <div style={{ width: `${(r.rubric[k] / max) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="board-mix">
                {r.slices.map((x) => (
                  <div key={x.key} style={{ flex: Math.max(1, x.value), background: x.color }} title={x.label} />
                ))}
              </div>
              <div className="board-meta">
                שינוי ריאלי {r.realChangePct >= 0 ? '+' : ''}
                {r.realChangePct}% · משימות {r.missionsDone}/{r.missionsTotal} · {r.year > 2024 ? 'סיים' : `שנת ${r.year}`}
              </div>
              {rank === 0 && results.length > 1 && <div className="board-ribbon">החלטות מנומקות</div>}
            </button>
          ))}
        </div>
      )}

      {shown && (
        <div className="board-focus">
          <h2>{label(shown, focus!)}: {STAGES[shown.stage - 1].name}</h2>
          <div className="board-focus-grid">
            <div>
              <h3>הרכב התיק</h3>
              <ul className="mix-legend">
                {shown.slices.map((x) => (
                  <li key={x.key}>
                    <span className="mix-dot" style={{ backgroundColor: x.color }} />
                    <span className="mix-name">{x.label}</span>
                    <span className="mix-amt">{shekel(x.value)}</span>
                    <b>{Math.round((x.value / Math.max(1, shown.slices.reduce((a, s) => a + s.value, 0))) * 100)}%</b>
                  </li>
                ))}
              </ul>
              <p>
                תקציב {shekel(shown.startCash)} ← שווי {shekel(shown.netWorth)}
              </p>
            </div>
            <div>
              <h3>החלטה לדיון</h3>
              {shown.decision ? (
                <>
                  <p className="board-dec-title">
                    {shown.decision.year}: {shown.decision.title}
                  </p>
                  <p>
                    <b>למה:</b> {shown.decision.thought}
                  </p>
                  {shown.decision.outcome && (
                    <p>
                      <b>מה קרה:</b> {shown.decision.outcome}
                    </p>
                  )}
                  {shown.decision.learned && (
                    <p>
                      <b>מה למדתי:</b> {shown.decision.learned}
                    </p>
                  )}
                </>
              ) : (
                <p>התלמיד/ה לא בחר/ה החלטה לשתף.</p>
              )}
            </div>
          </div>
          <p className="board-q">שאלה לכיתה: מה הייתם עושים אחרת באותה שנה, ולמה?</p>
        </div>
      )}
    </div>
  );
};
