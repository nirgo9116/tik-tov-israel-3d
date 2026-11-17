import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Category,
  CityHubId,
  CityHubInfo,
  Holding,
  JournalEntry,
  Mission,
  RiskLevel,
  RubricBreakdown,
  YearEvent,
} from '../types/game';
import { AssetKey, FIRST_YEAR, LAST_YEAR, MAX_LTV_INVESTMENT, MORTGAGE_YEARS, RENT_YIELD, START_RATE, annualPayment, yearData } from '../data/history';
import { nearestStation, railPath } from '../data/rail';
import { composition, Slice } from '../data/composition';

/** The three stages ("worlds") of the game. Each one replays 2017–2024 with its own budget. */
export type StageNum = 1 | 2 | 3;
export interface StageInfo {
  n: StageNum;
  city: CityHubId;
  name: string;
  short: string;
  budget: number;
  color: string;
  intro: string[];
}
export const STAGES: StageInfo[] = [
  {
    n: 1,
    city: 'jerusalem',
    name: 'עולם החיסכון',
    short: 'חיסכון',
    budget: 50000,
    color: '#10b981',
    intro: [
      'בשלב הזה מנהלים 50,000 ₪ (כסף וירטואלי), רק באפיקי חיסכון: פיקדון רגיל ופיקדון צמוד למדד.',
      'הבנק נמצא בירושלים. נכנסים לבניין, לומדים מלוחות הריבית והאינפלציה, ומחליטים.',
      'השאלה של השלב: האם הכסף שומר על כוח הקנייה שלו כשהמחירים עולים?',
    ],
  },
  {
    n: 2,
    city: 'telaviv',
    name: 'עולם הבורסה',
    short: 'בורסה',
    budget: 250000,
    color: '#3b82f6',
    intro: [
      'בשלב הזה מנהלים 250,000 ₪ (כסף וירטואלי) בשוק ההון: קרן מחקת מדד ת"א-125 ומניה בודדת בדויה.',
      'הבורסה נמצאת בתל אביב. נכנסים לאולם המסחר, משווים בין המדד למניה הבודדת, ומחליטים.',
      'השאלה של השלב: איך מתמודדים עם עליות וירידות, ומה עושה הפיזור?',
    ],
  },
  {
    n: 3,
    city: 'haifa',
    name: 'עולם הנדל"ן',
    short: 'נדל"ן',
    budget: 1000000,
    color: '#f59e0b',
    intro: [
      'בשלב הזה מנהלים 1,000,000 ₪ (כסף וירטואלי) בנדל"ן: דירה להשקעה וקבוצת רכישה.',
      'משרד התיווך נמצא בחיפה. בודקים את מדד מחירי הדירות ואת השכירות, ומחליטים.',
      'השאלה של השלב: מה המחיר של נכס גדול שקשה למכור מהר?',
    ],
  },
];
export const stageInfo = (n: StageNum) => STAGES[n - 1];
/** The stage a city belongs to (Be'er Sheva has only a summer job). */
export const cityStage = (id: CityHubId): StageNum | null => STAGES.find((st) => st.city === id)?.n ?? null;
export const MIN_REASONING_CHARS = 15;
/** Letters typed (Hebrew or English), ignoring symbols like "////". */
export const letterCount = (t: string) => (t.match(/\p{L}/gu) ?? []).length;
/** A real sentence: enough letters and at least three words. */
export const isReasonOk = (t: string) =>
  letterCount(t) >= MIN_REASONING_CHARS && t.trim().split(/\s+/).filter((w) => /\p{L}/u.test(w)).length >= 3;

const CONCEPT_WORDS = ['סיכון', 'פיזור', 'ריבית', 'אינפלציה', 'טווח', 'תשואה', 'נזיל', 'מדד', 'שכירות', 'הפסד', 'ארוך', 'קצר'];

export const CITY_HUBS: CityHubInfo[] = [
  {
    id: 'haifa',
    hebrewName: 'חיפה והצפון',
    englishName: 'HAIFA',
    regionLabel: 'מישור החוף הצפוני והכרמל',
    hubTitle: 'נדל"ן בצפון',
    subtitle: 'דירה להשקעה וקבוצת רכישה. התשואה לפי מדד מחירי הדירות הארצי, ועוד שכירות.',
    stageLabel: 'שלב 2: נדל"ן',
    color: '#f59e0b',
    position: [-10, 0, -34],
    size: [13, 13, 11],
    entryPos: [-10, 0, -26],
  },
  {
    id: 'telaviv',
    hebrewName: 'תל אביב וגוש דן',
    englishName: 'TEL AVIV',
    regionLabel: 'מישור החוף המרכזי',
    hubTitle: 'הבורסה לניירות ערך',
    subtitle: 'קרן מחקת מדד ת"א-125 מול מניה בודדת.',
    stageLabel: 'שלב 3: שוק ההון',
    color: '#3b82f6',
    position: [-18, 0, -4],
    size: [13, 19, 11],
    entryPos: [-10.5, 0, -4],
  },
  {
    id: 'jerusalem',
    hebrewName: 'ירושלים',
    englishName: 'JERUSALEM',
    regionLabel: 'הרי יהודה',
    hubTitle: 'בנק ישראל וחיסכון',
    subtitle: 'פיקדון בבנק. התשואה תלויה בריבית של בנק ישראל.',
    stageLabel: 'שלב 1: חיסכון',
    color: '#10b981',
    position: [15, 0, 3],
    size: [14, 12, 12],
    entryPos: [7, 0, 3],
  },
  {
    id: 'beersheva',
    hebrewName: 'באר שבע והנגב',
    englishName: "BE'ER SHEVA",
    regionLabel: 'הנגב',
    hubTitle: 'שותפות אזורית',
    subtitle: 'קואופרטיב סולארי בדוי, להמחשת השקעה משותפת בפיתוח אזורי.',
    stageLabel: 'העשרה: שותפויות',
    color: '#a855f7',
    position: [-4, 0, 34],
    size: [14, 11, 11],
    entryPos: [-4, 0, 26],
  },
];

export interface ProductOption {
  id: string;
  name: string;
  region: string;
  category: Category;
  assetKey: AssetKey;
  riskLevel: RiskLevel;
  description: string;
  howItEarns: string;
  fictional?: boolean;
  partners?: string[];
  /** Bought with a down payment and (optionally) a mortgage. */
  mortgage?: boolean;
}

