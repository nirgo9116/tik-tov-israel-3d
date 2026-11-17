import React, { useState } from 'react';
import { Copy, Download, Save, Upload, X } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

const KEY = 'tiktov-game-v2';
const PREFIX = 'TIKTOVSAVE1:';

const enc = (t: string) => {
  const bytes = new TextEncoder().encode(t);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const dec = (c: string) => {
  const b64 = c.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0)));
};

/** Move progress to another computer with a save code (no account, no server). */
export const SaveModal: React.FC = () => {
  const open = useGameStore((s) => s.saveOpen);
  const close = useGameStore((s) => s.setSaveOpen);
  const studentCode = useGameStore((s) => s.studentCode);
  const [paste, setPaste] = useState('');
  const [msg, setMsg] = useState('');
  const [copied, setCopied] = useState(false);
  if (!open) return null;

  let code = '';
  try {
    const raw = window.localStorage.getItem(KEY);
    code = raw ? PREFIX + enc(raw) : '';
  } catch {
    code = '';
  }

  const load = (text: string) => {
    const m = text.match(/TIKTOVSAVE1:([A-Za-z0-9_-]+)/);
    if (!m) {
      setMsg('לא נמצא קוד שמירה תקין. הוא מתחיל ב-TIKTOVSAVE1:');
      return;
    }
    try {
      const json = dec(m[1]);
      const data = JSON.parse(json);
      if (!data?.state || typeof data.state.stage !== 'number' || typeof data.state.cash !== 'number') throw new Error('bad');
      if (!window.confirm('לטעון את ההתקדמות מהקוד? ההתקדמות שנמצאת עכשיו במחשב הזה תוחלף.')) return;
      window.localStorage.setItem(KEY, json);
      window.location.reload();
    } catch {
      setMsg('הקוד פגום או חלקי. נסו להעתיק אותו שוב, במלואו.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => close(false)}>
      <div className="modal-card share-card" role="dialog" aria-label="שמירה והמשך במחשב אחר" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>
              <Save size={20} className="inline-icon" /> שמירה והמשך במחשב אחר
            </h2>
            <p className="modal-sub">בלי הרשמה ובלי סיסמה: מעתיקים קוד שמירה, ומדביקים אותו במחשב השני.</p>
          </div>
          <button className="close-btn" onClick={() => close(false)} aria-label="סגירה">
            <X size={20} />
          </button>
        </div>

        <label className="share-label">1. במחשב הזה: קוד השמירה שלכם{studentCode && (<> (<bdi>{studentCode}</bdi>)</>)}</label>
        <textarea className="share-code" readOnly value={code} rows={3} onFocus={(e) => e.currentTarget.select()} />
        <div className="share-actions">
          <button className="btn-invest" disabled={!code} onClick={() => navigator.clipboard?.writeText(code).then(() => setCopied(true), () => setCopied(false))}>
            <Copy size={16} /> {copied ? 'הועתק!' : 'העתקה'}
          </button>
          <button
            className="btn-mini"
            disabled={!code}
            onClick={() => {
              const a = document.createElement('a');
              a.href = URL.createObjectURL(new Blob([code], { type: 'text/plain' }));
              a.download = `tiktov-save-${studentCode || 'game'}.txt`;
              a.click();
              URL.revokeObjectURL(a.href);
            }}
          >
            <Download size={16} /> הורדה כקובץ
          </button>
        </div>
        <p className="row-sub">שמרו את הקוד אצלכם (למשל בהודעה לעצמכם). מי שמקבל את הקוד יכול להמשיך את המשחק שלכם, אז לא משתפים אותו עם אחרים.</p>

        <label className="share-label" htmlFor="save-paste">
          2. במחשב החדש: מדביקים את הקוד כאן
        </label>
        <textarea id="save-paste" className="share-code" rows={3} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="TIKTOVSAVE1:..." />
        <div className="share-actions">
          <button className="btn-invest" onClick={() => load(paste)}>
            טעינת ההתקדמות
          </button>
          <label className="btn-mini board-file">
            <Upload size={16} /> מקובץ
            <input type="file" accept=".txt,text/plain" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) load(await f.text()); e.target.value = ''; }} />
          </label>
        </div>
        {msg && <div className="hint-small">{msg}</div>}
      </div>
    </div>
  );
};
