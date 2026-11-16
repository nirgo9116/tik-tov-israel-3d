import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { STAGES, useGameStore } from '../../store/gameStore';
import { FIRST_YEAR, LAST_YEAR } from '../../data/history';

interface Step {
  title: string;
  body: string[];
}

const shekel = (n: number) => `₪${n.toLocaleString('he-IL')}`;

function buildSteps(lite: boolean): Step[] {
  return [
    {
      title: 'ברוכים הבאים לתיק טוב!',
      body: [
        `המשחק בנוי משלושה שלבים. בכל שלב מנהלים כסף וירטואלי לאורך ${LAST_YEAR - FIRST_YEAR + 1} שנים, מ-${FIRST_YEAR} עד ${LAST_YEAR}.`,
        'כל מה שקורה במשחק מבוסס על מה שקרה באמת בישראל באותן שנים: הבורסה, מחירי הדירות, הריבית והאינפלציה.',
        'המטרה היא לא להרוויח הכי הרבה, אלא לקבל החלטות טובות ומנומקות.',
      ],
    },
    {
      title: 'שלושה שלבים, שלושה עולמות',
      body: [
        `שלב 1, עולם החיסכון (${shekel(STAGES[0].budget)}): הבנק בירושלים. פיקדון רגיל או פיקדון צמוד למדד.`,
        `שלב 2, עולם הבורסה (${shekel(STAGES[1].budget)}): הבורסה בתל אביב. קרן מחקת מדד ת"א-125, או מניה בודדת בסיכון גבוה.`,
        `שלב 3, עולם הנדל"ן (${shekel(STAGES[2].budget)}): משרד התיווך בחיפה. דירה להשקעה או קבוצת רכישה עם שותפים.`,
        'בכל שלב רק העיר של השלב פתוחה. המורה פותח את השלב הבא, ובסוף משווים בין שלושת העולמות.',
        'נכס שמסומן "בדוי" הומצא לצורך הלימוד, והנתונים שלו לא אמיתיים.',
      ],
    },
    lite
      ? {
          title: 'איך מגיעים לעיר',
          body: ['לוחצים על שם העיר במפה, ונפתח מסך ההשקעה שלה.', 'הכפתור "תלת-ממד" למעלה מעביר לעולם התלת-ממדי, אם המחשב מספיק חזק.'],
        }
      : {
          title: 'איך מסתובבים',
          body: [
            'הולכים עם המקשים W A S D או עם החיצים.',
            'כשמגיעים לעיגול הצבעוני שליד בניין, לוחצים Enter ונכנסים פנימה: לבנק, לבורסה או למשרד התיווך (רק לבניין של השלב הנוכחי). בפנים הולכים לעמדות שמסומנות על הרצפה ולוחצים E: בעמדה הצהובה משקיעים, ובשאר העמדות רואים נתונים מהשנים שעברו. Esc מוציא החוצה. קיצור דרך: הכפתור "השקעה" (או המקש I) פותח ישר את מסך ההשקעה של השלב.',
            'רוצים להגיע מהר? לוחצים T ונוסעים ברכבת לכל עיר. בזמן הנסיעה רואים מה אפשר לעשות בעיר שאליה נוסעים.',
            'גלגלת העכבר (או + ו-) מתקרבת ומתרחקת, ו-M מציג את כל הארץ מלמעלה.',
            'המחשב איטי? הכפתור "גרסה קלה" למעלה מציג מפה פשוטה.',
          ],
        },
    {
      title: 'אין החלטה בלי הנמקה',
      body: [
        'במסך של כל עיר כותבים קודם ביומן ההחלטות: למה אני משקיע כאן, ומה לדעתי יקרה השנה.',
        'בלי הנמקה של משפט אחד לפחות, כפתור ההשקעה לא נפתח. גם מכירה צריכה הנמקה.',
        'אחר כך בוחרים סכום ולוחצים "השקעה". אפשר לחלק את הכסף בין כמה ערים.',
      ],
    },
    {
      title: 'עבודה בקיץ',
      body: [
        'בכל עיר יש עבודת קיץ: משלוחים מגלידרייה, הדרכה בקייטנה, חלוקת עלונים או שיעורים פרטיים.',
        lite
          ? 'לוחצים "לעבוד בקיץ" במסך העיר, ומקבלים משכורת.'
          : 'לוחצים J (או הולכים לדוכן הירוק בעיר ולוחצים E), לוקחים חבילה ומביאים אותה ל-3 אנשים שמחכים ליד עמודי האור הצהובים. בכל עצירה רואים כמה הרווחתם.',
        'אחרי כל משכורת מחליטים כמה לחסוך בתיק וכמה להוציא, ומנמקים ביומן. אפשר לעבוד פעם אחת בשנה.',
      ],
    },
    {
      title: 'השנה מתקדמת אצל המורה',
      body: [
        'המורה לוחץ "לשנה הבאה", וכל הכיתה עוברת שנה יחד.',
        'אז מתגלה מה קרה באמת באותה שנה: כותרת בפס החדשות למעלה, והשווי של כל נכס בתיק משתנה.',
        'כסף פנוי שלא הושקע לא מרוויח כלום, והאינפלציה שוחקת אותו. שימו לב למספר "בכוח קנייה של 2017".',
      ],
    },
    {
      title: 'מה למדתי?',
      body: [
        'לוחצים P (או "התיק שלי") כדי לפתוח את התיק.',
        'בלשונית "יומן" רואים כל החלטה, מה חשבתם, ומה קרה בפועל.',
        'אחרי שהשנה נגמרת כותבים "מה למדתי": האם ההנמקה התאמתה למציאות, ומה הייתם עושים אחרת.',
      ],
    },
    {
      title: 'איך מקבלים ציון',
      body: [
        'הציון הוא מתוך 100, והוא מודד את איכות ההחלטות:',
        'הנמקות (30), פיזור והתאמה לסיכון (20), תשואה אחרי אינפלציה (20), "מה למדתי" (15), והתמדה לאורך השנים (15).',
        'שימו כל הכסף בנכס אחד מסוכן? ציון הפיזור יורד, גם אם הרווחתם.',
        'המורה קורא את היומן וקובע את הציון הסופי. בהצלחה!',
      ],
    },
  ];
}

