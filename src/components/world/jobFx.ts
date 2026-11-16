/** Shared, per-frame state for the job "hand over" animation (not React state, so it is cheap). */
export const jobFx = {
  /** Clock time when the current hand-over ends; 0 when idle. */
  busyUntil: 0,
  startedAt: 0,
  from: [0, 0] as [number, number],
  to: [0, 0] as [number, number],
  /** Money shown floating above the stop, in shekels. */
  earned: 0,
  /** Show the floating "+₪" until this clock time. */
  coinUntil: 0,
};
export const HANDOVER_SECONDS = 1.6;
