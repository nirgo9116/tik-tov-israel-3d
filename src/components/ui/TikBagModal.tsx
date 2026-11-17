import React, { useState } from 'react';
import { X, CheckCircle, Circle, BookOpen, Award, Target, Backpack, RotateCcw, PieChart, Send, Save } from 'lucide-react';
import { MIN_REASONING_CHARS, isReasonOk, STAGES, stageInfo, useGameStore } from '../../store/gameStore';
import { composition } from '../../data/composition';
import { Donut, MixByYear, MixLegend } from './Composition';
import { FIRST_YEAR } from '../../data/history';

const shekel = (n: number) => `₪${Math.round(n).toLocaleString('he-IL')}`;

const ReflectionBox: React.FC<{ entryId: string }> = ({ entryId }) => {
  const addReflection = useGameStore((s) => s.addReflection);
  const [text, setText] = useState('');
  return (
    <div className="reflect-box">
      <textarea
        rows={2}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="מה למדתי? האם ההנמקה שלי התאמתה למה שקרה? מה הייתי עושה אחרת?"
      />
      <button
        className="btn-mini"
        disabled={!isReasonOk(text)}
        onClick={() => addReflection(entryId, text)}
      >
        שמירה
      </button>
    </div>
  );
};

export const TikBagModal: React.FC = () => {
  const tikOpen = useGameStore((s) => s.tikOpen);
  const tikTab = useGameStore((s) => s.tikTab);
  const missions = useGameStore((s) => s.missions);
  const journal = useGameStore((s) => s.journal);
  const holdings = useGameStore((s) => s.holdings);
  const cash = useGameStore((s) => s.cash);
  const year = useGameStore((s) => s.year);
  const priceLevel = useGameStore((s) => s.priceLevel);
  const setTikOpen = useGameStore((s) => s.setTikOpen);
  const setTikTab = useGameStore((s) => s.setTikTab);
  const getRubric = useGameStore((s) => s.getRubric);
  const getNetWorth = useGameStore((s) => s.getNetWorth);
  const isGameOver = useGameStore((s) => s.isGameOver);
  const resetGame = useGameStore((s) => s.resetGame);
  const stage = useGameStore((s) => s.stage);
  const startCash = useGameStore((s) => s.startCash);
  const stageResults = useGameStore((s) => s.stageResults);
  const snapshots = useGameStore((s) => s.snapshots);
  const studentCode = useGameStore((s) => s.studentCode);
  const setStudentCode = useGameStore((s) => s.setStudentCode);

  if (!tikOpen) return null;

  const rubric = getRubric();
  const over = isGameOver();
  const netWorth = getNetWorth();
  const bagTier =
    rubric.total >= 75 ? 'דרגה 3: תיק זהב' : rubric.total >= 45 ? 'דרגה 2: תיק כחול רב-תאים' : 'דרגה 1: תיק בד למתחילים';

  const has = (c: string[]) => holdings.some((h) => c.includes(h.category));
  const pockets = [
    { label: 'שלב 1: חיסכון', on: has(['bank']), cls: 'lit-green' },
    { label: 'שלב 2: בורסה', on: has(['index', 'stock']), cls: 'lit-blue' },
    { label: 'שלב 3: נדל"ן', on: has(['realestate']), cls: 'lit-amber' },
  ];

  return (
    <div className="modal-backdrop" onClick={() => setTikOpen(false)}>
      <div className="tik-bag-container" onClick={(e) => e.stopPropagation()}>
        <div className="tik-handle" />
        <div className="tik-header">
          <div>
            <div className="tik-title">
              <Backpack size={20} className="inline-icon" />
              התיק שלי
            </div>
            <div className="tik-tier-badge">{bagTier}</div>
          </div>
          <button className="icon-close" onClick={() => setTikOpen(false)} aria-label="סגירה">
            <X size={18} />
          </button>
        </div>

        <div className="pockets-strip">
          {pockets.map((p) => (
            <div key={p.label} className={`pocket-pill ${p.on ? p.cls : ''}`}>
              <span>{p.label}</span>
              <b>{p.on ? 'יש' : 'ריק'}</b>
            </div>
          ))}
        </div>

        <div className="phone-tabs">
          <button className={tikTab === 'bag' ? 'active' : ''} onClick={() => setTikTab('bag')}>
            <Backpack size={14} /> תכולה ({holdings.length})
          </button>
          <button className={tikTab === 'mix' ? 'active' : ''} onClick={() => setTikTab('mix')}>
            <PieChart size={14} /> הרכב
          </button>
          <button className={tikTab === 'missions' ? 'active' : ''} onClick={() => setTikTab('missions')}>
            <Target size={14} /> משימות
          </button>
          <button className={tikTab === 'journal' ? 'active' : ''} onClick={() => setTikTab('journal')}>
            <BookOpen size={14} /> יומן ({journal.length})
          </button>
          <button className={tikTab === 'rubric' ? 'active' : ''} onClick={() => setTikTab('rubric')}>
            <Award size={14} /> {rubric.total}/100
          </button>
        </div>

        <div className="phone-body">
          {tikTab === 'bag' && (
            <div className="phone-section">
              <div className="student-code-row">
                <label htmlFor="student-code">קוד תלמיד (מהמורה):</label>
                <input
                  id="student-code"
                  className="share-input"
                  maxLength={10}
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder="למשל: י3-07"
                />
              </div>
              <div className="share-actions">
                <button className="btn-invest share-btn" onClick={() => useGameStore.getState().setShareOpen(true)}>
                  <Send size={16} /> שליחת התוצאות למורה
                </button>
                <button className="btn-mini" onClick={() => useGameStore.getState().setSaveOpen(true)}>
                  <Save size={16} /> שמירה והמשך במחשב אחר
                </button>
              </div>
              {over && (
                <div className="summary-card">
                  <h4>סיכום {stageInfo(stage).name} ({FIRST_YEAR}–{year - 1})</h4>
                  <p>
                    התחלתם עם {shekel(startCash)} וסיימתם עם {shekel(netWorth)}. אחרי האינפלציה, זה שווה{' '}
                    {shekel(netWorth / priceLevel)} במחירי {FIRST_YEAR}.
                  </p>
                  <p>ציון ההחלטות: {rubric.total}/100. זה מה שקובע, לא הרווח.</p>
                  {(() => {
                    const rows = [
                      ...stageResults,
                      { stage, startCash, netWorth, realValue: Math.round(netWorth / priceLevel), score: rubric.total },
                    ];
                    return rows.length > 1 || stage === 3 ? (
                      <table className="stage-table">
                        <thead>
                          <tr>
                            <th>שלב</th>
                            <th>תקציב</th>
                            <th>בסוף</th>
                            <th>שינוי ריאלי</th>
                            <th>ציון</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r) => (
                            <tr key={r.stage}>
                              <td>{STAGES[r.stage - 1].name}</td>
                              <td>{shekel(r.startCash)}</td>
                              <td>{shekel(r.netWorth)}</td>
                              <td>{(((r.realValue / r.startCash) - 1) * 100).toFixed(1)}%</td>
                              <td>{r.score}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : null;
                  })()}
                  <p>
                    {stage < 3
                      ? 'חכו שהמורה יפתח את השלב הבא. אפשר בינתיים לכתוב "מה למדתי" ביומן.'
                      : 'שאלה לסיכום: איזה עולם התאים לאיזו מטרה, ולמה?'}
                  </p>
                  <button className="btn-mini" onClick={resetGame}>
                    <RotateCcw size={14} /> לשחק את השלב הזה מחדש
                  </button>
                </div>
              )}
              <div className="mini-holding-row pocket-cash">
                <span>כסף פנוי (לא מרוויח ריבית)</span>
                <strong className="text-emerald">{shekel(cash)}</strong>
              </div>
              <h4 className="section-title">הנכסים בתיק</h4>
              {holdings.length === 0 ? (
                <p className="text-muted">התיק עוד ריק. היכנסו לבניין של השלב הנוכחי כדי להשקיע.</p>
              ) : (
                holdings.map((h) => (
                  <div key={h.id} className="mini-holding-row">
                    <div>
                      <div>
                        <strong>{h.name}</strong>
                        {h.fictional && <span className="fict-tag">בדוי</span>}
                      </div>
                      <div className="row-sub">
                        {h.region} • סיכון {h.riskLevel} • מאז {h.sinceYear}
                      </div>
                      {h.mortgage && h.mortgage.loan > 0 && (
                        <div className="row-sub">
                          שווי הדירה {shekel(h.mortgage.propertyValue)} פחות משכנתא {shekel(h.mortgage.loan)} = ההון העצמי שלכם
                        </div>
                      )}
                    </div>
                    <strong>{shekel(h.currentValue)}</strong>
                  </div>
                ))
              )}
            </div>
          )}

          {tikTab === 'missions' && (
            <div className="phone-section">
              <p className="phone-hint">משימות מקנות הבנה, לא כסף. אין בונוסים כספיים במשחק.</p>
              {missions.map((m) => (
                <div key={m.id} className={`mission-card ${m.completed ? 'done' : ''}`}>
                  <div className="mission-top">
                    {m.completed ? <CheckCircle size={18} className="text-emerald" /> : <Circle size={18} className="text-muted" />}
                    <strong>{m.title}</strong>
                  </div>
                  <div className="row-sub">איפה: {m.regionHint}</div>
                  <p>{m.description}</p>
                </div>
              ))}
            </div>
          )}

          {tikTab === 'journal' && (
            <div className="phone-section">
              <p className="phone-hint">"מנצחים בהחלטות טובות, לא ברווח." אחרי שהשנה נגמרת, כתבו מה למדתם.</p>
              {journal.length === 0 && <p className="text-muted">עוד אין החלטות ביומן.</p>}
              {journal.map((entry) => (
                <div key={entry.id} className="journal-card">
                  <div className="journal-meta">
                    <span>
                      {entry.year} • {entry.region}
                    </span>
                    <span className="journal-cat">{entry.category}</span>
                  </div>
                  <div className="journal-action">{entry.actionTitle}</div>
                  <div className="journal-q">
                    <b>מה חשבתי:</b> "{entry.thoughtBefore}"
                  </div>
                  {entry.outcomeNote && <div className="journal-outcome">{entry.outcomeNote}</div>}
                  {entry.learnedAfter ? (
                    <div className="journal-a">
                      <b>מה למדתי:</b> {entry.learnedAfter}
                    </div>
                  ) : entry.year < year ? (
                    <ReflectionBox entryId={entry.id} />
                  ) : (
                    <div className="row-sub">את "מה למדתי" כותבים אחרי שהשנה מסתיימת.</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tikTab === 'mix' && (() => {
            const now = composition(cash, holdings);
            const rows = [
              ...snapshots.map((sn) => ({ label: `סוף ${sn.year}`, slices: sn.slices })),
              ...(over ? [] : [{ label: `עכשיו (${year})`, slices: now }]),
            ];
            return (
              <div className="phone-section">
                <h4 className="section-title">הרכב התיק עכשיו: {stageInfo(stage).name}</h4>
                <div className="mix-top">
                  <Donut slices={now} caption="שווי התיק" />
                  <MixLegend slices={now} />
                </div>
                <p className="text-muted" style={{ fontSize: 12 }}>
                  איזה חלק מהכסף נמצא בכל אפיק? כסף פנוי לא מרוויח, אבל אפשר להשתמש בו מיד.
                </p>
                <h4 className="section-title">איך ההרכב השתנה במהלך השלב</h4>
                {rows.length > 0 && <MixByYear rows={rows} />}
                <p className="text-muted" style={{ fontSize: 12 }}>
                  כל עמודה היא 100% מהתיק בסוף שנה. ההרכב משתנה גם בלי לקנות או למכור: אפיק שעלה תופס חלק גדול יותר.
                </p>
                {stageResults.length > 0 && (
                  <>
                    <h4 className="section-title">ההרכב בסוף כל שלב</h4>
                    <div className="mix-stages">
                      {stageResults.map((r) =>
                        r.slices && r.slices.length ? (
                          <div key={r.stage} className="mix-stage-card">
                            <b>{STAGES[r.stage - 1].name}</b>
                            <Donut slices={r.slices} size={110} />
                            <MixLegend slices={r.slices} />
                          </div>
                        ) : null
                      )}
                      <div className="mix-stage-card">
                        <b>{stageInfo(stage).name} (עכשיו)</b>
                        <Donut slices={now} size={110} />
                        <MixLegend slices={now} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          {tikTab === 'rubric' && (
            <div className="phone-section">
              <button className="btn-invest share-btn" onClick={() => useGameStore.getState().setShareOpen(true)}>
                <Send size={16} /> שליחת התוצאות למורה
              </button>
              <div className="rubric-hero">
                <div className="rubric-big">{rubric.total} / 100</div>
                <div>ציון איכות ההחלטות</div>
                <div className="row-sub">הערכה אוטומטית ראשונית. המורה קורא את ההנמקות וקובע את הציון הסופי.</div>
              </div>
              {[
                { label: '1. איכות ההנמקות ביומן', val: rubric.reasoning, max: 30 },
                { label: '2. פיזור והתאמה לסיכון', val: rubric.diversification, max: 20 },
                { label: '3. תשואה מתואמת סיכון (אחרי אינפלציה)', val: rubric.riskAdjusted, max: 20 },
                { label: '4. למידה ותיקון (מה למדתי)', val: rubric.learning, max: 15 },
                { label: '5. התמדה לאורך השנים', val: rubric.consistency, max: 15 },
              ].map((item) => (
                <div key={item.label} className="rubric-row">
                  <div className="rubric-labels">
                    <span>{item.label}</span>
                    <strong>
                      {item.val}/{item.max}
                    </strong>
                  </div>
                  <div className="rubric-bar">
                    <div className="rubric-fill" style={{ width: `${(item.val / item.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
