import React, { useEffect } from 'react';
import {
  Backpack,
  TrendingUp,
  Users,
  ShieldCheck,
  Radio,
  Car,
  MapPin,
  FastForward,
} from 'lucide-react';
import { CITY_HUBS, useGameStore } from '../../store/gameStore';

export const HUD: React.FC = () => {
  const cash = useGameStore((s) => s.cash);
  const month = useGameStore((s) => s.month);
  const monthProgress = useGameStore((s) => s.monthProgress);
  const interestRate = useGameStore((s) => s.interestRate);
  const personalProsperity = useGameStore((s) => s.personalProsperity);
  const nationalProsperity = useGameStore((s) => s.nationalProsperity);
  const reputation = useGameStore((s) => s.reputation);
  const currentEvent = useGameStore((s) => s.currentEvent);
  const nearbyHub = useGameStore((s) => s.nearbyHub);
  const nearbyCarId = useGameStore((s) => s.nearbyCarId);
  const drivingCarId = useGameStore((s) => s.drivingCarId);
  const playerPos = useGameStore((s) => s.playerPos);
  const toastMessage = useGameStore((s) => s.toastMessage);

  const getNetWorth = useGameStore((s) => s.getNetWorth);
  const getCurrentRegionName = useGameStore((s) => s.getCurrentRegionName);
  const getRubric = useGameStore((s) => s.getRubric);
  const setTikOpen = useGameStore((s) => s.setTikOpen);
  const setOpenHub = useGameStore((s) => s.setOpenHub);
  const toggleVehicle = useGameStore((s) => s.toggleVehicle);
  const advanceMonth = useGameStore((s) => s.advanceMonth);
  const clearToast = useGameStore((s) => s.clearToast);

  const netWorth = getNetWorth();
  const rubric = getRubric();
  const regionName = getCurrentRegionName();
  const activeHubObj = CITY_HUBS.find((h) => h.id === nearbyHub);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => clearToast(), 4500);
    return () => clearTimeout(t);
  }, [toastMessage, clearToast]);

  return (
    <div className="hud-layer">
      {/* Top Status Bar */}
      <div className="hud-topbar">
        <div className="brand-pill">
          <span className="brand-dot" />
          <div>
            <div className="brand-title">TIK TOV: ISRAEL 3D (תיק טוב)</div>
            <div className="brand-sub">
              Month {month} • BoI Rate {interestRate}% • <b>{regionName}</b>
            </div>
          </div>
          <div className="month-bar-wrap" title="Time until next economic month">
            <div className="month-bar-fill" style={{ width: `${monthProgress * 100}%` }} />
          </div>
        </div>

        <div className="stats-group">
          <div className="stat-chip">
            <span className="stat-label">CASH IN TIK</span>
            <span className="stat-val text-emerald">₪{cash.toLocaleString()}</span>
          </div>
          <div className="stat-chip">
            <span className="stat-label">TOTAL TIK VALUE</span>
            <span className="stat-val">₪{netWorth.toLocaleString()}</span>
          </div>
          <div className="stat-chip">
            <span className="stat-label">TIK SCORE</span>
            <span className="stat-val text-amber">{rubric.total}/100</span>
          </div>
        </div>

        <div className="meters-group">
          <div className="meter-item" title="Personal Prosperity">
            <TrendingUp size={14} />
            <span>Personal {personalProsperity}%</span>
          </div>
          <div className="meter-item" title="National Regional Development">
            <Users size={14} />
            <span>Israel Dev {nationalProsperity}%</span>
          </div>
          <div className="meter-item" title="Partner Reputation">
            <ShieldCheck size={14} />
            <span>Rep {reputation}%</span>
          </div>
        </div>
      </div>

      {/* Breaking News Macro Banner */}
      <div className="news-banner">
        <Radio size={16} className="news-icon" />
        <div className="news-text">
          <strong>{currentEvent.headline}</strong> — <span>{currentEvent.detail}</span>
        </div>
        <button className="btn-mini" onClick={advanceMonth} title="Advance 1 Economic Month">
          <FastForward size={14} /> Next Month
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && <div className="toast-pill">{toastMessage}</div>}

      {/* Center-Bottom Context Interaction Prompt */}
      <div className="interaction-prompts">
        {activeHubObj && (
          <button
            className="prompt-btn prompt-landmark"
            onClick={() => setOpenHub(activeHubObj.id)}
          >
            <MapPin size={18} />
            <span>
              Enter <strong>{activeHubObj.cityName}</strong> ({activeHubObj.hubTitle}) — Press <b>Enter</b>
            </span>
          </button>
        )}

        {(nearbyCarId || drivingCarId) && (
          <button className="prompt-btn prompt-car" onClick={toggleVehicle}>
            <Car size={18} />
            <span>
              {drivingCarId ? (
                <>Park & Exit Car (Press <b>E</b>)</>
              ) : (
                <>Drive Car Across Israel (Press <b>E</b>)</>
              )}
            </span>
          </button>
        )}
      </div>

      {/* Bottom Left Israel Map Radar */}
      <div className="minimap-card">
        <div className="minimap-title">MAP OF ISRAEL (N ▲)</div>
        <div className="minimap-box israel-radar">
          {/* Stylized Sea & Land Split */}
          <div className="radar-sea" />
          {CITY_HUBS.map((hub) => {
            const left = ((hub.position[0] + 28) / 56) * 100;
            const top = ((hub.position[2] + 44) / 88) * 100;
            return (
              <div
                key={hub.id}
                className="minimap-dot"
                style={{ left: `${left}%`, top: `${top}%`, backgroundColor: hub.color }}
                title={`${hub.cityName}: ${hub.hubTitle}`}
              />
            );
          })}
          <div
            className="minimap-player"
            style={{
              left: `${((playerPos[0] + 28) / 56) * 100}%`,
              top: `${((playerPos[2] + 44) / 88) * 100}%`,
            }}
          />
        </div>
        <div className="minimap-legend">
          <span style={{ color: '#f59e0b' }}>● Haifa</span>
          <span style={{ color: '#3b82f6' }}>● TLV</span>
          <span style={{ color: '#10b981' }}>● JLM</span>
          <span style={{ color: '#a855f7' }}>● Negev</span>
        </div>
      </div>

      {/* Bottom Right Open-Your-Tik Button & Controls */}
      <div className="bottom-right-actions">
        <div className="controls-hint">
          <b>WASD / Arrows</b> Drive/Walk • <b>E</b> Car • <b>Enter</b> City Hub • <b>P</b> Open Tik
        </div>
        <button className="phone-fab" onClick={() => setTikOpen(true)}>
          <Backpack size={20} />
          <span>Open My Tik / תיק (P)</span>
        </button>
      </div>
    </div>
  );
};
