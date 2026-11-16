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
import { AssetKey, FIRST_YEAR, LAST_YEAR, START_RATE, yearData } from '../data/history';

export const START_CASH = 50000;
export const MIN_REASONING_CHARS = 15;
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
}

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
  ],
  haifa: [
    {
      id: 'haifa-apartment',
      name: 'דירה להשקעה בצפון',
      region: 'חיפה והצפון',
      category: 'realestate',
      assetKey: 'housingRent',
      riskLevel: 'בינוני',
      description: 'שינוי מחירי הדירות ועוד דמי שכירות. בפועל קשה למכור דירה מהר (נזילות נמוכה), ויש הוצאות שלא נכללות כאן.',
      howItEarns: 'מדד מחירי הדירות הארצי + 3% שכירות (הנחה)',
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
  beersheva: [
    {
      id: 'negev-coop',
      name: 'קואופרטיב סולארי בנגב',
      region: 'באר שבע והנגב',
      category: 'coop',
      assetKey: 'fictionalCoop',
      riskLevel: 'בינוני',
      fictional: true,
      partners: ['דן', 'מאיה'],
      description: 'שותפות בדויה בהקמת שדה סולארי. ממחישה השקעה משותפת עם תשואה יציבה יחסית, אבל קשה לצאת ממנה מהר.',
      howItEarns: 'תשואות בדויות להמחשה',
    },
  ],
};

const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm1',
    title: 'כרית ביטחון',
    regionHint: 'ירושלים',
    description: 'החזיקו לפחות 10,000 ₪ בפיקדון בנקאי.',
    completed: false,
  },
  {
    id: 'm2',
    title: 'פיזור',
    regionHint: 'שלוש ערים לפחות',
    description: 'החזיקו בו-זמנית שלושה סוגי נכסים שונים.',
    completed: false,
  },
  {
    id: 'm3',
    title: 'אופק ארוך',
    regionHint: 'תל אביב',
    description: 'החזיקו קרן מחקת מדד לפחות שלוש שנים ברציפות.',
    completed: false,
  },
  {
    id: 'm4',
    title: 'ללמוד מהתוצאות',
    regionHint: 'יומן ההחלטות',
    description: 'כתבו "מה למדתי" על שתי החלטות לפחות, אחרי שהשנה שלהן הסתיימה.',
    completed: false,
  },
];