export const TutorialModal: React.FC = () => {
  const open = useGameStore((s) => s.tutorialOpen);
  const lite = useGameStore((s) => s.liteMode);
  const setTutorialOpen = useGameStore((s) => s.setTutorialOpen);
  const [i, setI] = useState(0);
  if (!open) return null;
  const steps = buildSteps(lite);
  const step = steps[i];
  const last = i === steps.length - 1;
  const close = () => {
    setI(0);
    setTutorialOpen(false);
  };
  return (
    <div className="modal-backdrop">
      <div className="modal-card tutorial-card" role="dialog" aria-label="מדריך לשחקנים">
        <div className="modal-header">
          <div>
            <span className="stage-badge" style={{ backgroundColor: '#0ea5e9' }}>
              מדריך לשחקנים • {i + 1} מתוך {steps.length}
            </span>
            <h2>{step.title}</h2>
          </div>
          <button className="icon-close" onClick={close} aria-label="סגירה">
            <X size={20} />
          </button>
        </div>
        <ul className="tutorial-list">
          {step.body.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <div className="tutorial-dots">
          {steps.map((_, k) => (
            <span key={k} className={k === i ? 'on' : ''} />
          ))}
        </div>
        <div className="tutorial-nav">
          <button className="btn-mini" disabled={i === 0} onClick={() => setI(i - 1)}>
            <ChevronRight size={14} /> הקודם
          </button>
          {last ? (
            <button className="btn-invest" onClick={close}>
              יאללה, מתחילים!
            </button>
          ) : (
            <button className="btn-invest" onClick={() => setI(i + 1)}>
              הבא <ChevronLeft size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
