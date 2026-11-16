import React, { useState } from 'react';
import { X, Users, AlertTriangle, CheckCircle2, MapPin } from 'lucide-react';
import { CITY_HUBS, useGameStore } from '../../store/gameStore';
import { Holding } from '../../types/game';

interface ProductOption {
  id: string;
  name: string;
  region: string;
  category: Holding['category'];
  minAmount: number;
  yieldLabel: string;
  monthlyYieldRate: number;
  riskLevel: Holding['riskLevel'];
  description: string;
  isGroupOrCoop?: boolean;
  partners?: string[];
}

const HUB_PRODUCTS: Record<string, ProductOption[]> = {
  jerusalem: [
    {
      id: 'jlm-savings',
      name: 'Bank of Israel Linked Savings Cushion',
      region: 'Jerusalem',
      category: 'bank',
      minAmount: 10000,
      yieldLabel: '~4.5% Annual (BoI Rate Linked)',
      monthlyYieldRate: 0.0038,
      riskLevel: 'Low',
      description: 'Liquid emergency reserve held in Jerusalem vaults; yield rises when BoI hikes interest rates.',
    },
    {
      id: 'jlm-deposit',
      name: 'National Capital Fixed Deposit (12M)',
      region: 'Jerusalem',
      category: 'bank',
      minAmount: 20000,
      yieldLabel: '~5.2% Annual Fixed',
      monthlyYieldRate: 0.0044,
      riskLevel: 'Low',
      description: 'Locks in steady compounding interest with zero stock-market volatility.',
    },
  ],
  haifa: [
    {
      id: 'haifa-group',
      name: 'Haifa & Galilee Buyer Group (Kvutzat Rechisha)',
      region: 'Haifa & North',
      category: 'realestate',
      minAmount: 25000,
      yieldLabel: '~7.0% Rental + Stability Bonus',
      monthlyYieldRate: 0.0058,
      riskLevel: 'Medium',
      description: 'Pool funds with Maya, Omer & Noa near the Haifa Technion & Port for lower entry prices and a +15% stability bonus.',
      isGroupOrCoop: true,
      partners: ['Maya', 'Omer', 'Noa'],
    },
    {
      id: 'haifa-port-reit',
      name: 'Northern Logistics & Residential Unit',
      region: 'Haifa & North',
      category: 'realestate',
      minAmount: 15000,
      yieldLabel: '~6.0% Northern Rental Yield',
      monthlyYieldRate: 0.005,
      riskLevel: 'Medium',
      description: 'Higher rental-to-price yield than central Tel Aviv, backed by northern maritime industry.',
    },
  ],
  telaviv: [
    {
      id: 'tlv-ta35',
      name: 'TA-35 Blue-Chip Index Fund',
      region: 'Tel Aviv (TASE)',
      category: 'index',
      minAmount: 10000,
      yieldLabel: '~8.0% Historical Avg',
      monthlyYieldRate: 0.0065,
      riskLevel: 'Medium',
      description: 'Broad diversification across Israel’s 35 largest public companies on the Tel Aviv Stock Exchange.',
    },
    {
      id: 'tlv-ta125',
      name: 'TA-125 Diversified Market ETF',
      region: 'Tel Aviv (TASE)',
      category: 'index',
      minAmount: 12000,
      yieldLabel: '~8.5% Historical Avg',
      monthlyYieldRate: 0.007,
      riskLevel: 'Medium',
      description: 'Wide exposure across Israeli finance, real estate, and tech—cushions single-stock dips.',
    },
    {
      id: 'tlv-single',
      name: 'Silicon Wadi Single Tech Stock (Volatile)',
      region: 'Tel Aviv (TASE)',
      category: 'stock',
      minAmount: 15000,
      yieldLabel: 'High Swing (-9% to +12%)',
      monthlyYieldRate: 0.009,
      riskLevel: 'High',
      description: 'Warning: Putting >35% of your Tik in a single stock penalizes your Diversification score.',
    },
  ],
  beersheva: [
    {
      id: 'negev-solar',
      name: 'Negev Solar & Clean-Grid Co-Op',
      region: "Be'er Sheva & Negev",
      category: 'coop',
      minAmount: 15000,
      yieldLabel: '~7.4% + National Dev Boost',
      monthlyYieldRate: 0.0062,
      riskLevel: 'Medium',
      description: 'Co-build desert solar infrastructure with Dan & Maya. Boosts Israel Regional Development & Reputation.',
      isGroupOrCoop: true,
      partners: ['Dan', 'Maya'],
    },
    {
      id: 'negev-cyber',
      name: "Be'er Sheva Cyber Park & Student Housing Co-Op",
      region: "Be'er Sheva & Negev",
      category: 'coop',
      minAmount: 12000,
      yieldLabel: '~6.6% + Reputation Boost',
      monthlyYieldRate: 0.0055,
      riskLevel: 'Medium',
      description: 'Partner with local founders next to Ben-Gurion University to grow southern tech housing.',
      isGroupOrCoop: true,
      partners: ['Omer', 'Noa'],
    },
  ],
};