/** One product per TASE sector index (real past data). */
const SECTOR_PRODUCT: Record<'sectorBanks' | 'sectorTech' | 'sectorEnergy' | 'sectorRealEstate', ProductOption> = {
  sectorBanks: {
    id: 'tlv-banks',
    name: 'ענף הבנקים (מדד ת"א-בנקים5)',
    region: 'תל אביב',
    category: 'index',
    assetKey: 'sectorBanks',
    riskLevel: 'גבוה',
    description: 'חמשת הבנקים הגדולים. כשהריבית עולה הבנקים מרוויחים לרוב יותר, אבל במשבר הם נפגעים. ענף אחד = פחות פיזור.',
    howItEarns: 'שינוי מדד ת"א-בנקים5 באותה שנה',
  },
  sectorTech: {
    id: 'tlv-tech',
    name: 'ענף הטכנולוגיה (מדד ת"א-טכנולוגיה)',
    region: 'תל אביב',
    category: 'index',
    assetKey: 'sectorTech',
    riskLevel: 'גבוה',
    description: 'חברות הייטק ותוכנה. יכולות לצמוח מהר, ולרדת חזק כשהריבית עולה.',
    howItEarns: 'שינוי מדד ת"א-טכנולוגיה באותה שנה',
  },
  sectorEnergy: {
    id: 'tlv-energy',
    name: 'ענף האנרגיה (מדד ת"א-נפט וגז)',
    region: 'תל אביב',
    category: 'index',
    assetKey: 'sectorEnergy',
    riskLevel: 'גבוה',
    description: 'חברות ושותפויות גז ונפט. תלויות מאוד במחירי האנרגיה בעולם, ולכן קופצות למעלה ולמטה.',
    howItEarns: 'שינוי מדד ת"א-נפט וגז באותה שנה',
  },
  sectorRealEstate: {
    id: 'tlv-realestate',
    name: 'ענף הנדל"ן בבורסה (מדד ת"א-נדל"ן)',
    region: 'תל אביב',
    category: 'index',
    assetKey: 'sectorRealEstate',
    riskLevel: 'גבוה',
    description: 'מניות של חברות נדל"ן (קניונים, משרדים, בנייה). זו לא דירה: אפשר לקנות ולמכור בכל יום, אבל המחיר זז הרבה.',
    howItEarns: 'שינוי מדד ת"א-נדל"ן באותה שנה',
  },
};

export const HUB_PRODUCTS: Record<CityHubId, ProductOption[]> = {
  jerusalem: [
    {
      id: 'jlm-deposit',
      name: 'פיקדון בנקאי',
      region: 'ירושלים',
      category: 'bank',
      assetKey: 'deposit',
      riskLevel: 'נמוך',
      description: 'כסף שמופקד בבנק ומרוויח ריבית. הקרן לא יורדת, אבל כשהאינפלציה גבוהה מהריבית, כוח הקנייה נשחק.',
      howItEarns: 'בערך הריבית הממוצעת של בנק ישראל באותה שנה',
    },
    {
      id: 'jlm-cpi',
      name: 'פיקדון צמוד למדד',
      region: 'ירושלים',
      category: 'bank',
      assetKey: 'cpiLinked',
      riskLevel: 'נמוך',
      description: 'פיקדון שהערך שלו עולה יחד עם מדד המחירים לצרכן. הוא שומר על כוח הקנייה, אבל כשהאינפלציה נמוכה הוא כמעט לא מרוויח.',
      howItEarns: 'שינוי מדד המחירים לצרכן באותה שנה (פישוט: בלי ריבית נוספת)',
    },
  ],
  haifa: [
    {
      id: 'haifa-apartment',
      name: 'דירה להשקעה בצפון',
      region: 'חיפה והצפון',
      category: 'realestate',
      assetKey: 'housingRent',
      riskLevel: 'בינוני',
      description: 'קונים דירה עם הון עצמי, ואפשר לקחת משכנתא על עד 50% ממחיר הדירה. השכירות נכנסת לכסף הפנוי, וההחזר החודשי יוצא ממנו. קשה למכור דירה מהר (נזילות נמוכה).',
      howItEarns: 'שינוי מדד מחירי הדירות + שכירות 3% בשנה (הנחה), פחות ריבית המשכנתא',
      mortgage: true,
    },
    {
      id: 'haifa-group',
      name: 'קבוצת רכישה עם שותפים',
      region: 'חיפה והצפון',
      category: 'realestate',
      assetKey: 'housing',
      riskLevel: 'גבוה',
      description: 'כמה שותפים קונים יחד קרקע או דירות. אפשר להיכנס עם פחות כסף, אבל יש סיכונים: עיכובים בבנייה ותלות בשותפים.',
      howItEarns: 'מדד מחירי הדירות הארצי, בלי שכירות (הדירה עוד בבנייה)',
      partners: ['מאיה', 'עומר', 'נועה'],
    },
  ],
  telaviv: [
    ...(['sectorBanks', 'sectorTech', 'sectorEnergy', 'sectorRealEstate'] as const).map((key) => SECTOR_PRODUCT[key]),
    {
      id: 'tlv-ta125',
      name: 'קרן מחקת מדד ת"א-125',
      region: 'תל אביב',
      category: 'index',
      assetKey: 'ta125',
      riskLevel: 'בינוני',
      description: 'קרן שמשקיעה ב-125 החברות הגדולות בבורסה בתל אביב. יש שנים של ירידות, אבל הפיזור מקטין את הסיכון של חברה אחת.',
      howItEarns: 'התשואה השנתית האמיתית של מדד ת"א-125',
    },
    {
      id: 'tlv-single',
      name: 'מניה בודדת: "נובה-טק"',
      region: 'תל אביב',
      category: 'stock',
      assetKey: 'fictionalStock',
      riskLevel: 'גבוה',
      fictional: true,
      description: 'חברת טכנולוגיה בדויה. התשואות שלה מומצאות ונועדו להראות כמה מניה אחת יכולה לקפוץ ולצנוח.',
      howItEarns: 'תשואות בדויות להמחשה, עם תנודות חדות',
    },
  ],
  beersheva: [],
};

