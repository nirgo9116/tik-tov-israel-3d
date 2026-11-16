import React, { useState } from 'react';
import { X, Users, AlertTriangle, CheckCircle2, MapPin, FlaskConical, Briefcase } from 'lucide-react';
import { CITY_HUBS, HUB_PRODUCTS, JOBS, MIN_REASONING_CHARS, useGameStore } from '../../store/gameStore';

const shekel = (n: number) => `₪${Math.round(n).toLocaleString('he-IL')}`;
const riskClass: Record<string, string> = { נמוך: 'low', בינוני: 'medium', גבוה: 'high' };

export const HubModal: React.FC = () => {
  const openHub = useGameStore((s) => s.openHub);
  const cash = useGameStore((s) => s.cash);
  const year = useGameStore((s) => s.year);
  const holdings = useGameStore((s) => s.holdings);
  const setOpenHub = useGameStore((s) => s.setOpenHub);
  const investAction = useGameStore((s) => s.investAction);
  const sellHolding = useGameStore((s) => s.sellHolding);
  const isGameOver = useGameStore((s) => s.isGameOver);
  const activeJob = useGameStore((s) => s.activeJob);
  const jobYear = useGameStore((s) => s.jobYear);
  const liteMode = useGameStore((s) => s.liteMode);
  const startJob = useGameStore((s) => s.startJob);
  const finishJobNow = useGameStore((s) => s.finishJobNow);

  const [thought, setThought] = useState('');
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [done, setDone] = useState<string | null>(null);

  if (!openHub) return null;

  const info = CITY_HUBS.find((h) => h.id === openHub)!;
  const products = HUB_PRODUCTS[openHub];
  const productIds = new Set(products.map((p) => p.id));
  const relevant = holdings.filter((h) => productIds.has(h.id));
  const over = isGameOver();
  const typed = thought.trim().length;
  const reasonOk = typed >= MIN_REASONING_CHARS;
  const round = (n: number) => Math.max(0, Math.floor(n / 1000) * 1000);

  return (
    <div
      className="modal-backdrop"
      onClick={() => {
        setDone(null);
        setOpenHub(null);
      }}
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ borderColor: info.color }}>
          <div>
            <span className="stage-badge" style={{ backgroundColor: info.color }}>
              {info.stageLabel} • {info.regionLabel}
            </span>
            <h2>
              <MapPin size={20} className="inline-icon" />
              {info.hebrewName}: {info.hubTitle}
            </h2>
            <p className="modal-sub">{info.subtitle}</p>
          </div>
          <button
            className="icon-close"
            onClick={() => {
              setDone(null);
              setOpenHub(null);
            }}
            aria-label="סגירה"
          >
            <X size={20} />
          </button>
        </div>

        <ol className="invest-steps">
          <li className={reasonOk ? 'ok' : 'now'}>כותבים נימוק</li>
          <li className={reasonOk ? 'now' : ''}>בוחרים סכום</li>
          <li className={reasonOk ? 'now' : ''}>לוחצים "השקעה"</li>
          <li className="cash-left">
            כסף פנוי: <b>{shekel(cash)}</b>
          </li>
        </ol>

        {done && (
          <div className="invest-done" role="status">
            <CheckCircle2 size={16} /> {done}
          </div>
        )}

        <div className="journal-prompt-box">
          <label htmlFor="reason">
            1. יומן ההחלטות: למה אתם מחליטים כך, ומה לדעתכם יקרה ב-{year}? (חובה, לפחות משפט אחד)
          </label>
          <textarea
            id="reason"
            rows={2}
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            placeholder="לדוגמה: אני משקיע בקרן מחקת מדד כי יש בה פיזור, ואני מוכן לחכות כמה שנים גם אם תהיה ירידה."
          />
          <div className="reason-meter">
            <div className="reason-meter-fill" style={{ width: `${Math.min(100, (typed / MIN_REASONING_CHARS) * 100)}%`, background: reasonOk ? '#22c55e' : '#f59e0b' }} />
          </div>
          <div className="hint-small">
            {reasonOk ? '✓ הנימוק מוכן. עכשיו בוחרים סכום ולוחצים "השקעה".' : `עוד ${MIN_REASONING_CHARS - typed} תווים לפחות. אפשר להשתמש במילים כמו סיכון, פיזור, ריבית, אינפלציה.`}
          </div>
        </div>

        <div className="products-grid">
          {products.map((p) => {
            const amount = amounts[p.id] ?? Math.min(10000, Math.floor(cash / 1000) * 1000);
            const valid = amount >= 1000 && amount <= cash;
            return (
              <div key={p.id} className="product-card">
                <div className="product-top">
                  <h3>{p.name}</h3>
                  <span className={`risk-tag risk-${riskClass[p.riskLevel]}`}>סיכון {p.riskLevel}</span>
                </div>
                {p.fictional && (
                  <div className="fictional-row">
                    <FlaskConical size={14} /> בדוי: הנתונים מומצאים לצורך הלימוד
                  </div>
                )}
                <p className="product-desc">{p.description}</p>
                <div className="yield-label">איך מחושבת התשואה: {p.howItEarns}</div>
                {p.partners && (
                  <div className="partner-row">
                    <Users size={14} /> שותפים: {p.partners.join(', ')}
                  </div>
                )}
                {p.riskLevel === 'גבוה' && (
                  <div className="warn-row">
                    <AlertTriangle size={14} /> ריכוז של יותר מ-35% מהתיק בנכס כזה מוריד את ציון הפיזור
                  </div>
                )}
                <div className="product-footer">
                  <div className="amount-chips" aria-label="סכום מהיר">
                    {[
                      ['10%', round(cash * 0.1)],
                      ['25%', round(cash * 0.25)],
                      ['חצי', round(cash * 0.5)],
                      ['הכול', round(cash)],
                    ].map(([label, v]) => (
                      <button key={label as string} type="button" className={`chip${amount === v ? ' on' : ''}`} disabled={(v as number) < 1000} onClick={() => setAmounts({ ...amounts, [p.id]: v as number })}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <label className="amount-input">
                    2. סכום (₪)
                    <input
                      type="number"
                      min={1000}
                      step={1000}
                      max={cash}
                      value={amount}
                      onChange={(e) => setAmounts({ ...amounts, [p.id]: Number(e.target.value) })}
                    />
                  </label>
                  <button
                    className="btn-invest"
                    disabled={over || !valid || !reasonOk}
                    title={!reasonOk ? 'קודם כותבים הנמקה ביומן' : undefined}
                    onClick={() => {
                      if (investAction(p, amount, thought)) {
                        setThought('');
                        setDone(`הושקעו ${shekel(amount)} ב${p.name}. רואים את זה בתיק ובהרכב התיק. אפשר להשקיע עוד (עם נימוק חדש) או לסגור.`);
                      }
                    }}
                  >
                    {over ? 'השלב הסתיים' : !reasonOk ? 'קודם כותבים נימוק' : !valid ? (cash < 1000 ? 'אין מספיק כסף פנוי' : 'סכום לא תקין') : `3. השקעה של ${shekel(amount)}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {JOBS.filter((j) => j.city === openHub).map((job) => {
          const workedThisYear = jobYear === year;
          const busy = Boolean(activeJob);
          return (
            <div key={job.id} className="job-card">
              <div className="job-top">
                <Briefcase size={16} />
                <strong>עבודה בקיץ: {job.title}</strong>
                <span className="job-pay">{shekel(job.pay)}</span>
              </div>
              <p>
                {job.description} {liteMode ? '' : `המשימה: ${job.task}.`} אפשר לעבוד פעם אחת בכל שנה.
              </p>
              <button
                className="btn-invest"
                disabled={over || workedThisYear || busy}
                onClick={() => (liteMode ? finishJobNow(job.id) : startJob(job.id))}
              >
                {workedThisYear
                  ? `כבר עבדתם ב-${year}`
                  : busy
                  ? 'אתם כבר באמצע עבודה'
                  : liteMode
                  ? 'לעבוד בקיץ'
                  : 'לקחת את העבודה'}
              </button>
            </div>
          );
        })}

        {relevant.length > 0 && (
          <div className="active-positions">
            <h4>מה כבר יש לכם בתיק מכאן</h4>
            {relevant.map((h) => (
              <div key={h.id} className="position-row">
                <div>
                  <CheckCircle2 size={15} className="text-emerald inline-icon" />
                  <strong>{h.name}</strong> — שווי {shekel(h.currentValue)} (הושקעו {shekel(h.invested)}, מאז {h.sinceYear})
                </div>
                <button
                  className="btn-sell"
                  disabled={over || !reasonOk}
                  title={!reasonOk ? 'גם מכירה צריכה הנמקה ביומן' : undefined}
                  onClick={() => {
                    if (sellHolding(h.id, thought)) {
                      setThought('');
                      setDone(`מכרתם את ${h.name}. הכסף חזר לכסף הפנוי.`);
                    }
                  }}
                >
                  {reasonOk ? 'מכירה' : 'מכירה (קודם נימוק)'}
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="disclaimer">כסף וירטואלי ונתוני עבר בלבד. זה לא ייעוץ השקעות, וביצועי עבר לא מבטיחים תשואות בעתיד.</p>
      </div>
    </div>
  );
};