export const HubModal: React.FC = () => {
  const openHub = useGameStore((s) => s.openHub);
  const cash = useGameStore((s) => s.cash);
  const holdings = useGameStore((s) => s.holdings);
  const setOpenHub = useGameStore((s) => s.setOpenHub);
  const investAction = useGameStore((s) => s.investAction);
  const sellHolding = useGameStore((s) => s.sellHolding);

  const [thought, setThought] = useState('');

  if (!openHub) return null;

  const info = CITY_HUBS.find((h) => h.id === openHub)!;
  const products = HUB_PRODUCTS[openHub] || [];
  const relevantHoldings = holdings.filter((h) => {
    if (openHub === 'jerusalem') return h.category === 'bank';
    if (openHub === 'haifa') return h.category === 'realestate';
    if (openHub === 'telaviv') return h.category === 'index' || h.category === 'stock';
    return h.category === 'coop';
  });

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header" style={{ borderColor: info.color }}>
          <div>
            <span className="stage-badge" style={{ backgroundColor: info.color }}>
              {info.stageLabel} • {info.regionLabel}
            </span>
            <h2>
              <MapPin size={20} className="inline-icon" />
              {info.cityName} ({info.hebrewName}) — {info.hubTitle}
            </h2>
            <p className="modal-sub">{info.subtitle}</p>
          </div>
          <button className="icon-close" onClick={() => setOpenHub(null)}>
            <X size={20} />
          </button>
        </div>

        <div className="journal-prompt-box">
          <label>Decision Journal — "What do you think will happen?" (Earns Reasoning Points in your Tik)</label>
          <input
            type="text"
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            placeholder={`e.g., Investing in ${info.cityName} balances my Tik across Israel's economy...`}
          />
        </div>

        <div className="products-grid">
          {products.map((p) => {
            const canAfford = cash >= p.minAmount;
            return (
              <div key={p.id} className="product-card">
                <div className="product-top">
                  <h3>{p.name}</h3>
                  <span className={`risk-tag risk-${p.riskLevel.toLowerCase()}`}>
                    {p.riskLevel} Risk
                  </span>
                </div>
                <p className="product-desc">{p.description}</p>
                {p.partners && (
                  <div className="partner-row">
                    <Users size={14} /> Partners: {p.partners.join(', ')}
                  </div>
                )}
                {p.riskLevel === 'High' && (
                  <div className="warn-row">
                    <AlertTriangle size={14} /> High concentration reduces anti-gambling score
                  </div>
                )}
                <div className="product-footer">
                  <div>
                    <div className="yield-label">{p.yieldLabel}</div>
                    <div className="amount-label">Pack into Tik: ₪{p.minAmount.toLocaleString()}</div>
                  </div>
                  <button
                    className="btn-invest"
                    disabled={!canAfford}
                    onClick={() => {
                      investAction({
                        id: p.id,
                        name: p.name,
                        region: p.region,
                        category: p.category,
                        amount: p.minAmount,
                        monthlyYieldRate: p.monthlyYieldRate,
                        riskLevel: p.riskLevel,
                        thoughtBefore: thought,
                        isGroupOrCoop: p.isGroupOrCoop,
                        partners: p.partners,
                      });
                      setThought('');
                    }}
                  >
                    {canAfford ? `Pack ₪${p.minAmount.toLocaleString()}` : 'Need More Cash'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {relevantHoldings.length > 0 && (
          <div className="active-positions">
            <h4>Positions Currently Packed in Your Tik from {info.cityName}</h4>
            {relevantHoldings.map((h) => (
              <div key={h.id} className="position-row">
                <div>
                  <CheckCircle2 size={15} className="text-emerald inline-icon" />
                  <strong>{h.name}</strong> — Value: ₪{h.currentValue.toLocaleString()} (Packed ₪
                  {h.invested.toLocaleString()})
                </div>
                <button
                  className="btn-sell"
                  onClick={() => sellHolding(h.id, thought || `Unpacking ${h.name} to rebalance`)}
                >
                  Unpack to Cash
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
