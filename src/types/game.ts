export type CityHubId = 'jerusalem' | 'haifa' | 'telaviv' | 'beersheva';

export interface CityHubInfo {
  id: CityHubId;
  cityName: string;
  hebrewName: string;
  regionLabel: string;
  hubTitle: string;
  subtitle: string;
  stageLabel: string;
  color: string;
  position: [number, number, number];
  size: [number, number, number];
  entryPos: [number, number, number];
}

export interface Holding {
  id: string;
  name: string;
  region: string;
  category: 'bank' | 'realestate' | 'index' | 'stock' | 'coop';
  invested: number;
  currentValue: number;
  monthlyYieldRate: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  isGroupOrCoop?: boolean;
  partners?: string[];
}

export interface JournalEntry {
  id: string;
  month: number;
  actionTitle: string;
  region: string;
  category: string;
  amount: number;
  thoughtBefore: string;
  learnedAfter: string;
  outcomeDelta?: number;
}

export interface MacroEvent {
  id: string;
  month: number;
  originCity: string;
  headline: string;
  detail: string;
  impactType: 'rate_hike' | 'rate_cut' | 'market_dip' | 'north_housing' | 'negev_solar';
}

export interface Mission {
  id: string;
  title: string;
  regionHint: string;
  description: string;
  rewardCash: number;
  rewardRep: number;
  completed: boolean;
}

export interface CarState {
  id: string;
  name: string;
  color: string;
  x: number;
  z: number;
  rotation: number;
}

export interface RubricBreakdown {
  reasoning: number;       // max 30
  diversification: number; // max 20
  riskAdjusted: number;    // max 20
  learning: number;        // max 15
  consistency: number;     // max 15
  total: number;           // max 100
}
