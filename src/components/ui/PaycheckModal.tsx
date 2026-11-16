import React, { useState } from 'react';
import { Wallet } from 'lucide-react';
import { JOBS, MIN_REASONING_CHARS, useGameStore } from '../../store/gameStore';

const shekel = (n: number) => `₪${Math.round(n).toLocaleString('he-IL')}`;

/** After a summer job: the student decides how much of the pay to save and how much to spend. */
export const PaycheckModal: React.FC = () => {
  const paycheck = useGameStore((s) => s.paycheck);
  const cashPaycheck = useGameStore((s) => s.cashPaycheck);
  const [saved, setSaved] = useState<number | null>(null);
  const [note, setNote] = useState('');
  if (!paycheck) return null;
  const job = JOBS.find((j) => j.id === paycheck.jobId)!;
  const keep = saved ?? Math.round(paycheck.pay / 2 / 100) * 100;
  const spend = paycheck.pay - keep;
  const ok = note.trim().length >= MIN_REASONING_CHARS;
  return (
    <div className="modal-backdrop">
      <div className="modal-card paycheck-card" role="dialog" aria-label="משכורת">
        <div className="modal-header">
          <div>
            <span className="stage-badge" style={{ backgroundColor: '#16a34a' }}>
              סיימתם את העבודה!
            </span>
            <h2>
              <Wallet size={20} className="inline-icon" /> קיבלתם משכורת: {shekel(paycheck.pay)}
            </h2>
            <p className="modal-sub">{job.title}. השכר הוא דוגמה לעבודת קיץ של בני נוער.</p>
          </div>
        </div>

        <p className="paycheck-q">כמה מהמשכורת תחסכו בתיק, וכמה תוציאו (בילויים, בגדים, טלפון)?</p>
        <input
          className="paycheck-range"
          type="range"
          min={0}
          max={paycheck.pay}
          step={100}
          value={keep}
          onChange={(e) => setSaved(Number(e.target.value))}
          aria-label="סכום לחיסכון"
        />
        <div className="paycheck-split">
          <div className="split-save">
            <span>לחיסכון בתיק</span>
            <strong>{shekel(keep)}</strong>
          </div>
          <div className="split-spend">
            <span>להוצאות</span>
            <strong>{shekel(spend)}</strong>
          </div>
        </div>

        <div className="journal-prompt-box">
          <label htmlFor="pay-note">יומן ההחלטות: למה בחרתם בחלוקה הזו? (חובה)</label>
          <textarea
            id="pay-note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="לדוגמה: חסכתי יותר מחצי כי אני רוצה כרית ביטחון, ובכל זאת השארתי קצת לבילויים."
          />
        </div>

        <button
          className="btn-invest wide"
          disabled={!ok}
          onClick={() => {
            cashPaycheck(keep, note);
            setSaved(null);
            setNote('');
          }}
        >
          אישור החלוקה
        </button>
      </div>
    </div>
  );
};
