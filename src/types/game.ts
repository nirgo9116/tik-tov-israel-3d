import type { AssetKey } from '../data/history';

export type CityHubId = 'jerusalem' | 'haifa' | 'telaviv' | 'beersheva';

export interface CityHubInfo {
  id: CityHubId;
  hebrewName: string;
  englishName: string;
  regionLabel: string;
  hubTitle: string;
  subtitle: string;
  stageLabel: string;
  color: string;
  position: [number, number, number];
  size: [number, number, number];
  entryPos: [number, number, number];
}

export type Category = 'bank' | 'realestate' | 'index' | 'stock' | 'coop';
export type RiskLevel = 'נמוך' | 'בינוני' | 'גבוה';

export interface Holding {
  id: string;
  name: string;
  region: string;
  category: Category;
  assetKey: AssetKey;
  invested: number;
  currentValue: number;
  /** Year in which this holding was first bought. */
  sinceYear: number;
  riskLevel: RiskLevel;
  fictional?: boolean;
  partners?: string[];
  /** Apartment bought with a down payment and a mortgage. currentValue = propertyValue - loan (equity). */
  mortgage?: { propertyValue: number; loan: number; yearsLeft: number; lastRent?: number; lastPayment?: number };
  /** Savings shown as a fruit tree: each year's interest is the fruit. */
  orchard?: { mode: 'replant' | 'pick'; lastFruit: number; lastRealPositive: boolean; pickedTotal: number };
}

export interface JournalEntry {
  id: string;
  year: number;
  holdingId?: string;
  actionTitle: string;
  region: string;
  category: string;
  amount: number;
  /** For work entries: the full pay before the spend/save split. */
  payTotal?: number;
  /** What the student wrote before deciding (required, at least MIN_REASONING_CHARS). */
  thoughtBefore: string;
  /** The student's own reflection after the year ended. Empty until written. */
  learnedAfter: string;
  /** What actually happened to this holding in the year after the decision (system note). */
  outcomeNote?: string;
  outcomeDelta?: number;
}

export interface YearEvent {
  year: number;
  headline: string;
  detail: string;
}

export interface Mission {
  id: string;
  title: string;
  regionHint: string;
  description: string;
  completed: boolean;
}

export interface RubricBreakdown {
  reasoning: number; // max 30
  diversification: number; // max 20
  riskAdjusted: number; // max 20
  learning: number; // max 15
  consistency: number; // max 15
  total: number; // max 100
}
