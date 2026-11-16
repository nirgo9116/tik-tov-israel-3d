import React from 'react';
import { X, CheckCircle, Circle, BookOpen, Award, Target, Backpack } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export const TikBagModal: React.FC = () => {
  const tikOpen = useGameStore((s) => s.tikOpen);
  const tikTab = useGameStore((s) => s.tikTab);
  const missions = useGameStore((s) => s.missions);
  const journal = useGameStore((s) => s.journal);
  const holdings = useGameStore((s) => s.holdings);
  const cash = useGameStore((s) => s.cash);
  const setTikOpen = useGameStore((s) => s.setTikOpen);
  const setTikTab = useGameStore((s) => s.setTikTab);
  const getRubric = useGameStore((s) => s.getRubric);

  if (!tikOpen) return null;

  const rubric = getRubric();
  const bagTier =
    rubric.total >= 75
      ? 'Tier 3: Master Gold-Trimmed Executive Tik'
      : rubric.total >= 45
      ? 'Tier 2: Strategist Blue Multi-Pocket Tik'
      : 'Tier 1: Explorer Canvas Starter Tik';

  const hasBank = holdings.some((h) => h.category === 'bank');
  const hasNadlan = holdings.some((h) => h.category === 'realestate');
  const hasTase = holdings.some((h) => h.category === 'index' || h.category === 'stock');
  const hasCoop = holdings.some((h) => h.category === 'coop');

  return (
    <div className="modal-backdrop">
      <div className="tik-bag-container">
        {/* Backpack Top Handle */}
        <div className="tik-handle" />

        <div className="tik-header">
          <div>
            <div className="tik-title">
              <Backpack size={20} className="inline-icon" />
              MY TIK (תיק ההשקעות והמסע שלי)
            </div>
            <div className="tik-tier-badge">{bagTier}</div>
          </div>
          <button className="icon-close" onClick={() => setTikOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* 4 Color-Coded Visual Pockets Status Strip */}
        <div className="pockets-strip">
          <div className={`pocket-pill ${hasBank ? 'lit-green' : ''}`}>
            <span>Jerusalem Vault</span>
            <b>{hasBank ? 'PACKED' : 'EMPTY'}</b>
          </div>
          <div className={`pocket-pill ${hasNadlan ? 'lit-amber' : ''}`}>
            <span>Haifa Nadlan</span>
            <b>{hasNadlan ? 'PACKED' : 'EMPTY'}</b>
          </div>
          <div className={`pocket-pill ${hasTase ? 'lit-blue' : ''}`}>
            <span>TLV Stock Exch</span>
            <b>{hasTase ? 'PACKED' : 'EMPTY'}</b>
          </div>
          <div className={`pocket-pill ${hasCoop ? 'lit-purple' : ''}`}>
            <span>Negev Co-Op</span>
            <b>{hasCoop ? 'PACKED' : 'EMPTY'}</b>
          </div>
        </div>

        <div className="phone-tabs">
          <button
            className={tikTab === 'bag' ? 'active' : ''}
            onClick={() => setTikTab('bag')}
          >
            <Backpack size={14} /> Contents ({holdings.length})
          </button>
          <button
            className={tikTab === 'missions' ? 'active' : ''}
            onClick={() => setTikTab('missions')}
          >
            <Target size={14} /> Missions
          </button>
          <button
            className={tikTab === 'journal' ? 'active' : ''}
            onClick={() => setTikTab('journal')}
          >
            <BookOpen size={14} /> Journal ({journal.length})
          </button>
          <button
            className={tikTab === 'rubric' ? 'active' : ''}
            onClick={() => setTikTab('rubric')}
          >
            <Award size={14} /> {rubric.total}/100
          </button>
        </div>

        <div className="phone-body">
          {tikTab === 'bag' && (
            <div className="phone-section">
              <div className="mini-holding-row" style={{ borderLeft: '4px solid #10b981' }}>
                <span>Liquid Shekel Reserve (Cash Pocket)</span>
                <strong className="text-emerald">₪{cash.toLocaleString()}</strong>
              </div>
              <h4 style={{ fontSize: 13, color: '#94a3b8', margin: '12px 0 8px' }}>
                Regional Deeds & Assets Inside Your Tik
              </h4>
              {holdings.length === 0 ? (
                <p className="text-muted">
                  Your asset pockets are empty! Drive to Jerusalem, Haifa, Tel Aviv, or Be'er Sheva to pack your Tik.
                </p>
              ) : (
                holdings.map((h) => (
                  <div key={h.id} className="mini-holding-row">
                    <div>
                      <div><strong>{h.name}</strong></div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>
                        Region: {h.region} • {h.riskLevel} Risk
                      </div>
                    </div>
                    <strong>₪{h.currentValue.toLocaleString()}</strong>
                  </div>
                ))
              )}
            </div>
          )}

          {tikTab === 'missions' && (
            <div className="phone-section">
              <p className="phone-hint">
                Travel across Israel's four economic regions to upgrade your Tik and build partner reputation.
              </p>
              {missions.map((m) => (
                <div key={m.id} className={`mission-card ${m.completed ? 'done' : ''}`}>
                  <div className="mission-top">
                    {m.completed ? (
                      <CheckCircle size={18} className="text-emerald" />
                    ) : (
                      <Circle size={18} className="text-muted" />
                    )}
                    <strong>{m.title}</strong>
                  </div>
                  <div style={{ fontSize: 11, color: '#38bdf8', marginBottom: 4 }}>
                    Route: {m.regionHint}
                  </div>
                  <p>{m.description}</p>
                  <div className="mission-reward">
                    Reward: +₪{m.rewardCash.toLocaleString()} • +{m.rewardRep} Reputation
                  </div>
                </div>
              ))}
            </div>
          )}

          {tikTab === 'journal' && (
            <div className="phone-section">
              <p className="phone-hint">
                "Winners are decided by good reasoning, not lucky gambling."
              </p>
              {journal.map((entry) => (
                <div key={entry.id} className="journal-card">
                  <div className="journal-meta">
                    <span>Month {entry.month} • {entry.region}</span>
                    <span className="journal-cat">{entry.category}</span>
                  </div>
                  <div className="journal-action">{entry.actionTitle}</div>
                  <div className="journal-q">
                    <b>What I thought:</b> "{entry.thoughtBefore}"
                  </div>
                  <div className="journal-a">
                    <b>What I learned:</b> {entry.learnedAfter}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tikTab === 'rubric' && (
            <div className="phone-section">
              <div className="rubric-hero">
                <div className="rubric-big">{rubric.total} / 100</div>
                <div>Tik Tov Anti-Gambling Mastery Score</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                  Reach 45 pts for Tier 2 Blue Tik • 75 pts for Tier 3 Gold Executive Tik
                </div>
              </div>

              {[
                { label: '1. Reasoning Quality (Journal)', val: rubric.reasoning, max: 30 },
                { label: '2. Diversification & Risk Fit', val: rubric.diversification, max: 20 },
                { label: '3. Risk-Adjusted Return', val: rubric.riskAdjusted, max: 20 },
                { label: '4. Learning & Revision', val: rubric.learning, max: 15 },
                { label: '5. Monthly Consistency', val: rubric.consistency, max: 15 },
              ].map((item, idx) => (
                <div key={idx} className="rubric-row">
                  <div className="rubric-labels">
                    <span>{item.label}</span>
                    <strong>
                      {item.val}/{item.max} pts
                    </strong>
                  </div>
                  <div className="rubric-bar">
                    <div
                      className="rubric-fill"
                      style={{ width: `${(item.val / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
