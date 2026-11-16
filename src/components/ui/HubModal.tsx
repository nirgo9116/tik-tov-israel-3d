import React, { useState } from 'react';
import { X, Users, AlertTriangle, CheckCircle2, MapPin, FlaskConical } from 'lucide-react';
import { CITY_HUBS, HUB_PRODUCTS, MIN_REASONING_CHARS, useGameStore } from '../../store/gameStore';

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

  const [thought, setThought] = useState('');
  const [amounts, setAmounts] = useState<Record<string, number>>({});

  if (!openHub) return null;

  const info = CITY_HUBS.find((h) => h.id === openHub)!;
  const products = HUB_PRODUCTS[openHub];
  const productIds = new Set(products.map((p) => p.id));
  const relevant = holdings.filter((h) => productIds.has(h.id));
  const over = isGameOver();
  const reasonOk = thought.trim().length >= MIN_REASONING_CHARS;

  return (
    <div className="modal-backdrop" onClick={() => setOpenHub(null)}>
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
          <button className="icon-close" onClick={() => setOpenHub(null)} aria-label="סגירה">
            <X size={20} />
          </button>
        </div>

        <div className="journal-prompt-box">
          <label htmlFor="reason">
            יומן ההחלטות: למה אתם מחליטים כך, ומה לדעתכם יקרה ב-{year}? (חובה, לפחות משפט אחד)
          </label>
          <textarea
            id="reason"
            rows={2}
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            placeholder="לדוגמה: אני משקיע בקרן מחקת מדד כי יש בה פיזור, ואני מוכן לחכות כמה שנים גם אם תהיה ירידה."
          />
          {!reasonOk && thought.length > 0 && (
            <div className="hint-small">עוד קצת: כתבו לפחות {MIN_REASONING_CHARS} תווים.</div>
          )}
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
                  <label className="amount-input">
                    סכום (₪)
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
                      if (investAction(p, amount, thought)) setThought('');
                    }}
                  >
                    {!valid ? 'סכום לא תקין' : `השקעה של ${shekel(amount)}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

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
                    if (sellHolding(h.id, thought)) setThought('');
                  }}
                >
                  מכירה
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