const COMMON_MISSIONS: Mission[] = [
  {
    id: 'm4',
    title: 'ללמוד מהתוצאות',
    regionHint: 'יומן ההחלטות',
    description: 'כתבו "מה למדתי" על שתי החלטות לפחות, אחרי שהשנה שלהן הסתיימה.',
    completed: false,
  },
  {
    id: 'm5',
    title: 'חוסכים מהמשכורת',
    regionHint: 'עבודה בקיץ',
    description: 'עבדו בקיץ, וחסכו לפחות חצי מהמשכורת בתיק.',
    completed: false,
  },
];
const STAGE_MISSIONS: Record<StageNum, Mission[]> = {
  1: [
    { id: 's1a', title: 'כרית ביטחון', regionHint: 'הבנק בירושלים', description: 'החזיקו לפחות 10,000 ₪ בפיקדון.', completed: false },
    { id: 's1b', title: 'מגינים מאינפלציה', regionHint: 'הבנק בירושלים', description: 'החזיקו גם פיקדון רגיל וגם פיקדון צמוד למדד באותו זמן.', completed: false },
  ],
  2: [
    { id: 's2a', title: 'אופק ארוך', regionHint: 'הבורסה בתל אביב', description: 'החזיקו קרן מחקת מדד לפחות שלוש שנים ברציפות.', completed: false },
    { id: 's2c', title: 'פיזור בין ענפים', regionHint: 'אגפי הבורסה', description: 'החזיקו לפחות שלושה ענפים שונים באותו זמן (או קרן מדד ועוד שני ענפים).', completed: false },
    { id: 's2b', title: 'בלי לשים הכול על מניה אחת', regionHint: 'הבורסה בתל אביב', description: 'סיימו שנה עם השקעה במדד, כשהמניה הבודדת היא פחות מ-35% מהתיק.', completed: false },
  ],
  3: [
    { id: 's3a', title: 'דירה ראשונה להשקעה', regionHint: 'משרד התיווך בחיפה', description: 'קנו דירה להשקעה.', completed: false },
    { id: 's3b', title: 'נזילות', regionHint: 'הכסף הפנוי', description: 'סיימו שנה עם השקעה בנדל"ן, ועם לפחות 10% מהתיק בכסף פנוי.', completed: false },
  ],
};
/** Why a city cannot be entered in the current stage. */
export function lockedMessage(id: CityHubId, stage: StageNum): string {
  const st = cityStage(id);
  if (st === null) return 'בבאר שבע יש רק עבודת קיץ. הדוכן הירוק נמצא ליד הכניסה לעיר.';
  if (st > stage) return `${stageInfo(st).name} נפתח בשלב ${st}. המורה פותח את השלבים.`;
  return `${stageInfo(st).name} כבר הסתיים. עכשיו אתם ב${stageInfo(stage).name}.`;
}

const stageMissions = (n: StageNum): Mission[] => [...STAGE_MISSIONS[n], ...COMMON_MISSIONS];

export interface Job {
  id: string;
  city: CityHubId;
  title: string;
  description: string;
  task: string;
  pay: number;
  /** Where the player walks to during the job, in world coordinates [x, z]. */
  targets: Array<[number, number]>;
  /** The job stand in the city, where the job starts [x, z]. */
  stand: [number, number];
  /** Who waits at each stop, and what the player does there. */
  stopLabel: string;
  action: string;
  boxColor: string;
}

/** One summer job per year. Pay is an illustrative figure for a teen's summer job. */
export const JOBS: Job[] = [
  {
    id: 'job-icecream',
    city: 'telaviv',
    title: 'משלוחים מהגלידרייה בטיילת',
    description: 'עבודת קיץ בגלידרייה ליד חוף תל אביב.',
    task: 'הביאו 3 משלוחים לנקודות על הטיילת',
    pay: 3000,
    targets: [[-20, -16], [-21, 6], [-12, 10]],
    stand: [-8.5, -8.5],
    stopLabel: 'לקוח מחכה לגלידה',
    action: 'מוסרים את הגלידה',
    boxColor: '#f472b6',
  },
  {
    id: 'job-camp',
    city: 'jerusalem',
    title: 'מדריך/ה בקייטנה',
    description: 'הדרכה בקייטנת קיץ בירושלים.',
    task: 'אספו את 3 קבוצות הילדים מהנקודות המסומנות',
    pay: 3200,
    targets: [[6, 14], [20, -6], [12, -8]],
    stand: [8.5, 7.5],
    stopLabel: 'קבוצת ילדים',
    action: 'מדריכים את הקבוצה',
    boxColor: '#22c55e',
  },
  {
    id: 'job-flyers',
    city: 'haifa',
    title: 'חלוקת עלונים בשכונה',
    description: 'חלוקת עלונים לעסק שכונתי בחיפה.',
    task: 'חלקו עלונים ב-3 רחובות',
    pay: 2600,
    targets: [[-16, -24], [0, -30], [-2, -40]],
    stand: [-5.5, -24.5],
    stopLabel: 'תיבות דואר',
    action: 'מחלקים עלונים',
    boxColor: '#e2e8f0',
  },
  {
    id: 'job-tutor',
    city: 'beersheva',
    title: 'שיעורים פרטיים במתמטיקה',
    description: 'עזרה לתלמידי חטיבת ביניים בבאר שבע.',
    task: 'לכו ל-3 תלמידים ותנו שיעור',
    pay: 3400,
    targets: [[-14, 26], [6, 22], [-14, 37]],
    stand: [0.5, 25],
    stopLabel: 'תלמיד מחכה לשיעור',
    action: 'מלמדים מתמטיקה',
    boxColor: '#60a5fa',
  },
];

export interface ActiveJob {
  jobId: string;
  done: number;
}

/** True when this browser can draw 3D (WebGL). */
export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function readLitePref(): boolean {
  if (!hasWebGL()) return true; // no 3D support: start in the light version
  try {
    if (new URLSearchParams(window.location.search).get('lite') === '1') return true;
    return window.localStorage.getItem('tiktov-lite') === '1';
  } catch {
    return false;
  }
}

function writeLitePref(on: boolean) {
  try {
    window.localStorage.setItem('tiktov-lite', on ? '1' : '0');
  } catch {
    /* storage unavailable: keep the choice for this visit only */
  }
}

