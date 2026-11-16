import { create } from 'zustand';
import {
  CarState,
  CityHubId,
  CityHubInfo,
  Holding,
  JournalEntry,
  MacroEvent,
  Mission,
  RubricBreakdown,
} from '../types/game';

export const CITY_HUBS: CityHubInfo[] = [
  {
    id: 'haifa',
    cityName: 'HAIFA & THE NORTH',
    hebrewName: 'חיפה והצפון',
    regionLabel: 'Northern Coast & Carmel',
    hubTitle: 'Port Logistics & Buyer Groups',
    subtitle: 'High-Yield Northern Real Estate (Kvutzot Rechisha) & Maritime Trade',
    stageLabel: 'Stage 2 • Northern Real Estate',
    color: '#f59e0b',
    position: [-10, 0, -34],
    size: [13, 13, 11],
    entryPos: [-10, 0, -26],
  },
  {
    id: 'telaviv',
    cityName: 'TEL AVIV & GUSH DAN',
    hebrewName: 'תל אביב וגוש דן',
    regionLabel: 'Central Coastal Plain',
    hubTitle: 'TASE Stock Exchange & Silicon Wadi',
    subtitle: 'TA-35 / TA-125 Indices, Tech Equities & High-Liquidity Center',
    stageLabel: 'Stage 3 • Capital Markets',
    color: '#3b82f6',
    position: [-18, 0, -4],
    size: [13, 19, 11],
    entryPos: [-10.5, 0, -4],
  },
  {
    id: 'jerusalem',
    cityName: 'JERUSALEM',
    hebrewName: 'ירושלים',
    regionLabel: 'Judean Hills • Capital',
    hubTitle: 'Bank of Israel & National Vaults',
    subtitle: 'Monetary Policy Center, Fixed Deposits & Capital Protection',
    stageLabel: 'Stage 1 • Savings & BoI Rates',
    color: '#10b981',
    position: [15, 0, 3],
    size: [14, 12, 12],
    entryPos: [7, 0, 3],
  },
  {
    id: 'beersheva',
    cityName: "BE'ER SHEVA & NEGEV",
    hebrewName: 'באר שבע והנגב',
    regionLabel: 'Southern Growth Frontier',
    hubTitle: 'Negev Clean-Energy & Cyber Co-Op',
    subtitle: 'Solar Infrastructure Partnerships, Cyber Park & Emerging Housing',
    stageLabel: 'Community • Regional Co-Ops',
    color: '#a855f7',
    position: [-4, 0, 34],
    size: [14, 11, 11],
    entryPos: [-4, 0, 26],
  },
];

const INITIAL_CARS: CarState[] = [
  { id: 'car-1', name: 'Route 6 Cruiser', color: '#38bdf8', x: -6, z: -8, rotation: 0 },
  { id: 'car-2', name: 'Judean GT', color: '#f43f5e', x: 3, z: 3, rotation: -Math.PI / 2 },
  { id: 'car-3', name: 'Negev Solar EV', color: '#34d399', x: -5, z: 20, rotation: Math.PI },
];

const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm1',
    title: '1. Jerusalem Capital Buffer',
    regionHint: 'Drive East on Hwy 1 to Jerusalem',
    description: 'Deposit at least ₪15,000 in the Jerusalem Bank Vaults before the next BoI rate decision.',
    rewardCash: 3500,
    rewardRep: 10,
    completed: false,
  },
  {
    id: 'm2',
    title: '2. Galilee-Haifa Buyer Group',
    regionHint: 'Drive North on Route 2 to Haifa',
    description: 'Join a 3-person Real Estate Buyer Group (Kvutzat Rechisha) in Haifa & the North.',
    rewardCash: 5000,
    rewardRep: 20,
    completed: false,
  },
  {
    id: 'm3',
    title: '3. Negev & National Diversification',
    regionHint: 'Connect Center, North & Negev',
    description: 'Hold assets across at least 3 regions/categories in your Tik through a macro news event.',
    rewardCash: 6500,
    rewardRep: 25,
    completed: false,
  },
];

