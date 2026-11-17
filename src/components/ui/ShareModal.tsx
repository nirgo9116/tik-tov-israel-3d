import React, { useMemo, useState } from 'react';
import { Copy, Download, Send, X } from 'lucide-react';
import { stageInfo, useGameStore } from '../../store/gameStore';
import { composition } from '../../data/composition';
import { buildShareCode, decisionFromEntry } from '../../data/share';

/** Student: build a results code to send to the teacher (no network: the student passes it on). */
export const ShareModal: React.FC = () => {
  const open = useGameStore((s) => s.shareOpen);
  const close = useGameStore((s) => s.setShareOpen);
  const s = useGameStore();
  const [nick, setNick] = useState('');
  const [pick, setPick] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const decisions = s.journal.filter((j) => j.thoughtBefore.trim());

  const code = useMemo(() => {
    if (!open) return '';
    const net = s.getNetWorth();
    const chosen = decisions.find((j) => j.id === pick);
    return buildShareCode({
      nick,
      stage: s.stage,
      year: Math.min(s.year, 2025),
      startCash: s.startCash,
      netWorth: Math.round(net),
      realChangePct: Math.round(((net / s.priceLevel / s.startCash) - 1) * 1000) / 10,
      rubric: s.getRubric(),
      slices: composition(Math.max(0, s.cash), s.holdings).map((x) => ({ key: x.key, label: x.label, value: Math.round(x.value), color: x.color })),
      missionsDone: s.missions.filter((m) => m.completed).length,
      missionsTotal: s.missions.length,
      decision: chosen ? decisionFromEntry(chosen) : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, nick, pick, s.journal, s.holdings, s.cash, s.year, s.stage]);

  if (!open) return null;
  const nickHasSpace = /\s/.test(nick.trim()) && nick.trim().split(/\s+/).length >= 2;

  return (
    <div className="modal-backdrop" onClick={() => close(false)}>
      <div className="modal-card share-card" role="dialog" aria-label="שליחת התוצאות למורה" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="stage-badge" style={{ backgroundColor: stageInfo(s.stage).color }}>
              {stageInfo(s.stage).name}
            </span>
            <h2>
              <Send size={20} className="inline-icon" /> שליחת התוצאות למורה
            </h2>
            <p className="modal-sub">המשחק לא שולח כלום לאינטרנט. יוצרים כאן קוד, ושולחים אותו למורה בערוץ של הכיתה.</p>
          </div>
          <button className="close-btn" onClick={() => close(false)} aria-label="סגירה">
            <X size={20} />
          </button>
        </div>

        <label className="share-label" htmlFor="share-nick">
          1. כינוי (לא שם מלא). אפשר להשאיר ריק:
        </label>
        <input id="share-nick" className="share-input" maxLength={20} value={nick} onChange={(e) => setNick(e.target.value)} placeholder="למשל: הנמר הכחול" />
        {nickHasSpace && <div className="hint-small">רק כינוי, בלי שם פרטי ושם משפחה.</div>}

        <label className="share-label" htmlFor="share-decision">
          2. החלטה אחת שאתם רוצים להציג לכיתה (לא חובה):
        </label>
        <select id="share-decision" className="share-input" value={pick} onChange={(e) => setPick(e.target.value)}>
          <option value="">בלי החלטה</option>
          {decisions.map((j) => (
            <option key={j.id} value={j.id}>
              {j.year}: {j.actionTitle}
            </option>
          ))}
        </select>

        <label className="share-label">3. הקוד שלכם:</label>
        <textarea className="share-code" readOnly value={code} rows={4} onFocus={(e) => e.currentTarget.select()} />
        <div className="share-actions">
          <button
            className="btn-invest"
            onClick={() => {
              navigator.clipboard?.writeText(code).then(
                () => setCopied(true),
                () => setCopied(false)
              );
            }}
          >
            <Copy size={16} /> {copied ? 'הועתק!' : 'העתקת הקוד'}
          </button>
          <button
            className="btn-mini"
            onClick={() => {
              const a = document.createElement('a');
              a.href = URL.createObjectURL(new Blob([code], { type: 'text/plain' }));
              a.download = `tiktov-${nick.trim() || 'results'}.txt`;
              a.click();
              URL.revokeObjectURL(a.href);
            }}
          >
            <Download size={16} /> הורדה כקובץ
          </button>
        </div>
        <p className="row-sub">הדביקו את הקוד בהודעה למורה (למשל בגוגל קלאסרום), או שלחו את הקובץ. המורה יכול להציג אותו בכיתה.</p>
      </div>
    </div>
  );
};
