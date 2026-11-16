import React from 'react';
import { X, TrainFront } from 'lucide-react';
import { CITY_HUBS, useGameStore } from '../../store/gameStore';

export const TrainModal: React.FC = () => {
  const open = useGameStore((s) => s.trainOpen);
  const setTrainOpen = useGameStore((s) => s.setTrainOpen);
  const travelTo = useGameStore((s) => s.travelTo);
  const startTrainRide = useGameStore((s) => s.startTrainRide);
  const liteMode = useGameStore((s) => s.liteMode);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={() => setTrainOpen(false)}>
      <div className="modal-card train-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <TrainFront size={20} className="inline-icon" /> רכבת ישראל: לאן נוסעים?
          </h2>
          <button className="icon-close" onClick={() => setTrainOpen(false)} aria-label="סגירה">
            <X size={20} />
          </button>
        </div>
        <div className="train-grid">
          {CITY_HUBS.map((hub) => (
            <button key={hub.id} className="train-stop" style={{ borderColor: hub.color }} onClick={() => (liteMode ? travelTo(hub.id) : startTrainRide(hub.id))}>
              <span className="train-dot" style={{ backgroundColor: hub.color }} />
              <strong>{hub.hebrewName}</strong>
              <span>{hub.hubTitle}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