const MACRO_SCENARIOS: Omit<MacroEvent, 'id' | 'month'>[] = [
  {
    originCity: 'JERUSALEM',
    headline: 'JERUSALEM (BoI): Interest Rate Hiked +0.5% to 4.75%',
    detail: 'Jerusalem bank deposits earn higher monthly interest; speculative Tel Aviv single stocks dip -6%.',
    impactType: 'rate_hike',
  },
  {
    originCity: 'TEL AVIV',
    headline: 'TEL AVIV (TASE): Global Tech Pullback (-9% on Single Stocks)',
    detail: 'Diversified TA-35/125 indices cushion the drop (-2.5%), proving why diversification beats gambling.',
    impactType: 'market_dip',
  },
  {
    originCity: 'HAIFA & NORTH',
    headline: 'HAIFA & NORTH: Port Expansion & High Rental Demand (+4.8%)',
    detail: 'Northern residential properties and Haifa Buyer Groups receive a rental & equity boost.',
    impactType: 'north_housing',
  },
  {
    originCity: "BE'ER SHEVA",
    headline: "BE'ER SHEVA & NEGEV: National Solar & Cyber Grid Surge (+4.5%)",
    detail: 'Negev clean-energy Co-Ops and regional growth projects post strong shared returns.',
    impactType: 'negev_solar',
  },
  {
    originCity: 'JERUSALEM',
    headline: 'JERUSALEM (BoI): Rate Cut -0.25% as Inflation Moderates',
    detail: 'Lower financing costs boost real estate across Haifa & Tel Aviv and lift broad TASE indices.',
    impactType: 'rate_cut',
  },
];

interface GameState {
  cash: number;
  month: number;
  monthProgress: number;
  interestRate: number;
  holdings: Holding[];
  journal: JournalEntry[];
  missions: Mission[];
  currentEvent: MacroEvent;
  eventHistory: MacroEvent[];
  personalProsperity: number;
  nationalProsperity: number;
  reputation: number;
  activeCheckInMonths: number[];

  // Player & Vehicle world state
  playerPos: [number, number, number];
  playerRot: number;
  drivingCarId: string | null;
  cars: CarState[];
  nearbyHub: CityHubId | null;
  nearbyCarId: string | null;

  // UI Modals
  openHub: CityHubId | null;
  tikOpen: boolean;
  tikTab: 'bag' | 'missions' | 'journal' | 'rubric';
  toastMessage: string | null;

  // Actions
  setPlayerTransform: (pos: [number, number, number], rot: number) => void;
  updateCarTransform: (carId: string, x: number, z: number, rotation: number) => void;
  setNearby: (hub: CityHubId | null, carId: string | null) => void;
  toggleVehicle: () => void;
  setOpenHub: (id: CityHubId | null) => void;
  setTikOpen: (open: boolean, tab?: 'bag' | 'missions' | 'journal' | 'rubric') => void;
  setTikTab: (tab: 'bag' | 'missions' | 'journal' | 'rubric') => void;
  clearToast: () => void;

  investAction: (params: {
    id: string;
    name: string;
    region: string;
    category: Holding['category'];
    amount: number;
    monthlyYieldRate: number;
    riskLevel: Holding['riskLevel'];
    thoughtBefore: string;
    isGroupOrCoop?: boolean;
    partners?: string[];
  }) => void;

  sellHolding: (holdingId: string, thoughtBefore: string) => void;
  tickTime: (deltaSeconds: number) => void;
  advanceMonth: () => void;
  getNetWorth: () => number;
  getCurrentRegionName: () => string;
  getRubric: () => RubricBreakdown;
}

