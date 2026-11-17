import type { CityHubId } from '../types/game';
import type { AssetKey } from './history';

/** What happens at a station inside a building. */
export type StationAction =
  | { kind: 'invest' }
  | { kind: 'exit' }
  | { kind: 'info'; title: string; body: string[]; series?: { key: AssetKey | 'boiRateEnd' | 'cpi' | 'mortgageRate'; label: string; fictional?: boolean } };

export interface Station {
  id: string;
  label: string;
  pos: [number, number];
  action: StationAction;
}

export interface InteriorDef {
  title: string;
  floor: string;
  wall: string;
  accent: string;
  stations: Station[];
  /** Furniture the player cannot walk through: [x, z, width, depth]. */
  blockers: Array<[number, number, number, number]>;
}

/** Room is 20 x 14 units, centred on the origin. The door is at +z. */
export const ROOM_HALF_W = 10;
export const ROOM_HALF_D = 7;
export const DOOR: [number, number] = [0, 6.2];

const exit: Station = { id: 'exit', label: 'יציאה לרחוב', pos: DOOR, action: { kind: 'exit' } };

export const INTERIORS: Record<CityHubId, InteriorDef> = {
  jerusalem: {
    title: 'אולם הבנק',
    floor: '#e7e0d1',
    wall: '#d9cbb0',
    accent: '#10b981',
    blockers: [[0, -4.6, 12, 1.2], [7.8, 5, 1.6, 1.6]],
    stations: [
      { id: 'teller', label: 'דלפק הבנק: פיקדון רגיל או צמוד למדד', pos: [0, -3.2], action: { kind: 'invest' } },
      {
        id: 'rates',
        label: 'לוח הריבית',
        pos: [-7.5, -1.5],
        action: {
          kind: 'info',
          title: 'ריבית בנק ישראל בסוף כל שנה',
          body: [
            'הריבית של בנק ישראל משפיעה על הריבית שהבנקים נותנים על פיקדונות, ועל הריבית שהם גובים על הלוואות ומשכנתאות.',
            'כשהריבית עולה, פיקדון משתלם יותר, והלוואות נעשות יקרות יותר.',
          ],
          series: { key: 'boiRateEnd', label: 'ריבית בסוף השנה (%)' },
        },
      },
      {
        id: 'cpi',
        label: 'פינת האינפלציה',
        pos: [7.5, -1.5],
        action: {
          kind: 'info',
          title: 'אינפלציה: עליית המחירים בכל שנה',
          body: [
            'אינפלציה היא עלייה כללית במחירים. כשהמחירים עולים, אותו סכום כסף קונה פחות.',
            'ריבית ריאלית היא בערך הריבית פחות האינפלציה. אם הפיקדון נותן פחות מהאינפלציה, כוח הקנייה של הכסף יורד.',
          ],
          series: { key: 'cpi', label: 'אינפלציה בשנה (%)' },
        },
      },
      exit,
    ],
  },
  telaviv: {
    title: 'אולם המסחר בבורסה',
    floor: '#1f2937',
    wall: '#111827',
    accent: '#3b82f6',
    blockers: [[-4.5, -1, 4, 1.6], [4.5, -1, 4, 1.6], [7.8, 5, 1.6, 1.6]],
    stations: [
      { id: 'desk', label: 'עמדת השקעה', pos: [0, 1.2], action: { kind: 'invest' } },
      {
        id: 'wall',
        label: 'קיר המדד',
        pos: [0, -5],
        action: {
          kind: 'info',
          title: 'מדד ת"א-125: התשואה בכל שנה',
          body: [
            'מדד ת"א-125 כולל 125 חברות גדולות בבורסה בתל אביב. קרן מחקה מדד קונה את כולן ביחד.',
            'יש שנים של עליות ויש שנים של ירידות. לכן חשוב לחשוב על אופק ההשקעה: לכמה זמן הכסף יכול להישאר מושקע.',
          ],
          series: { key: 'ta125', label: 'תשואת המדד בשנה (%)' },
        },
      },
      {
        id: 'single',
        label: 'מסך המניה הבודדת',
        pos: [7.5, 2.5],
        action: {
          kind: 'info',
          title: 'מניה בודדת: "טכנו-חזון" (חברה בדויה)',
          body: [
            'החברה הזו בדויה, והתוצאות שלה הומצאו לצורך הלימוד. הן מראות מה קורה כשכל הכסף נמצא בחברה אחת.',
            'השוו לקיר המדד: מניה בודדת יכולה לעלות הרבה יותר, אבל גם לרדת הרבה יותר. פיזור מקטין את הסיכון הזה.',
          ],
          series: { key: 'fictionalStock', label: 'תשואת המניה הבדויה (%)', fictional: true },
        },
      },
      exit,
    ],
  },
  haifa: {
    title: 'משרד תיווך ונדל"ן',
    floor: '#cbb89d',
    wall: '#f1ece2',
    accent: '#f59e0b',
    blockers: [[0, -3.6, 6, 1.4], [-6.5, 1.5, 3, 3], [7.8, 5, 1.6, 1.6]],
    stations: [
      { id: 'agent', label: 'שולחן המתווך', pos: [0, -2.2], action: { kind: 'invest' } },
      {
        id: 'prices',
        label: 'לוח מחירי הדירות',
        pos: [7.5, -2],
        action: {
          kind: 'info',
          title: 'מדד מחירי הדירות: השינוי בכל שנה',
          body: [
            'מדד מחירי הדירות של הלמ"ס מודד כמה מחירי הדירות בישראל השתנו.',
            'במשחק, דירה להשקעה מרוויחה את שינוי המדד ועוד שכירות של 3% בשנה (הנחה לצורך הלימוד).',
          ],
          series: { key: 'housing', label: 'שינוי במחירי הדירות (%)' },
        },
      },
      {
        id: 'model',
        label: 'דגם הבניין',
        pos: [-6.5, 3.6],
        action: {
          kind: 'info',
          title: 'מה חשוב לדעת על דירה להשקעה',
          body: [
            'דירה היא נכס לא נזיל: קשה למכור אותה מהר, ומכירה לוקחת זמן ועולה כסף.',
            'יש גם הוצאות: תיקונים, תקופות בלי שוכר, מסים ועמלות. קבוצת רכישה מאפשרת לכמה אנשים לקנות יחד, אבל גם מחייבת הסכמות ביניהם.',
          ],
        },
      },
      {
        id: 'mortgage',
        label: 'יועצת המשכנתאות',
        pos: [5.2, -5.2],
        action: {
          kind: 'info',
          title: 'משכנתא: הון עצמי והלוואה',
          body: [
            'משכנתא היא הלוואה לקניית דירה. את החלק שאתם משלמים מכספכם קוראים הון עצמי. לדירה להשקעה הבנק מלווה עד 50% מהמחיר (הוראת בנק ישראל 329).',
            'משכנתא מאפשרת לקנות דירה יקרה יותר, אבל מגדילה גם את הסיכון: אם המחירים יורדים או הריבית עולה, ההפסד גדל. בכל חודש משלמים החזר, ואם השכירות קטנה ממנו משלימים מהכסף הפנוי.',
          ],
          series: { key: 'mortgageRate', label: 'ריבית ממוצעת על משכנתא (%)' },
        },
      },
      exit,
    ],
  },
  beersheva: {
    title: 'משרד השותפות הסולארית',
    floor: '#e9dcc3',
    wall: '#f5efe3',
    accent: '#a855f7',
    blockers: [[0, -3.6, 5, 1.4], [6, 0, 3, 3]],
    stations: [
      { id: 'office', label: 'דלפק השותפות', pos: [0, -2.2], action: { kind: 'invest' } },
      {
        id: 'solar',
        label: 'דגם החווה הסולארית',
        pos: [6, 2.4],
        action: {
          kind: 'info',
          title: 'קואופרטיב סולארי בנגב (בדוי)',
          body: [
            'השותפות הזו בדויה, והתוצאות שלה הומצאו לצורך הלימוד. היא מדגימה השקעה משותפת בפרויקט אזורי.',
            'בשותפות, כמה אנשים משקיעים יחד ומתחלקים ברווח ובסיכון. כדאי לבדוק מי מנהל, איך מקבלים החלטות, ומתי אפשר לצאת.',
          ],
          series: { key: 'fictionalCoop', label: 'תשואת השותפות הבדויה (%)', fictional: true },
        },
      },
      exit,
    ],
  },
};
