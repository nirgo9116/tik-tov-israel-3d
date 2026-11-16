import React from 'react';
import { X, Info } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { HISTORY, SOURCES } from '../../data/history';

export const InfoModal: React.FC = () => {
  const open = useGameStore((s) => s.infoOpen);
  const setInfoOpen = useGameStore((s) => s.setInfoOpen);
  if (!open) return null;
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

        <h4>למי ומה</h4>
        <p>
          כלי תרגול לחינוך פיננסי בכיתה י׳: הכנסה מעבודה ותקציב, חיסכון וריבית, נדל"ן, שוק ההון, סיכון ותשואה, פיזור, אופק השקעה ואינפלציה. כל סבב הוא שנה אחת,
          מ-2017 עד 2024. המורה מקדם את השנה בכפתור "לשנה הבאה", כך שהכיתה מתקדמת יחד.
        </p>

        <h4>עבודה בקיץ</h4>
        <p>
          פעם בשנה התלמיד יכול לעבוד בעבודת קיץ שמתאימה לגילו, ולקבל משכורת לדוגמה (2,600–3,400 ₪). אחרי כל משכורת הוא מחליט כמה לחסוך
          וכמה להוציא, ומנמק ביומן. זו הזדמנות לדבר על תקציב, על חיסכון מכל משכורת ועל תלוש שכר.
        </p>

        <h4>בטיחות ופרטיות</h4>
        <ul>
          <li>כסף וירטואלי בלבד. אין מסחר אמיתי, אין המלצות השקעה ואין פרסומות.</li>
          <li>המשחק לא אוסף מידע ולא שולח שום דבר לאינטרנט. ההתקדמות נשמרת רק בדפדפן של התלמיד, במכשיר שלו.</li>
          <li>אין הרשמה, אין שם מלא, אין טלפון ואין מייל.</li>
          <li>הנתונים הם נתוני עבר, לא נתונים בזמן אמת. ביצועי עבר לא מבטיחים תשואות בעתיד.</li>
        </ul>

        <h4>הנתונים</h4>
        <p>
          תשואות מדד ת"א-125, מדד מחירי הדירות, האינפלציה וריבית בנק ישראל הם נתוני אמת שנתיים. פיקדון מחושב בקירוב לפי הריבית הממוצעת של
          בנק ישראל באותה שנה, ולדירה להשקעה נוספה הנחה של 3% שכירות. המניה הבודדת והקואופרטיב בנגב בדויים, ומסומנים כך במשחק. מומלץ לאמת את
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