export const useGameStore = create<GameState>((set, get) => ({
  cash: 65000,
  month: 1,
  monthProgress: 0,
  interestRate: 4.25,
  holdings: [],
  journal: [
    {
      id: 'init-1',
      month: 1,
      actionTitle: 'Packed Starter Tik in Central Israel',
      region: 'Gush Dan',
      category: 'MILESTONE',
      amount: 65000,
      thoughtBefore: 'Instead of gambling on one stock, I will diversify across Israel’s regions and asset types.',
      learnedAfter: 'Starting with ₪65,000 in my Tik. Jerusalem, Haifa, Tel Aviv, and Be’er Sheva each offer different strengths.',
    },
  ],
  missions: INITIAL_MISSIONS,
  currentEvent: {
    id: 'ev-0',
    month: 1,
    originCity: 'JERUSALEM',
    headline: 'BANK OF ISRAEL (JERUSALEM): Policy Rate Holds at 4.25%',
    detail: 'Drive across Israel to pack your Tik (portfolio) with savings, northern real estate, TASE indices & Negev co-ops.',
    impactType: 'rate_cut',
  },
  eventHistory: [],
  personalProsperity: 35,
  nationalProsperity: 30,
  reputation: 50,
  activeCheckInMonths: [1],

  playerPos: [-6, 0, -4],
  playerRot: 0,
  drivingCarId: null,
  cars: INITIAL_CARS,
  nearbyHub: null,
  nearbyCarId: null,

  openHub: null,
  tikOpen: false,
  tikTab: 'bag',
  toastMessage: null,

  setPlayerTransform: (pos, rot) => set({ playerPos: pos, playerRot: rot }),

  updateCarTransform: (carId, x, z, rotation) =>
    set((state) => ({
      cars: state.cars.map((c) => (c.id === carId ? { ...c, x, z, rotation } : c)),
    })),

  setNearby: (hub, carId) => set({ nearbyHub: hub, nearbyCarId: carId }),

  toggleVehicle: () => {
    const { drivingCarId, nearbyCarId, cars } = get();
    if (drivingCarId) {
      const car = cars.find((c) => c.id === drivingCarId);
      const exitX = car ? car.x + Math.cos(car.rotation) * 2.5 : -6;
      const exitZ = car ? car.z - Math.sin(car.rotation) * 2.5 : -4;
      set({
        drivingCarId: null,
        playerPos: [exitX, 0, exitZ],
        toastMessage: 'Exited car — your Tik is back on your shoulders',
      });
    } else if (nearbyCarId) {
      const car = cars.find((c) => c.id === nearbyCarId);
      set({
        drivingCarId: nearbyCarId,
        toastMessage: `Driving ${car?.name ?? 'Car'} (Tik secured on roof rack) — WASD to drive, E to exit`,
      });
    }
  },

  setOpenHub: (id) =>
    set((state) => ({
      openHub: id,
      tikOpen: id ? false : state.tikOpen,
    })),

  setTikOpen: (open, tab) =>
    set((state) => ({
      tikOpen: open,
      tikTab: tab ?? state.tikTab,
      openHub: open ? null : state.openHub,
    })),

  setTikTab: (tab) => set({ tikTab: tab }),

  clearToast: () => set({ toastMessage: null }),

  investAction: ({
    id,
    name,
    region,
    category,
    amount,
    monthlyYieldRate,
    riskLevel,
    thoughtBefore,
    isGroupOrCoop,
    partners,
  }) => {
    const state = get();
    if (amount <= 0 || state.cash < amount) {
      set({ toastMessage: 'Insufficient shekels in your Tik for this move.' });
      return;
    }

    const existing = state.holdings.find((h) => h.id === id);
    let updatedHoldings: Holding[];
    if (existing) {
      updatedHoldings = state.holdings.map((h) =>
        h.id === id
          ? {
              ...h,
              invested: h.invested + amount,
              currentValue: h.currentValue + amount,
            }
          : h
      );
    } else {
      updatedHoldings = [
        ...state.holdings,
        {
          id,
          name,
          region,
          category,
          invested: amount,
          currentValue: amount,
          monthlyYieldRate,
          riskLevel,
          isGroupOrCoop,
          partners,
        },
      ];
    }

    const newJournal: JournalEntry = {
      id: `j-${Date.now()}`,
      month: state.month,
      actionTitle: `Packed ₪${amount.toLocaleString()} in ${name}`,
      region,
      category: category.toUpperCase(),
      amount,
      thoughtBefore: thoughtBefore.trim() || `Allocating capital in ${region} to balance regional growth and stability.`,
      learnedAfter: 'Active in your Tik — outcome updates after the next economic month.',
    };

    const activeMonths = state.activeCheckInMonths.includes(state.month)
      ? state.activeCheckInMonths
      : [...state.activeCheckInMonths, state.month];

    const nationalBoost = isGroupOrCoop ? 12 : category === 'realestate' ? 7 : 3;
    const repBoost = isGroupOrCoop ? 10 : 2;

    const bankTotal = updatedHoldings
      .filter((h) => h.category === 'bank')
      .reduce((sum, h) => sum + h.currentValue, 0);
    const hasNorthGroup = updatedHoldings.some((h) => h.id === 'haifa-group');

    let bonusCash = 0;
    let bonusRep = 0;
    let completedToast: string | null = null;

    const updatedMissions = state.missions.map((m) => {
      if (!m.completed && m.id === 'm1' && bankTotal >= 15000) {
        bonusCash += m.rewardCash;
        bonusRep += m.rewardRep;
        completedToast = `Mission Complete: ${m.title} (+₪${m.rewardCash.toLocaleString()})!`;
        return { ...m, completed: true };
      }
      if (!m.completed && m.id === 'm2' && hasNorthGroup) {
        bonusCash += m.rewardCash;
        bonusRep += m.rewardRep;
        completedToast = `Mission Complete: ${m.title} (+₪${m.rewardCash.toLocaleString()})!`;
        return { ...m, completed: true };
      }
      return m;
    });

    const totalPortfolio = updatedHoldings.reduce((s, h) => s + h.currentValue, 0);
    const singleStock = updatedHoldings.find(
      (h) => h.category === 'stock' && totalPortfolio > 0 && h.currentValue / totalPortfolio > 0.35
    );

    set({
      cash: state.cash - amount + bonusCash,
      holdings: updatedHoldings,
      journal: [newJournal, ...state.journal],
      missions: updatedMissions,
      activeCheckInMonths: activeMonths,
      nationalProsperity: Math.min(100, state.nationalProsperity + nationalBoost),
      reputation: Math.min(100, state.reputation + repBoost + bonusRep),
      toastMessage:
        completedToast ??
        (singleStock
          ? `Tik Alert: >35% in ${singleStock.name} lowers your Diversification score!`
          : `Added ${name} (${region}) to your Tik & Decision Journal!`),
    });
  },

  sellHolding: (holdingId, thoughtBefore) => {
    const state = get();
    const target = state.holdings.find((h) => h.id === holdingId);
    if (!target) return;

    const proceeds = Math.round(target.currentValue);
    const delta = proceeds - target.invested;
    const updatedHoldings = state.holdings.filter((h) => h.id !== holdingId);

    const newJournal: JournalEntry = {
      id: `j-${Date.now()}`,
      month: state.month,
      actionTitle: `Unpacked ${target.name} for ₪${proceeds.toLocaleString()}`,
      region: target.region,
      category: 'EXIT',
      amount: proceeds,
      thoughtBefore: thoughtBefore.trim() || 'Rebalancing regional exposure in my Tik.',
      learnedAfter:
        delta >= 0
          ? `Realized +₪${delta.toLocaleString()} gain through disciplined rebalancing.`
          : `Realized -₪${Math.abs(delta).toLocaleString()}. Reviewing whether selling early hurt long-term compounding.`,
      outcomeDelta: delta,
    };

    set({
      cash: state.cash + proceeds,
      holdings: updatedHoldings,
      journal: [newJournal, ...state.journal],
      toastMessage: `Unpacked ${target.name} (+₪${proceeds.toLocaleString()} cash)`,
    });
  },

  tickTime: (deltaSeconds) => {
    const state = get();
    if (state.openHub || state.tikOpen) return;
    const nextProgress = state.monthProgress + deltaSeconds / 45;
    if (nextProgress >= 1) {
      get().advanceMonth();
    } else {
      set({ monthProgress: nextProgress });
    }
  },

  advanceMonth: () => {
    const state = get();
    const nextMonth = state.month + 1;
    const scenario = MACRO_SCENARIOS[(nextMonth - 2) % MACRO_SCENARIOS.length];
    const newEvent: MacroEvent = {
      id: `ev-${nextMonth}`,
      month: nextMonth,
      ...scenario,
    };

    let nextInterestRate = state.interestRate;
    if (scenario.impactType === 'rate_hike') nextInterestRate = +(state.interestRate + 0.5).toFixed(2);
    if (scenario.impactType === 'rate_cut') nextInterestRate = Math.max(2.0, +(state.interestRate - 0.25).toFixed(2));

    const updatedHoldings = state.holdings.map((h) => {
      let rate = h.monthlyYieldRate;
      if (h.category === 'bank') {
        rate = nextInterestRate / 100 / 12 + 0.002;
      } else if (scenario.impactType === 'rate_hike' && h.category === 'stock') {
        rate -= 0.06;
      } else if (scenario.impactType === 'market_dip') {
        if (h.category === 'stock') rate -= 0.09;
        if (h.category === 'index') rate -= 0.025;
      } else if (scenario.impactType === 'north_housing' && h.category === 'realestate') {
        rate += 0.048;
      } else if (scenario.impactType === 'negev_solar' && (h.category === 'coop' || h.category === 'index')) {
        rate += 0.045;
      }
      if (h.isGroupOrCoop) {
        rate += 0.008;
      }
      return {
        ...h,
        currentValue: Math.max(100, Math.round(h.currentValue * (1 + rate))),
      };
    });

    const updatedJournal = state.journal.map((entry, idx) => {
      if (idx < 3 && entry.learnedAfter.startsWith('Active in your Tik')) {
        return {
          ...entry,
          learnedAfter: `Navigated Month ${nextMonth} (${scenario.originCity}). Regional diversification protected the Tik.`,
        };
      }
      return entry;
    });

    const distinctCategories = new Set(updatedHoldings.map((h) => h.category)).size;
    let bonusCash = 0;
    let bonusRep = 0;
    let missionMsg: string | null = null;

    const updatedMissions = state.missions.map((m) => {
      if (!m.completed && m.id === 'm3' && distinctCategories >= 3) {
        bonusCash += m.rewardCash;
        bonusRep += m.rewardRep;
        missionMsg = `Mission Complete: ${m.title} (+₪${m.rewardCash.toLocaleString()})!`;
        return { ...m, completed: true };
      }
      return m;
    });

    const netWorth =
      state.cash + bonusCash + updatedHoldings.reduce((s, h) => s + h.currentValue, 0);
    const personalProsperity = Math.min(100, Math.round((netWorth / 120000) * 65));

    set({
      month: nextMonth,
      monthProgress: 0,
      interestRate: nextInterestRate,
      cash: state.cash + bonusCash,
      holdings: updatedHoldings,
      journal: updatedJournal,
      missions: updatedMissions,
      currentEvent: newEvent,
      eventHistory: [state.currentEvent, ...state.eventHistory],
      personalProsperity,
      reputation: Math.min(100, state.reputation + bonusRep),
      toastMessage: missionMsg ?? `Month ${nextMonth} • ${scenario.headline}`,
    });
  },

  getNetWorth: () => {
    const state = get();
    return state.cash + state.holdings.reduce((sum, h) => sum + h.currentValue, 0);
  },

  getCurrentRegionName: () => {
    const [x, , z] = get().playerPos;
    if (z < -18) return 'Haifa & The North (חיפה והצפון)';
    if (z > 18) return "Be'er Sheva & Negev (באר שבע והנגב)";
    if (x > 4) return 'Jerusalem & Judean Hills (ירושלים)';
    return 'Tel Aviv & Coastal Plain (תל אביב וגוש דן)';
  },

  getRubric: () => {
    const state = get();
    const totalInvested = state.holdings.reduce((s, h) => s + h.currentValue, 0);
    const categories = new Set(state.holdings.map((h) => h.category)).size;

    const reasoning = Math.min(30, state.journal.length * 6);

    const hasSingleStockOverload = state.holdings.some(
      (h) => h.category === 'stock' && totalInvested > 0 && h.currentValue / totalInvested > 0.35
    );
    let diversification = Math.min(20, categories * 5);
    if (hasSingleStockOverload) diversification = Math.max(4, diversification - 10);

    const netWorth = state.cash + totalInvested;
    const growthPct = ((netWorth - 65000) / 65000) * 100;
    const riskAdjusted = Math.max(5, Math.min(20, Math.round(12 + growthPct * 0.6)));

    const completedLessons = state.journal.filter(
      (j) => !j.learnedAfter.startsWith('Active in your Tik')
    ).length;
    const learning = Math.min(15, completedLessons * 5);

    const consistency = Math.min(15, state.activeCheckInMonths.length * 5);

    return {
      reasoning,
      diversification,
      riskAdjusted,
      learning,
      consistency,
      total: reasoning + diversification + riskAdjusted + learning + consistency,
    };
  },
}));
