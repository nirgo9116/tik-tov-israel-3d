import type { RubricBreakdown, JournalEntry } from '../types/game';
import type { Slice } from './composition';

/**
 * Results a student chooses to share with the teacher. Built on the student's device and passed on
 * as a text code (no network, no server). Only a nickname, never a real name.
 */
export interface ShareResult {
  v: 1;
  nick: string;
  stage: 1 | 2 | 3;
  year: number;
  startCash: number;
  netWorth: number;
  realChangePct: number;
  rubric: RubricBreakdown;
  slices: Array<Pick<Slice, 'key' | 'label' | 'value' | 'color'>>;
  missionsDone: number;
  missionsTotal: number;
  decision?: { year: number; title: string; thought: string; learned: string; outcome: string };
}

const PREFIX = 'TIKTOV1:';

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(code: string): string {
  const b64 = code.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

export function buildShareCode(r: Omit<ShareResult, 'v'>): string {
  const safe: ShareResult = {
    ...r,
    v: 1,
    nick: clip(r.nick.trim(), 20),
    decision: r.decision
      ? {
          year: r.decision.year,
          title: clip(r.decision.title, 120),
          thought: clip(r.decision.thought, 400),
          learned: clip(r.decision.learned, 400),
          outcome: clip(r.decision.outcome, 300),
        }
      : undefined,
  };
  return PREFIX + toBase64Url(JSON.stringify(safe));
}

/** Reads every results code found in a block of text (one or many, pasted together). */
export function parseShareCodes(text: string): ShareResult[] {
  const out: ShareResult[] = [];
  const re = /TIKTOV1:([A-Za-z0-9_-]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    try {
      const r = JSON.parse(fromBase64Url(m[1])) as ShareResult;
      if (r && r.v === 1 && typeof r.netWorth === 'number' && r.rubric && typeof r.rubric.total === 'number') {
        r.nick = String(r.nick ?? '').slice(0, 20);
        out.push(r);
      }
    } catch {
      // not a valid code: skip it
    }
  }
  return out;
}

export function decisionFromEntry(j: JournalEntry) {
  return { year: j.year, title: j.actionTitle, thought: j.thoughtBefore, learned: j.learnedAfter, outcome: j.outcomeNote ?? '' };
}
