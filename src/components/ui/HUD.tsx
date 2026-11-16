import React, { useEffect } from 'react';
import { Backpack, Radio, MapPin, FastForward, TrainFront, Info, Monitor, Box, HelpCircle, Map as MapIcon, Sparkles, Briefcase } from 'lucide-react';
import { CITY_HUBS, JOBS, START_CASH, useGameStore } from '../../store/gameStore';
import { FIRST_YEAR, LAST_YEAR } from '../../data/history';

const shekel = (n: number) => `₪${Math.round(n).toLocaleString('he-IL')}`;

export const HUD: React.FC = () => {
  const cash = useGameStore((s) => s.cash);
  const year = useGameStore((s) => s.year);
  const interestRate = useGameStore((s) => s.interestRate);
  const priceLevel = useGameStore((s) => s.priceLevel);
  const currentEvent = useGameStore((s) => s.currentEvent);
  const nearbyHub = useGameStore((s) => s.nearbyHub);
  const playerPos = useGameStore((s) => s.playerPos);
  const toastMessage = useGameStore((s) => s.toastMessage);
  const liteMode = useGameStore((s) => s.liteMode);

  const getNetWorth = useGameStore((s) => s.getNetWorth);
  const getCurrentRegionName = useGameStore((s) => s.getCurrentRegionName);
  const getRubric = useGameStore((s) => s.getRubric);
  const isGameOver = useGameStore((s) => s.isGameOver);
  const setTikOpen = useGameStore((s) => s.setTikOpen);
  const setOpenHub = useGameStore((s) => s.setOpenHub);
  const setTrainOpen = useGameStore((s) => s.setTrainOpen);
  const setInfoOpen = useGameStore((s) => s.setInfoOpen);
  const setTutorialOpen = useGameStore((s) => s.setTutorialOpen);
  const overview = useGameStore((s) => s.overview);
  const setOverview = useGameStore((s) => s.setOverview);
  const setLiteMode = useGameStore((s) => s.setLiteMode);
  const highGraphics = useGameStore((s) => s.highGraphics);
  const setHighGraphics = useGameStore((s) => s.setHighGraphics);
  const advanceYear = useGameStore((s) => s.advanceYear);
  const activeJob = useGameStore((s) => s.activeJob);
  const cancelJob = useGameStore((s) => s.cancelJob);
  const nearbyJob = useGameStore((s) => s.nearbyJob);
  const jobYear = useGameStore((s) => s.jobYear);
  const startJob = useGameStore((s) => s.startJob);
  const setJobsOpen = useGameStore((s) => s.setJobsOpen);
  const standJob = JOBS.find((j) => j.id === nearbyJob);
  const canWork = !activeJob && jobYear !== year;
  const clearToast = useGameStore((s) => s.clearToast);

  const netWorth = getNetWorth();
  const rubric = getRubric();
  const over = isGameOver();
  const activeHub = CITY_HUBS.find((h) => h.id === nearbyHub);
  const realValue = netWorth / priceLevel;
  const roundNo = Math.min(year, LAST_YEAR) - FIRST_YEAR + 1;
  const rounds = LAST_YEAR - FIRST_YEAR + 1;

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => clearToast(), 7000);
    return () => clearTimeout(t);
  }, [toastMessage, clearToast]);

  return (
    <div className="hud-layer">
      <div className="hud-topbar">
        <div className="brand-pill">
          <span className="brand-dot" />
          <div>
            <div className="brand-title">תיק טוב: מסע השקעות בישראל</div>
            <div className="brand-sub">
              {over ? 'המשחק הסתיים' : `שנת ${year} (סבב ${roundNo} מתוך ${rounds})`} • ריבית בנק ישראל {interestRate}%
              {!liteMode && <> • <b>{getCurrentRegionName()}</b></>}
            </div>
          </div>
        </div>

        <div className="stats-group">
          <div className="stat-chip">
            <span className="stat-label">כסף פנוי</span>
            <span className="stat-val text-emerald">{shekel(cash)}</span>
          </div>
          <div className="stat-chip">
            <span className="stat-label">שווי התיק</span>
            <span className="stat-val">{shekel(netWorth)}</span>
          </div>
          <div className="stat-chip" title={`כמה שווה התיק במחירי ${FIRST_YEAR}, אחרי האינפלציה. התחלתם עם ${shekel(START_CASH)}.`}>
            <span className="stat-label">בכוח קנייה של {FIRST_YEAR}</span>
            <span className="stat-val">{shekel(realValue)}</span>
          </div>
          <div className="stat-chip">
            <span className="stat-label">ציון החלטות</span>
            <span className="stat-val text-amber">{rubric.total}/100</span>
          </div>
        </div>

        <div className="meters-group">
          <button className="btn-mini" onClick={() => setTutorialOpen(true)} title="מדריך לשחקנים">
            <HelpCircle size={14} /> איך משחקים?
          </button>
          <button className="btn-mini" onClick={() => setInfoOpen(true)} title="למורה: מקורות, פרטיות ותוכנית הלימודים">
            <Info size={14} /> למורה
          </button>
          {!liteMode && (
            <button
              className={`btn-mini ${highGraphics ? 'btn-on' : ''}`}
              onClick={() => setHighGraphics(!highGraphics)}
              title="אפקטים מתקדמים: הצללות רכות, זוהר ותאורה עשירה. מתאים למחשבים חזקים."
            >
              <Sparkles size={14} /> גרפיקה {highGraphics ? 'גבוהה' : 'רגילה'}
            </button>
          )}
          <button
            className="btn-mini"
            onClick={() => setLiteMode(!liteMode)}
            title={liteMode ? 'מעבר לתצוגת תלת-ממד' : 'גרסה קלה למחשבים חלשים'}
          >
            {liteMode ? <Box size={14} /> : <Monitor size={14} />} {liteMode ? 'תלת-ממד' : 'גרסה קלה'}
          </button>
        </div>
      </div>

      <div className="news-banner">
        <Radio size={16} className="news-icon" />
        <div className="news-text">
          {currentEvent ? (
            <>
              <strong>{currentEvent.headline}</strong> — <span>{currentEvent.detail}</span>
            </>
          ) : (
            <>
              <strong>ברוכים הבאים ל-{FIRST_YEAR}!</strong> —{' '}
              <span>
                יש לכם {shekel(START_CASH)} (כסף וירטואלי). בכל שנה מחליטים איפה להשקיע ומנמקים, ובסוף השנה רואים מה קרה באמת לפי נתוני העבר.
              </span>
            </>
          )}
        </div>
        <button className="btn-mini" onClick={advanceYear} disabled={over} title="המורה מקדם את הכיתה לשנה הבאה">
          <FastForward size={14} /> {year >= LAST_YEAR ? 'סיום המשחק' : 'לשנה הבאה'}
        </button>
      </div>

      {toastMessage && !activeJob && <div className="toast-pill">{toastMessage}</div>}

      {activeJob && (() => {
        const job = JOBS.find((j) => j.id === activeJob.jobId)!;
        const t = job.targets[activeJob.done];
        const meters = t ? Math.round(Math.hypot(t[0] - playerPos[0], t[1] - playerPos[2]) * 10) : 0;
        return (
          <div className="job-pill">
            <span>
              <b>{job.title}</b> · עצירה {activeJob.done + 1} מתוך {job.targets.length} · עוד {meters} מ׳. עקבו אחרי החץ הצהוב.
              {toastMessage && <small className="job-pill-msg">{toastMessage}</small>}
            </span>
            <button className="btn-mini" onClick={cancelJob}>
              עזיבה
            </button>
          </div>
        );
      })()}

      {!liteMode && (
        <div className="interaction-prompts">
          {standJob && canWork && (
            <button className="prompt-btn prompt-job" onClick={() => startJob(standJob.id)}>
              <Briefcase size={18} />
              <span>
                עבודה בקיץ: <strong>{standJob.title}</strong> ({`₪${standJob.pay.toLocaleString('he-IL')}`}) — מקש <b>E</b> כדי להתחיל
              </span>
            </button>
          )}
          {standJob && !canWork && !activeJob && (
            <div className="prompt-btn">כבר עבדתם השנה. אפשר לעבוד שוב אחרי שהמורה יעביר שנה.</div>
          )}
          {activeHub && !standJob && (
            <button className="prompt-btn prompt-landmark" onClick={() => setOpenHub(activeHub.id)}>
              <MapPin size={18} />
              <span>
                כניסה ל<strong>{activeHub.hebrewName}</strong> ({activeHub.hubTitle}) — מקש <b>Enter</b>
              </span>
            </button>
          )}
        </div>
      )}

      {!liteMode && (
        <div className="minimap-card">
          <div className="minimap-title">מפת ישראל (צפון ▲){activeJob ? " · צהוב: העצירה הבאה" : canWork ? " · ירוק: עבודה" : ""}</div>
          <div className="minimap-box israel-radar">
            <div className="radar-sea" />
            {CITY_HUBS.map((hub) => (
              <div
                key={hub.id}
                className="minimap-dot"
                style={{
                  left: `${((hub.position[0] + 28) / 56) * 100}%`,
                  top: `${((hub.position[2] + 44) / 88) * 100}%`,
                  backgroundColor: hub.color,
                }}
                title={hub.hebrewName}
              />
            ))}
            {activeJob &&
              (() => {
                const job = JOBS.find((j) => j.id === activeJob.jobId)!;
                const t = job.targets[activeJob.done];
                return t ? (
                  <div className="minimap-target" style={{ left: `${((t[0] + 28) / 56) * 100}%`, top: `${((t[1] + 44) / 88) * 100}%` }} title="העצירה הבאה" />
                ) : null;
              })()}
            {canWork &&
              JOBS.map((j) => (
                <div key={j.id} className="minimap-stand" style={{ left: `${((j.stand[0] + 28) / 56) * 100}%`, top: `${((j.stand[1] + 44) / 88) * 100}%` }} title={`עבודה: ${j.title}`} />
              ))}
            <div
              className="minimap-player"
              style={{
                left: `${((playerPos[0] + 28) / 56) * 100}%`,
                top: `${((playerPos[2] + 44) / 88) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="bottom-right-actions">
        {!liteMode && (
          <div className="controls-hint">
            <b>WASD / חיצים</b> הליכה • <b>גלגלת או + / -</b> זום • <b>M</b> כל הארץ • <b>Enter</b> כניסה לעיר • <b>E</b> עבודה • <b>T</b> רכבת • <b>P</b> התיק שלי
          </div>
        )}
        {!liteMode && (
          <button className="phone-fab map-fab" onClick={() => setOverview(!overview)}>
            <MapIcon size={20} />
            <span>{overview ? 'חזרה לשחקן (M)' : 'כל הארץ (M)'}</span>
          </button>
        )}
        {!liteMode && (
          <button className="phone-fab train-fab" onClick={() => setTrainOpen(true)}>
            <TrainFront size={20} />
            <span>רכבת ישראל (T)</span>
          </button>
        )}
        <button className={`phone-fab job-fab${canWork ? ' pulse' : ''}`} onClick={() => setJobsOpen(true)}>
          <Briefcase size={20} />
          <span>עבודה בקיץ (J)</span>
        </button>
        <button className="phone-fab" onClick={() => setTikOpen(true)}>
          <Backpack size={20} />
          <span>התיק שלי (P)</span>
        </button>
      </div>
    </div>
  );
};