function readLitePref(): boolean {
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

function checkMissions(missions: Mission[], holdings: Holding[], journal: JournalEntry[], year: number): Mission[] {
  const depositTotal = holdings.filter((h) => h.category === 'bank').reduce((s, h) => s + h.currentValue, 0);
  const kinds = new Set(holdings.map((h) => h.category)).size;
  const longIndex = holdings.some((h) => h.category === 'index' && year - h.sinceYear >= 3);
  const reflections = journal.filter((j) => j.learnedAfter.trim().length >= MIN_REASONING_CHARS).length;
  return missions.map((m) => {
    if (m.completed) return m;
    if (m.id === 'm1' && depositTotal >= 10000) return { ...m, completed: true };
    if (m.id === 'm2' && kinds >= 3) return { ...m, completed: true };
    if (m.id === 'm3' && longIndex) return { ...m, completed: true };
    if (m.id === 'm4' && reflections >= 2) return { ...m, completed: true };
    return m;
  });
}

type TikTab = 'bag' | 'missions' | 'journal' | 'rubric';

interface GameState {
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

  playerPos: [number, number, number];
  playerRot: number;
  nearbyHub: CityHubId | null;

  liteMode: boolean;
  /** Extra visual effects for strong computers. */
  highGraphics: boolean;
  openHub: CityHubId | null;
  tikOpen: boolean;
  trainOpen: boolean;
  infoOpen: boolean;
  tutorialOpen: boolean;
  /** Bird's-eye view of the whole map. */
  overview: boolean;
  tikTab: TikTab;
  toastMessage: string | null;

  setPlayerTransform: (pos: [number, number, number], rot: number) => void;
  setNearby: (hub: CityHubId | null) => void;
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

  investAction: (product: ProductOption, amount: number, thoughtBefore: string) => boolean;
  sellHolding: (holdingId: string, thoughtBefore: string) => boolean;
  addReflection: (entryId: string, text: string) => void;
  advanceYear: () => void;
  resetGame: () => void;

  isGameOver: () => boolean;
  getNetWorth: () => number;
  getCurrentRegionName: () => string;
  getRubric: () => RubricBreakdown;
}

const initialGame = () => ({
  cash: START_CASH,
  year: FIRST_YEAR,
  interestRate: START_RATE,
  priceLevel: 1,
  holdings: [] as Holding[],
  journal: [] as JournalEntry[],
  missions: INITIAL_MISSIONS,
  currentEvent: null as YearEvent | null,
  eventHistory: [] as YearEvent[],
  activeYears: [] as number[],
  playerPos: [-6, 0, -4] as [number, number, number],
  playerRot: 0,
  nearbyHub: null as CityHubId | null,
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
  ...initialGame(),
  liteMode: readLitePref(),
  highGraphics: readFlag('tiktov-hq'),

  setPlayerTransform: (pos, rot) => set({ playerPos: pos, playerRot: rot }),
  setNearby: (hub) => {
    if (get().nearbyHub !== hub) set({ nearbyHub: hub });
  },
  setOpenHub: (id) => set((s) => ({ openHub: id, tikOpen: id ? false : s.tikOpen, trainOpen: false })),
  setTikOpen: (open, tab) =>
    set((s) => ({ tikOpen: open, tikTab: tab ?? s.tikTab, openHub: open ? null : s.openHub, trainOpen: false })),
  setTikTab: (tab) => set({ tikTab: tab }),
  setTrainOpen: (open) => set({ trainOpen: open, openHub: null, tikOpen: false }),
  setInfoOpen: (open) => set({ infoOpen: open }),
  setOverview: (on) => set({ overview: on }),
  setTutorialOpen: (open) => {
    if (!open) writeTutorialSeen();
    set({ tutorialOpen: open });
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
      trainOpen: false,
      toastMessage: `🚆 הגעתם ל${hub.hebrewName}`,
    });
  },
  clearToast: () => set({ toastMessage: null }),

  investAction: (product, amount, thoughtBefore) => {
    const s = get();
    if (s.isGameOver()) return false;
    if (thoughtBefore.trim().length < MIN_REASONING_CHARS) {
      set({ toastMessage: 'אין החלטה בלי הנמקה: כתבו לפחות משפט אחד ביומן ההחלטות.' });
      return false;
    }
    if (amount <= 0 || amount > s.cash) {
      set({ toastMessage: 'אין מספיק כסף פנוי בתיק לסכום הזה.' });
      return false;
    }

    const existing = s.holdings.find((h) => h.id === product.id);
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
          },
        ];

    const entry: JournalEntry = {
      id: `j-${Date.now()}`,
      year: s.year,
      holdingId: product.id,
      actionTitle: `השקעתי ${fmt(amount)} ב${product.name}`,
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
    if (thoughtBefore.trim().length < MIN_REASONING_CHARS) {
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

    const holdings = s.holdings.map((h) => ({
      ...h,
      currentValue: Math.max(0, Math.round(h.currentValue * (1 + data.returns[h.assetKey] / 100))),
    }));

    const journal = s.journal.map((j) => {
      if (j.year !== s.year || j.category !== 'קנייה' || j.outcomeNote) return j;
      const holding = s.holdings.find((h) => h.id === j.holdingId);
      if (!holding) return j;
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
      interestRate: data.boiRateEnd,
      priceLevel: s.priceLevel * (1 + data.cpi / 100),
      holdings,
      journal,
      missions: checkMissions(s.missions, holdings, journal, nextYear),
      currentEvent: event,
      eventHistory: s.currentEvent ? [s.currentEvent, ...s.eventHistory] : s.eventHistory,
      toastMessage: over ? 'המשחק הסתיים! פתחו את התיק לסיכום.' : `עברנו ל-${nextYear}. ${data.headline}`,
    });
  },

  resetGame: () => set({ ...initialGame() }),

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

    const written = s.journal.filter((j) => j.thoughtBefore.length >= MIN_REASONING_CHARS);
    const reasoning = Math.min(
      30,
      written.reduce((pts, j) => {
        const rich = j.thoughtBefore.length >= 60 || CONCEPT_WORDS.some((w) => j.thoughtBefore.includes(w));
        return pts + (rich ? 6 : 3);
      }, 0)
    );

    const kinds = new Set(s.holdings.map((h) => h.category)).size;
    let diversification = Math.min(20, kinds * 5);
    const overloaded = s.holdings.some((h) => netWorth > 0 && h.currentValue / netWorth > 0.35 && h.riskLevel === 'גבוה');
    if (overloaded) diversification = Math.max(0, diversification - 10);

    const realGrowth = (netWorth / s.priceLevel / START_CASH - 1) * 100;
    let riskAdjusted = Math.round(10 + realGrowth * 0.4);
    if (overloaded) riskAdjusted -= 5;
    riskAdjusted = Math.max(0, Math.min(20, riskAdjusted));
    if (s.holdings.length === 0 && s.journal.length === 0) riskAdjusted = 0;

    const reflections = s.journal.filter((j) => j.learnedAfter.trim().length >= MIN_REASONING_CHARS).length;
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
      name: 'tiktov-game-v1',
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
      }),
    }
  )
);