function readFlag(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function writeFlag(key: string, on: boolean) {
  try {
    window.localStorage.setItem(key, on ? '1' : '0');
  } catch {
    /* storage unavailable */
  }
}

function readTutorialSeen(): boolean {
  try {
    return window.localStorage.getItem('tiktov-tutorial-seen') === '1';
  } catch {
    return false;
  }
}

function writeTutorialSeen() {
  try {
    window.localStorage.setItem('tiktov-tutorial-seen', '1');
  } catch {
    /* storage unavailable */
  }
}

function fmt(n: number) {
  return `₪${Math.round(n).toLocaleString('he-IL')}`;
}

function checkMissions(missions: Mission[], holdings: Holding[], journal: JournalEntry[], year: number, cash = 0, yearEnd = false): Mission[] {
  const depositTotal = holdings.filter((h) => h.category === 'bank').reduce((s, h) => s + h.currentValue, 0);
  const keys = new Set(holdings.map((h) => h.assetKey));
  const longIndex = holdings.some((h) => h.category === 'index' && year - h.sinceYear >= 3);
  const reflections = journal.filter((j) => isReasonOk(j.learnedAfter)).length;
  const invested = holdings.reduce((s, h) => s + h.currentValue, 0);
  const net = invested + cash;
  const stockShare = net > 0 ? holdings.filter((h) => h.category === 'stock').reduce((s, h) => s + h.currentValue, 0) / net : 0;
  const hasRealEstate = holdings.some((h) => h.category === 'realestate');
  return missions.map((m) => {
    if (m.completed) return m;
    if (m.id === 's1a' && depositTotal >= 10000) return { ...m, completed: true };
    if (m.id === 's1b' && keys.has('deposit') && keys.has('cpiLinked')) return { ...m, completed: true };
    if (m.id === 's2a' && longIndex) return { ...m, completed: true };
    if (m.id === 's2c' && ['sectorBanks', 'sectorTech', 'sectorEnergy', 'sectorRealEstate', 'ta125'].filter((k) => keys.has(k as AssetKey)).length >= 3) return { ...m, completed: true };
    if (m.id === 's2b' && yearEnd && keys.has('ta125') && stockShare < 0.35) return { ...m, completed: true };
    if (m.id === 's3a' && keys.has('housingRent')) return { ...m, completed: true };
    if (m.id === 's3b' && yearEnd && hasRealEstate && net > 0 && cash / net >= 0.1) return { ...m, completed: true };
    if (m.id === 'm4' && reflections >= 2) return { ...m, completed: true };
    if (m.id === 'm5' && journal.some((j) => j.category === 'עבודה' && j.amount >= 0.5 * (j.payTotal ?? Infinity)))
      return { ...m, completed: true };
    return m;
  });
}

type TikTab = 'bag' | 'mix' | 'missions' | 'journal' | 'rubric';

interface GameState {
  /** Current stage (world) and its starting budget. */
  stage: StageNum;
  startCash: number;
  /** Results of stages that the class already finished. */
  stageResults: Array<{ stage: StageNum; startCash: number; netWorth: number; realValue: number; score: number; slices?: Slice[] }>;
  /** Portfolio mix at the end of each finished year of the current stage. */
  snapshots: Array<{ year: number; slices: Slice[] }>;
  stageIntroOpen: boolean;
  setStageIntroOpen: (open: boolean) => void;
  /** Teacher only: save this stage's result and open the next world. */
  startNextStage: () => void;
  /** Move to any stage; each stage keeps its own progress. */
  goToStage: (n: StageNum) => void;
  stageSaves: Partial<Record<StageNum, Record<string, unknown>>>;
  cash: number;
  /** The year in which students are currently deciding. LAST_YEAR + 1 means the game is over. */
  year: number;
  interestRate: number;
  /** Price level relative to the start of the game (1 = start), to show purchasing power. */
  priceLevel: number;
  holdings: Holding[];
  journal: JournalEntry[];
  missions: Mission[];
  currentEvent: YearEvent | null;
  eventHistory: YearEvent[];
  activeYears: number[];
  activeJob: ActiveJob | null;
  /** Year in which the last summer job was finished (one job per year). */
  jobYear: number | null;
  /** A finished job waiting for the budget decision. */
  paycheck: { jobId: string; pay: number } | null;

  playerPos: [number, number, number];
  playerRot: number;
  nearbyHub: CityHubId | null;
  /** Job stand the player is standing at. */
  nearbyJob: string | null;
  jobsOpen: boolean;
  /** A train ride in progress (3D mode): the track to follow, and a job to start on arrival. */
  trainRide: { to: CityHubId; path: Array<[number, number]>; thenJob?: string } | null;
  /** The building the player is inside (3D mode), or null when outside. */
  interior: CityHubId | null;
  nearbyStation: string | null;
  /** Click/tap-to-walk destination [x, z]. */
  moveTarget: [number, number] | null;
  setMoveTarget: (t: [number, number] | null) => void;
  setOrchardMode: (holdingId: string, mode: 'replant' | 'pick') => void;
  /** An info station whose panel is open. */
  stationInfo: string | null;

  liteMode: boolean;
  /** Extra visual effects for strong computers. */
  highGraphics: boolean;
  openHub: CityHubId | null;
  tikOpen: boolean;
  trainOpen: boolean;
  infoOpen: boolean;
  shareOpen: boolean;
  classBoardOpen: boolean;
  presentMode: boolean;
  setShareOpen: (open: boolean) => void;
  setClassBoardOpen: (open: boolean) => void;
  setPresentMode: (on: boolean) => void;
  tutorialOpen: boolean;
  /** Bird's-eye view of the whole map. */
  overview: boolean;
  tikTab: TikTab;
  toastMessage: string | null;

  setPlayerTransform: (pos: [number, number, number], rot: number) => void;
  setNearby: (hub: CityHubId | null) => void;
  setNearbyJob: (id: string | null) => void;
  setJobsOpen: (open: boolean) => void;
  startTrainRide: (to: CityHubId, thenJob?: string) => void;
  finishTrainRide: () => void;
  enterBuilding: (id: CityHubId) => void;
  exitBuilding: () => void;
  setNearbyStation: (id: string | null) => void;
  setStationInfo: (id: string | null) => void;
  setOpenHub: (id: CityHubId | null) => void;
  setTikOpen: (open: boolean, tab?: TikTab) => void;
  setTikTab: (tab: TikTab) => void;
  setTrainOpen: (open: boolean) => void;
  setInfoOpen: (open: boolean) => void;
  setTutorialOpen: (open: boolean) => void;
  setOverview: (on: boolean) => void;
  setLiteMode: (on: boolean) => void;
  setHighGraphics: (on: boolean) => void;
  travelTo: (id: CityHubId) => void;
  clearToast: () => void;

  investAction: (product: ProductOption, amount: number, thoughtBefore: string, ltv?: number) => boolean;
  sellHolding: (holdingId: string, thoughtBefore: string) => boolean;
  addReflection: (entryId: string, text: string) => void;
  advanceYear: () => void;
  startJob: (jobId: string) => void;
  cancelJob: () => void;
  reachJobTarget: () => void;
  finishJobNow: (jobId: string) => void;
  cashPaycheck: (saved: number, note: string) => void;
  resetGame: () => void;

  isGameOver: () => boolean;
  getNetWorth: () => number;
  getCurrentRegionName: () => string;
  getRubric: () => RubricBreakdown;
}

/** Game fields that belong to one stage and are kept when moving between stages. */
const STAGE_SAVE_KEYS = ['startCash', 'cash', 'year', 'interestRate', 'priceLevel', 'holdings', 'journal', 'missions', 'currentEvent', 'eventHistory', 'activeYears', 'snapshots', 'jobYear'] as const;

const initialGame = (stage: StageNum = 1) => ({
  stage,
  startCash: stageInfo(stage).budget,
  cash: stageInfo(stage).budget,
  year: FIRST_YEAR,
  interestRate: START_RATE,
  priceLevel: 1,
  holdings: [] as Holding[],
  journal: [] as JournalEntry[],
  missions: stageMissions(stage),
  currentEvent: null as YearEvent | null,
  eventHistory: [] as YearEvent[],
  activeYears: [] as number[],
  snapshots: [] as Array<{ year: number; slices: Slice[] }>,
  activeJob: null as ActiveJob | null,
  jobYear: null as number | null,
  paycheck: null as { jobId: string; pay: number } | null,
  playerPos: [-6, 0, -4] as [number, number, number],
  playerRot: 0,
  nearbyHub: null as CityHubId | null,
  nearbyJob: null as string | null,
  jobsOpen: false,
  trainRide: null as { to: CityHubId; path: Array<[number, number]>; thenJob?: string } | null,
  interior: null as CityHubId | null,
  nearbyStation: null as string | null,
  moveTarget: null as [number, number] | null,
  stationInfo: null as string | null,
  openHub: null as CityHubId | null,
  tikOpen: false,
  trainOpen: false,
  infoOpen: false,
  tutorialOpen: !readTutorialSeen(),
  overview: false,
  tikTab: 'bag' as TikTab,
  toastMessage: null as string | null,
});

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
  ...initialGame(1),
  stageResults: [] as GameState['stageResults'],
  stageSaves: {} as GameState['stageSaves'],
  stageIntroOpen: false,
  liteMode: readLitePref(),
  highGraphics: readFlag('tiktov-hq'),

  setPlayerTransform: (pos, rot) => set({ playerPos: pos, playerRot: rot }),
  setNearby: (hub) => {
    if (get().nearbyHub !== hub) set({ nearbyHub: hub });
  },
  setNearbyJob: (id) => {
    if (get().nearbyJob !== id) set({ nearbyJob: id });
  },
  setJobsOpen: (open) => set({ jobsOpen: open, openHub: null, tikOpen: false, trainOpen: false }),
  startTrainRide: (to, thenJob) => {
    const s = get();
    const [px, , pz] = s.playerPos;
    const from = nearestStation(px, pz);
    if (from === to) {
      s.travelTo(to);
      if (thenJob) s.startJob(thenJob);
      set({ trainOpen: false, jobsOpen: false });
      return;
    }
    set({ trainRide: { to, path: railPath(from, to), thenJob }, trainOpen: false, jobsOpen: false, overview: false });
  },
  enterBuilding: (id) => {
    const hub = CITY_HUBS.find((h) => h.id === id)!;
    const st = cityStage(id);
    if (st !== get().stage) {
      set({ toastMessage: lockedMessage(id, get().stage) });
      return;
    }
    set({ moveTarget: null, interior: id, playerPos: [0, 0, 3.4], playerRot: Math.PI, overview: false, openHub: null, nearbyHub: null, nearbyJob: null, toastMessage: `נכנסתם: ${hub.hubTitle}` });
  },
  exitBuilding: () => {
    const id = get().interior;
    if (!id) return;
    const hub = CITY_HUBS.find((h) => h.id === id)!;
    const [ex, , ez] = hub.entryPos;
    const [cx, , cz] = hub.position;
    // Stand on the entry pad, facing away from the building
    set({ moveTarget: null, interior: null, nearbyStation: null, stationInfo: null, openHub: null, playerPos: [ex, 0, ez], playerRot: Math.atan2(ex - cx, ez - cz) });
  },
  setNearbyStation: (id) => {
    if (get().nearbyStation !== id) set({ nearbyStation: id });
  },
  setStationInfo: (id) => set({ stationInfo: id }),
  setMoveTarget: (t) => set({ moveTarget: t }),
  setOrchardMode: (id, mode) =>
    set((s) => ({
      holdings: s.holdings.map((h) => (h.id === id && h.orchard ? { ...h, orchard: { ...h.orchard, mode } } : h)),
      toastMessage: mode === 'replant' ? 'הפירות יישתלו מחדש: העץ יגדל וייתן יותר פירות (ריבית דריבית).' : 'הפירות ייקטפו בסוף כל שנה ויעברו לכסף הפנוי. העץ יישאר באותו גודל.',
    })),
  finishTrainRide: () => {
    const ride = get().trainRide;
    if (!ride) return;
    set({ trainRide: null });
    get().travelTo(ride.to);
    if (ride.thenJob) get().startJob(ride.thenJob);
  },
  setOpenHub: (id) => {
    if (id && cityStage(id) !== get().stage) {
      set({ toastMessage: lockedMessage(id, get().stage) });
      return;
    }
    set((s) => ({ openHub: id, tikOpen: id ? false : s.tikOpen, trainOpen: false }));
  },
  setTikOpen: (open, tab) =>
    set((s) => ({ tikOpen: open, tikTab: tab ?? s.tikTab, openHub: open ? null : s.openHub, trainOpen: false })),
  setTikTab: (tab) => set({ tikTab: tab }),
  setTrainOpen: (open) => set({ trainOpen: open, openHub: null, tikOpen: false }),
  setInfoOpen: (open) => set({ infoOpen: open }),
  shareOpen: false,
  classBoardOpen: false,
  presentMode: readFlag('tiktov-present'),
  setShareOpen: (open) => set({ shareOpen: open, tikOpen: open ? false : get().tikOpen }),
  setClassBoardOpen: (open) => set({ classBoardOpen: open, infoOpen: false }),
  setPresentMode: (on) => {
    writeFlag('tiktov-present', on);
    set({ presentMode: on });
  },
  setOverview: (on) => set({ overview: on }),
  setTutorialOpen: (open) => {
    if (!open) writeTutorialSeen();
    const s = get();
    // After the first tutorial, introduce the current stage
    set({ tutorialOpen: open, stageIntroOpen: !open && s.tutorialOpen && s.journal.length === 0 ? true : s.stageIntroOpen });
  },
  setLiteMode: (on) => {
    writeLitePref(on);
    set({ liteMode: on });
  },
  setHighGraphics: (on) => {
    writeFlag('tiktov-hq', on);
    set({ highGraphics: on });
  },
  travelTo: (id) => {
    const hub = CITY_HUBS.find((h) => h.id === id)!;
    set({
      playerPos: [hub.entryPos[0], 0, hub.entryPos[2]],
      moveTarget: null,
      trainOpen: false,
      toastMessage: `🚆 הגעתם ל${hub.hebrewName}`,
    });
  },
  clearToast: () => set({ toastMessage: null }),

  investAction: (product, amount, thoughtBefore, ltv = 0) => {
    const s = get();
    if (s.isGameOver()) return false;
    const city = (Object.keys(HUB_PRODUCTS) as CityHubId[]).find((c) => HUB_PRODUCTS[c].some((p) => p.id === product.id));
    if (!city || cityStage(city) !== s.stage) {
      set({ toastMessage: 'האפיק הזה לא שייך לשלב הנוכחי.' });
      return false;
    }
    if (!isReasonOk(thoughtBefore)) {
      set({ toastMessage: 'אין החלטה בלי הנמקה: כתבו לפחות משפט אחד ביומן ההחלטות.' });
      return false;
    }
    if (amount <= 0 || amount > s.cash) {
      set({ toastMessage: 'אין מספיק כסף פנוי בתיק לסכום הזה.' });
      return false;
    }

    const existing = s.holdings.find((h) => h.id === product.id);
    let mortgage: Holding['mortgage'];
    if (product.mortgage) {
      if (existing) {
        set({ toastMessage: 'בשלב הזה קונים דירה אחת להשקעה. אפשר למכור אותה ולקנות אחרת.' });
        return false;
      }
      const share = Math.min(MAX_LTV_INVESTMENT, Math.max(0, ltv));
      const price = Math.round(amount / (1 - share));
      mortgage = { propertyValue: price, loan: price - amount, yearsLeft: MORTGAGE_YEARS };
    }
    const holdings: Holding[] = existing
      ? s.holdings.map((h) =>
          h.id === product.id ? { ...h, invested: h.invested + amount, currentValue: h.currentValue + amount } : h
        )
      : [
          ...s.holdings,
          {
            id: product.id,
            name: product.name,
            region: product.region,
            category: product.category,
            assetKey: product.assetKey,
            invested: amount,
            currentValue: amount,
            sinceYear: s.year,
            riskLevel: product.riskLevel,
            fictional: product.fictional,
            partners: product.partners,
            mortgage,
            orchard: product.category === 'bank' ? { mode: 'replant', lastFruit: 0, lastRealPositive: true, pickedTotal: 0 } : undefined,
          },
        ];

    const entry: JournalEntry = {
      id: `j-${Date.now()}`,
      year: s.year,
      holdingId: product.id,
      actionTitle: mortgage && mortgage.loan > 0
        ? `קניתי דירה ב-${fmt(mortgage.propertyValue)}: הון עצמי ${fmt(amount)} ומשכנתא ${fmt(mortgage.loan)}`
        : `השקעתי ${fmt(amount)} ב${product.name}`,
      region: product.region,
      category: 'קנייה',
      amount,
      thoughtBefore: thoughtBefore.trim(),
      learnedAfter: '',
    };

    const journal = [entry, ...s.journal];
    const total = holdings.reduce((sum, h) => sum + h.currentValue, 0) + s.cash - amount;
    const big = holdings.find((h) => h.currentValue / total > 0.35 && h.riskLevel === 'גבוה');

    set({
      cash: s.cash - amount,
      holdings,
      journal,
      missions: checkMissions(s.missions, holdings, journal, s.year),
      activeYears: s.activeYears.includes(s.year) ? s.activeYears : [...s.activeYears, s.year],
      toastMessage: big
        ? `שימו לב: יותר מ-35% מהתיק נמצא ב"${big.name}", נכס בסיכון גבוה. זה מוריד את ציון הפיזור.`
        : `נוסף לתיק: ${product.name}`,
    });
    return true;
  },

  sellHolding: (holdingId, thoughtBefore) => {
    const s = get();
    if (s.isGameOver()) return false;
    const target = s.holdings.find((h) => h.id === holdingId);
    if (!target) return false;
    if (!isReasonOk(thoughtBefore)) {
      set({ toastMessage: 'גם מכירה צריכה הנמקה: כתבו ביומן למה אתם מוכרים.' });
      return false;
    }
    const proceeds = Math.round(target.currentValue);
    const delta = proceeds - target.invested;
    const entry: JournalEntry = {
      id: `j-${Date.now()}`,
      year: s.year,
      actionTitle: `מכרתי את ${target.name} תמורת ${fmt(proceeds)}`,
      region: target.region,
      category: 'מכירה',
      amount: proceeds,
      thoughtBefore: thoughtBefore.trim(),
      learnedAfter: '',
      outcomeNote:
        delta >= 0
          ? `רווח של ${fmt(delta)} לעומת הסכום שהושקע.`
          : `הפסד של ${fmt(Math.abs(delta))} לעומת הסכום שהושקע.`,
      outcomeDelta: delta,
    };
    const holdings = s.holdings.filter((h) => h.id !== holdingId);
    const journal = [entry, ...s.journal];
    set({
      cash: s.cash + proceeds,
      holdings,
      journal,
      activeYears: s.activeYears.includes(s.year) ? s.activeYears : [...s.activeYears, s.year],
      toastMessage: `מכרתם את ${target.name}. ${fmt(proceeds)} חזרו לכסף הפנוי.`,
    });
    return true;
  },

  addReflection: (entryId, text) => {
    const s = get();
    const journal = s.journal.map((j) => (j.id === entryId ? { ...j, learnedAfter: text.trim() } : j));
    set({
      journal,
      missions: checkMissions(s.missions, s.holdings, journal, s.year),
      activeYears: s.activeYears.includes(s.year) ? s.activeYears : [...s.activeYears, s.year],
      toastMessage: 'הרפלקציה נשמרה ביומן.',
    });
  },

  advanceYear: () => {
    const s = get();
    if (s.isGameOver()) return;
    const data = yearData(s.year);
    if (!data) return;

    // Apartments: value follows the housing index, rent comes in as cash, the mortgage payment goes out
    let cashFlow = 0;
    const holdings = s.holdings.map((h) => {
      if (h.orchard) {
        // Savings tree: the year's interest is the fruit. Replant = compound interest, pick = to free cash.
        const fruit = Math.round((h.currentValue * data.returns[h.assetKey]) / 100);
        const realPositive = data.returns[h.assetKey] > data.cpi;
        if (h.orchard.mode === 'pick') {
          cashFlow += fruit;
          return { ...h, orchard: { ...h.orchard, lastFruit: fruit, lastRealPositive: realPositive, pickedTotal: h.orchard.pickedTotal + fruit } };
        }
        return { ...h, currentValue: h.currentValue + fruit, orchard: { ...h.orchard, lastFruit: fruit, lastRealPositive: realPositive } };
      }
      if (!h.mortgage) return { ...h, currentValue: Math.max(0, Math.round(h.currentValue * (1 + data.returns[h.assetKey] / 100))) };
      const m = h.mortgage;
      const rent = Math.round((m.propertyValue * RENT_YIELD) / 100);
      const payment = Math.round(annualPayment(m.loan, data.mortgageRate, m.yearsLeft));
      const interest = Math.round((m.loan * data.mortgageRate) / 100);
      const loan = Math.max(0, m.loan - (payment - interest));
      const propertyValue = Math.round(m.propertyValue * (1 + data.returns.housing / 100));
      cashFlow += rent - payment;
      return {
        ...h,
        currentValue: propertyValue - loan,
        mortgage: { propertyValue, loan, yearsLeft: Math.max(0, m.yearsLeft - 1), lastRent: rent, lastPayment: payment },
      };
    });
    const newCash = s.cash + cashFlow;

    const journal = s.journal.map((j) => {
      if (j.year !== s.year || j.category !== 'קנייה' || j.outcomeNote) return j;
      const holding = s.holdings.find((h) => h.id === j.holdingId);
      if (!holding) return j;
      const after = holdings.find((h) => h.id === holding.id);
      if (holding.mortgage && after?.mortgage) {
        const m = after.mortgage;
        return {
          ...j,
          outcomeNote: `בסוף ${s.year}: מחירי הדירות ${data.returns.housing >= 0 ? 'עלו' : 'ירדו'} ב-${Math.abs(data.returns.housing)}%. שווי הדירה ${fmt(m.propertyValue)}, יתרת המשכנתא ${fmt(m.loan)}. קיבלתם שכירות ${fmt(m.lastRent ?? 0)} ושילמתם ${fmt(m.lastPayment ?? 0)} למשכנתא (ריבית ${data.mortgageRate}%). ההון העצמי שלכם בדירה: ${fmt(after.currentValue)}.`,
        };
      }
      const r = data.returns[holding.assetKey];
      return {
        ...j,
        outcomeNote: `בסוף ${s.year}: ${holding.name} ${r >= 0 ? 'עלה' : 'ירד'} ב-${Math.abs(r).toFixed(1)}%. האינפלציה באותה שנה: ${data.cpi}%.`,
      };
    });

    const event: YearEvent = { year: data.year, headline: data.headline, detail: data.detail };
    const nextYear = s.year + 1;
    const over = s.year >= LAST_YEAR;

    set({
      year: nextYear,
      cash: newCash,
      interestRate: data.boiRateEnd,
      priceLevel: s.priceLevel * (1 + data.cpi / 100),
      holdings,
      journal,
      missions: checkMissions(s.missions, holdings, journal, nextYear, newCash, true),
      snapshots: [...s.snapshots, { year: s.year, slices: composition(Math.max(0, newCash), holdings) }],
      currentEvent: event,
      eventHistory: s.currentEvent ? [s.currentEvent, ...s.eventHistory] : s.eventHistory,
      toastMessage: over ? (s.stage < 3 ? `${stageInfo(s.stage).name} הסתיים! פתחו את התיק לסיכום. המורה יפתח את השלב הבא.` : 'המשחק הסתיים! פתחו את התיק לסיכום של שלושת השלבים.') : newCash < 0
        ? `עברנו ל-${nextYear}. שימו לב: החזרי המשכנתא גדולים מהשכירות, והכסף הפנוי ירד מתחת לאפס (${fmt(newCash)}). זה סיכון של מינוף.`
        : `עברנו ל-${nextYear}. ${data.headline}`,
    });
  },

  startJob: (jobId) => {
    const s = get();
    if (s.isGameOver() || s.activeJob || s.jobYear === s.year) return;
    const job = JOBS.find((j) => j.id === jobId)!;
    set({ activeJob: { jobId, done: 0 }, openHub: null, jobsOpen: false, toastMessage: `התחלתם לעבוד! ${job.task}. לכו לעמוד האור הצהוב.` });
  },
  cancelJob: () => set({ activeJob: null, toastMessage: 'עזבתם את העבודה. אפשר לחזור אליה מאוחר יותר השנה.' }),
  reachJobTarget: () => {
    const s = get();
    if (!s.activeJob) return;
    const job = JOBS.find((j) => j.id === s.activeJob!.jobId)!;
    const done = s.activeJob.done + 1;
    if (done >= job.targets.length) {
      set({ activeJob: null, jobYear: s.year, paycheck: { jobId: job.id, pay: job.pay } });
    } else {
      const lessons = [
        'כל עצירה מוסיפה לשכר. הכנסה מעבודה היא הבסיס לחיסכון ולהשקעה.',
        'בתלוש שכר אמיתי יש ברוטו (לפני ניכויים) ונטו (מה שנכנס לחשבון).',
      ];
      set({ activeJob: { ...s.activeJob, done }, toastMessage: `${job.action} (${done}/${job.targets.length}). ${lessons[(done - 1) % lessons.length]}` });
    }
  },
  finishJobNow: (jobId) => {
    const s = get();
    if (s.isGameOver() || s.jobYear === s.year) return;
    const job = JOBS.find((j) => j.id === jobId)!;
    set({ activeJob: null, jobYear: s.year, paycheck: { jobId, pay: job.pay }, openHub: null, jobsOpen: false });
  },
  cashPaycheck: (saved, note) => {
    const s = get();
    if (!s.paycheck) return;
    const job = JOBS.find((j) => j.id === s.paycheck!.jobId)!;
    const pay = s.paycheck.pay;
    const keep = Math.max(0, Math.min(pay, Math.round(saved)));
    const entry: JournalEntry = {
      id: `j-${Date.now()}`,
      year: s.year,
      actionTitle: `עבדתי (${job.title}) והרווחתי ${fmt(pay)}. חסכתי ${fmt(keep)} והוצאתי ${fmt(pay - keep)}.`,
      region: CITY_HUBS.find((h) => h.id === job.city)!.hebrewName,
      category: 'עבודה',
      amount: keep,
      payTotal: pay,
      thoughtBefore: note.trim(),
      learnedAfter: '',
    };
    const journal = [entry, ...s.journal];
    set({
      cash: s.cash + keep,
      paycheck: null,
      journal,
      missions: checkMissions(s.missions, s.holdings, journal, s.year),
      activeYears: s.activeYears.includes(s.year) ? s.activeYears : [...s.activeYears, s.year],
      toastMessage: `${fmt(keep)} נכנסו לכסף הפנוי בתיק.`,
    });
  },

  resetGame: () => set((s) => ({ ...initialGame(s.stage), stageIntroOpen: true })),
  setStageIntroOpen: (open) => set({ stageIntroOpen: open }),
  startNextStage: () => {
    const s = get();
    if (s.stage >= 3) return;
    s.goToStage((s.stage + 1) as StageNum);
  },
  goToStage: (n) => {
    const s = get();
    if (n === s.stage) return;
    // Keep the current stage's progress and its result (for the comparison table)
    const saved: Record<string, unknown> = {};
    for (const k of STAGE_SAVE_KEYS) saved[k] = (s as unknown as Record<string, unknown>)[k];
    const netWorth = s.getNetWorth();
    const result = { stage: s.stage, startCash: s.startCash, netWorth, realValue: Math.round(netWorth / s.priceLevel), score: s.getRubric().total, slices: composition(s.cash, s.holdings) };
    const restore = s.stageSaves[n];
    set({
      ...initialGame(n),
      ...(restore ?? {}),
      stage: n,
      stageSaves: { ...s.stageSaves, [s.stage]: saved },
      stageResults: [...s.stageResults.filter((r) => r.stage !== s.stage && r.stage !== n), result],
      stageIntroOpen: !restore,
      infoOpen: false,
      tikOpen: false,
      openHub: null,
      toastMessage: restore ? `חזרתם ל${stageInfo(n).name}. ההתקדמות שלכם נשמרה.` : null,
    });
  },

  isGameOver: () => get().year > LAST_YEAR,

  getNetWorth: () => {
    const s = get();
    return s.cash + s.holdings.reduce((sum, h) => sum + h.currentValue, 0);
  },

  getCurrentRegionName: () => {
    const [x, , z] = get().playerPos;
    if (z < -18) return 'חיפה והצפון';
    if (z > 18) return 'באר שבע והנגב';
    if (x > 4) return 'ירושלים';
    return 'תל אביב וגוש דן';
  },

  getRubric: () => {
    const s = get();
    const invested = s.holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const netWorth = s.cash + invested;

    const written = s.journal.filter((j) => isReasonOk(j.thoughtBefore));
    const reasoning = Math.min(
      30,
      written.reduce((pts, j) => {
        const rich = j.thoughtBefore.length >= 60 || CONCEPT_WORDS.some((w) => j.thoughtBefore.includes(w));
        return pts + (rich ? 6 : 3);
      }, 0)
    );

    // Spread inside the stage: different products, plus some free cash as a reserve
    const kinds = new Set(s.holdings.map((h) => h.assetKey)).size;
    const reserve = netWorth > 0 && s.cash / netWorth >= 0.1 && s.holdings.length > 0;
    let diversification = Math.min(20, kinds * 7 + (reserve ? 6 : 0));
    const overloaded = s.holdings.some((h) => netWorth > 0 && h.currentValue / netWorth > 0.35 && h.riskLevel === 'גבוה');
    if (overloaded) diversification = Math.max(0, diversification - 10);

    const realGrowth = (netWorth / s.priceLevel / s.startCash - 1) * 100;
    let riskAdjusted = Math.round(10 + realGrowth * 0.4);
    if (overloaded) riskAdjusted -= 5;
    riskAdjusted = Math.max(0, Math.min(20, riskAdjusted));
    if (s.holdings.length === 0 && s.journal.length === 0) riskAdjusted = 0;

    const reflections = s.journal.filter((j) => isReasonOk(j.learnedAfter)).length;
    const learning = Math.min(15, reflections * 5);

    const consistency = Math.min(15, s.activeYears.length * 2);

    return {
      reasoning,
      diversification,
      riskAdjusted,
      learning,
      consistency,
      total: reasoning + diversification + riskAdjusted + learning + consistency,
    };
  },
}),
    {
      name: 'tiktov-game-v2',
      // Progress stays only on this device (browser storage). Nothing is sent anywhere.
      storage: createJSONStorage(() => {
        try {
          return window.localStorage;
        } catch {
          return undefined as unknown as Storage;
        }
      }),
      partialize: (s) => ({
        cash: s.cash,
        year: s.year,
        interestRate: s.interestRate,
        priceLevel: s.priceLevel,
        holdings: s.holdings,
        journal: s.journal,
        missions: s.missions,
        currentEvent: s.currentEvent,
        eventHistory: s.eventHistory,
        activeYears: s.activeYears,
        activeJob: s.activeJob,
        jobYear: s.jobYear,
        paycheck: s.paycheck,
        stage: s.stage,
        startCash: s.startCash,
        stageResults: s.stageResults,
        stageSaves: s.stageSaves,
        snapshots: s.snapshots,
      }),
    }
  )
);
