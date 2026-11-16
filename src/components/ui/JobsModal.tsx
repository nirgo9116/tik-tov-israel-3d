import React from 'react';
import { Briefcase, X } from 'lucide-react';
import { CITY_HUBS, JOBS, useGameStore } from '../../store/gameStore';

const shekel = (n: number) => `₪${Math.round(n).toLocaleString('he-IL')}`;

/** All summer jobs in one place: travel to the city and start working. */
export const JobsModal: React.FC = () => {
  const open = useGameStore((s) => s.jobsOpen);
  const setOpen = useGameStore((s) => s.setJobsOpen);
  const year = useGameStore((s) => s.year);
  const jobYear = useGameStore((s) => s.jobYear);
  const activeJob = useGameStore((s) => s.activeJob);
  const liteMode = useGameStore((s) => s.liteMode);
  const startTrainRide = useGameStore((s) => s.startTrainRide);
  const finishJobNow = useGameStore((s) => s.finishJobNow);
  const cancelJob = useGameStore((s) => s.cancelJob);
  const isGameOver = useGameStore((s) => s.isGameOver);
  if (!open) return null;
  const worked = jobYear === year;
  const over = isGameOver();
  return (
    <div className="modal-backdrop" onClick={() => setOpen(false)}>
      <div className="modal-card" role="dialog" aria-label="עבודות קיץ" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="stage-badge" style={{ backgroundColor: '#16a34a' }}>
              מרוויחים כסף
            </span>
            <h2>
              <Briefcase size={20} className="inline-icon" /> עבודות קיץ
            </h2>
            <p className="modal-sub">
              {liteMode
                ? 'בחרו עבודה ולחצו "לעבוד". אפשר לעבוד פעם אחת בכל שנה.'
                : 'בחרו עבודה. תגיעו לדוכן בעיר, תקבלו חבילה, ותביאו אותה ל-3 אנשים שמחכים. אפשר לעבוד פעם אחת בכל שנה.'}
            </p>
          </div>
          <button className="close-btn" onClick={() => setOpen(false)} aria-label="סגירה">
            <X size={20} />
          </button>
        </div>
        {worked && <p className="job-note">כבר עבדתם ב-{year}. אחרי שהמורה יעביר שנה, אפשר לעבוד שוב.</p>}
        {activeJob && (
          <p className="job-note">
            אתם באמצע עבודה. <button className="btn-mini" onClick={cancelJob}>עזיבת העבודה</button>
          </p>
        )}
        <div className="jobs-grid">
          {JOBS.map((job) => {
            const city = CITY_HUBS.find((h) => h.id === job.city)!;
            return (
              <div key={job.id} className="job-card">
                <div className="job-top">
                  <Briefcase size={16} />
                  <strong>{job.title}</strong>
                  <span className="job-pay">{shekel(job.pay)}</span>
                </div>
                <p>
                  {city.hebrewName}. {job.description} {job.task}.
                </p>
                <button
                  className="btn-invest"
                  disabled={over || worked || Boolean(activeJob)}
                  onClick={() => {
                    if (liteMode) {
                      finishJobNow(job.id);
                    } else {
                      startTrainRide(job.city, job.id);
                    }
                  }}
                >
                  {liteMode ? 'לעבוד' : 'ברכבת לשם, ולהתחיל'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
