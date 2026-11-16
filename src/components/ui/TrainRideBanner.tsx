import React from 'react';
import { TrainFront } from 'lucide-react';
import { CITY_HUBS, JOBS, useGameStore } from '../../store/gameStore';

/** While riding the train: where you are going, what you can do there, and a note about transport costs. */
export const TrainRideBanner: React.FC = () => {
  const ride = useGameStore((s) => s.trainRide);
  if (!ride) return null;
  const hub = CITY_HUBS.find((h) => h.id === ride.to)!;
  const job = ride.thenJob ? JOBS.find((j) => j.id === ride.thenJob) : undefined;
  return (
    <div className="ride-banner" role="status">
      <div className="ride-title">
        <TrainFront size={18} /> בדרך ל{hub.hebrewName}
      </div>
      <p>
        <b>{hub.stageLabel}: {hub.hubTitle}.</b> {hub.subtitle}
      </p>
      {job && <p>בהגעה מתחילים לעבוד: {job.title}.</p>}
      <p className="ride-note">
        למה רכבת? רכב פרטי עולה כסף גם כשהוא חונה: ביטוח, טסט, טיפולים ודלק, והוא מאבד מערכו כל שנה (פחת). תחבורה ציבורית היא חלק מתכנון תקציב.
      </p>
    </div>
  );
};
