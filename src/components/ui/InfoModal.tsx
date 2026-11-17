import React from 'react';
import { X, Info } from 'lucide-react';
import { STAGES, stageInfo, useGameStore } from '../../store/gameStore';
import { HISTORY, SOURCES } from '../../data/history';

export const InfoModal: React.FC = () => {
  const open = useGameStore((s) => s.infoOpen);
  const setInfoOpen = useGameStore((s) => s.setInfoOpen);
  const stage = useGameStore((s) => s.stage);
  const year = useGameStore((s) => s.year);
  const startNextStage = useGameStore((s) => s.startNextStage);
  const presentMode = useGameStore((s) => s.presentMode);
  const isGameOver = useGameStore((s) => s.isGameOver);
  if (!open) return null;
  const finished = isGameOver();
  return (
    <div className="modal-backdrop" onClick={() => setInfoOpen(false)}>
      <div className="modal-card info-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Info size={20} className="inline-icon" /> למורה: על המשחק
          </h2>
          <button className="icon-close" onClick={() => setInfoOpen(false)} aria-label="סגירה">
            <X size={20} />
          </button>
        </div>

        <div className="teacher-stage teacher-class">
          <h4 style={{ marginTop: 0 }}>הקרנה בכיתה</h4>
          <p>תנו לכל תלמיד קוד תלמיד (למשל י3-07) ושמרו אצלכם את הרשימה של מי כל קוד, מחוץ למשחק. התלמידים מקלידים את הקוד בתיק, יוצרים קוד תוצאות ("שליחת התוצאות למורה") ושולחים לכם. תלמיד שעובר מחשב משתמש ב"שמירה והמשך במחשב אחר". בלוח הכיתה מדביקים את הקודים ומציגים על המסך. השמות מוסתרים כברירת מחדל, והלוח לא נשמר.</p>
          <p style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn-invest" onClick={() => useGameStore.getState().setClassBoardOpen(true)}>
              פתיחת לוח הכיתה
            </button>
            <button className={`btn-mini ${presentMode ? 'btn-on' : ''}`} onClick={() => useGameStore.getState().setPresentMode(!presentMode)}>
              מצב הקרנה (טקסט גדול): {presentMode ? 'פועל' : 'כבוי'}
            </button>
          </p>
          <p className="text-muted" style={{ fontSize: 12 }}>
            לפני שמציגים תוצאות של תלמיד מול הכיתה, כדאי לבקש את הסכמתו. מומלץ להציג החלטות ונימוקים, לא רווחים.
          </p>
        </div>

        <div className="teacher-stage">
          <h4 style={{ marginTop: 0 }}>שלבי המשחק (למורה)</h4>
          <p>
            עכשיו: שלב {stage}, {stageInfo(stage).name}, שנת {Math.min(year, 2024)}
            {finished ? ' (השלב הסתיים)' : ''}.
          </p>
          {stage < 3 ? (
            <button
              className="btn-invest"
              onClick={() => {
                const msg = finished
                  ? `לפתוח את ${stageInfo((stage + 1) as 1 | 2 | 3).name}?`
                  : `השלב הנוכחי עוד לא הסתיים (שנת ${year}). לפתוח בכל זאת את ${stageInfo((stage + 1) as 1 | 2 | 3).name}? התוצאה של השלב הנוכחי תישמר כמו שהיא.`;
                if (window.confirm(msg.replace('התוצאה של השלב הנוכחי תישמר כמו שהיא.', 'ההתקדמות בשלב הנוכחי תישמר, ואפשר לחזור אליו.'))) startNextStage();
              }}
            >
              פתיחת השלב הבא: {stageInfo((stage + 1) as 1 | 2 | 3).name}
            </button>
          ) : (
            <p>זה השלב האחרון. בסוף השלב, התלמידים רואים בתיק טבלה שמשווה בין שלושת העולמות.</p>
          )}
          <p style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            מעבר ישיר לשלב (ההתקדמות בכל שלב נשמרת):
            {STAGES.map((st) => (
              <button key={st.n} className="btn-mini" disabled={st.n === stage} onClick={() => useGameStore.getState().goToStage(st.n)}>
                {st.n}. {st.name}
              </button>
            ))}
          </p>
          <p>
            <button
              className="btn-mini"
              onClick={() => {
                if (window.confirm('למחוק את כל ההתקדמות בכל השלבים במחשב הזה? מתאים למחשב משותף, לפני שתלמיד אחר מתחיל.')) {
                  try {
                    window.localStorage.removeItem('tiktov-game-v2');
                  } catch {
                    /* storage unavailable */
                  }
                  window.location.reload();
                }
              }}
            >
              איפוס מלא במחשב הזה (תלמיד חדש)
            </button>
          </p>
          <p className="text-muted" style={{ fontSize: 12 }}>
            ההתקדמות נשמרת בכל מחשב בנפרד, ולכן כל תלמיד לוחץ על הכפתור כשהמורה אומר (כמו בכפתור "לשנה הבאה").
          </p>
        </div>

        <h4>למי ומה</h4>
        <p>
          כלי תרגול לחינוך פיננסי בכיתה י׳: הכנסה מעבודה ותקציב, חיסכון וריבית, שוק ההון, נדל"ן, סיכון ותשואה, פיזור, אופק השקעה ואינפלציה.
        </p>
        <ul>
          {STAGES.map((st) => (
            <li key={st.n}>
              שלב {st.n}, {st.name}: תקציב ₪{st.budget.toLocaleString('he-IL')}. {st.intro[0]}
            </li>
          ))}
        </ul>
        <p>
          כל שלב משחק מחדש את השנים 2017 עד 2024, כך שאפשר להשוות בין העולמות באותן שנים. כל סבב הוא שנה אחת, והמורה מקדם את השנה בכפתור "לשנה
          הבאה".
        </p>

        <h4>עבודה בקיץ</h4>
        <p>
          פעם בשנה התלמיד יכול לעבוד בעבודת קיץ שמתאימה לגילו, ולקבל משכורת לדוגמה (2,600–3,400 ₪). אחרי כל משכורת הוא מחליט כמה לחסוך
          וכמה להוציא, ומנמק ביומן. זו הזדמנות לדבר על תקציב, על חיסכון מכל משכורת ועל תלוש שכר.
        </p>

        <h4>בטיחות, פרטיות ואבטחה</h4>
        <ul>
          <li>כסף וירטואלי בלבד. אין מסחר אמיתי, אין המלצות השקעה ואין פרסומות.</li>
          <li>המשחק לא אוסף מידע ולא שולח שום דבר לאינטרנט. ההתקדמות נשמרת רק בדפדפן של התלמיד, במכשיר שלו.</li>
          <li>אין הרשמה, אין שם מלא, אין טלפון ואין מייל.</li>
          <li>הנתונים הם נתוני עבר, לא נתונים בזמן אמת. ביצועי עבר לא מבטיחים תשואות בעתיד.</li>
          <li>אבטחה: האתר מוגש ב-HTTPS, ומדיניות אבטחת תוכן (CSP) חוסמת קוד וקבצים מאתרים חיצוניים. אין שרת, אין מסד נתונים ואין סיסמאות.</li>
          <li>במחשב משותף, ההתקדמות של תלמיד אחד נשארת בדפדפן. לפני שתלמיד אחר מתחיל, השתמשו בכפתור "איפוס מלא במחשב הזה".</li>
          <li>הציון נשמר במחשב של התלמיד, ולכן הוא כלי לשיחה ולמשוב ולא לציון רשמי. ההערכה הרשמית מומלצת על בסיס יומן ההחלטות.</li>
        </ul>

        <h4>הנתונים</h4>
        <p>
          תשואות מדד ת"א-125, מדד מחירי הדירות, האינפלציה וריבית בנק ישראל הם נתוני אמת שנתיים. פיקדון מחושב בקירוב לפי הריבית הממוצעת של
          בנק ישראל באותה שנה, פיקדון צמוד למדד מרוויח בדיוק את שינוי המדד (פישוט), דירה להשקעה נקנית בהון עצמי ובמשכנתא של עד 50% מהמחיר (הוראת בנק ישראל 329). שווי הדירה משתנה לפי מדד מחירי הדירות, השכירות (הנחה: 3% בשנה) נכנסת לכסף הפנוי, וההחזר השנתי יוצא ממנו. המשכנתא בפישוט: 25 שנה, תשלום שנתי, וריבית משתנה לפי הממוצע השנתי של משכנתאות לא צמודות ל-20–25 שנה. בלי מסים, עמלות ותיקונים. המניה הבודדת בדויה, ומסומנת כך במשחק. בשלב הבורסה יש גם ארבעה ענפים (בנקים, טכנולוגיה, נפט וגז, נדל"ן) לפי מדדי הענפים של הבורסה, מתוך הסקירות השנתיות שלה. בשלב החיסכון כל פיקדון הוא עץ: הריבית היא הפירות, ואפשר לשתול אותם מחדש (ריבית דריבית) או לקטוף אותם לכסף הפנוי. מומלץ לאמת את
          המספרים מול המקור לפני שימוש בכיתה.
        </p>
        <table className="data-table">
          <thead>
            <tr>
              <th>שנה</th>
              <th>ת"א-125</th>
              <th>דירות</th>
              <th>אינפלציה</th>
              <th>ריבית בסוף השנה</th>
            </tr>
          </thead>
          <tbody>
            {HISTORY.map((h) => (
              <tr key={h.year}>
                <td>{h.year}</td>
                <td>{h.returns.ta125}%</td>
                <td>{h.returns.housing}%</td>
                <td>{h.cpi}%</td>
                <td>{h.boiRateEnd}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="sources">
          {SOURCES.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
