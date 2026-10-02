/**
 * Site Snapshot - health scoring.
 * ===========================================================================
 * PURE, framework-free, no Graph, no React. Fully usable as-is. Copy it into
 * your solution and unit-test it first (see health.test.ts). It is your TDD
 * entry point for this build.
 *
 * The score is intentionally TRANSPARENT: four weighted penalties off 100,
 * with the weights as named constants so the number is explainable and
 * tunable. Always surface the sub-scores in the UI, never a black box.
 */

import { ISnapshotMetrics, ISnapshotScore } from './types';

/** Tunable weights (the most points each penalty can remove). Keep them visible. */
export const SCORE_WEIGHTS = {
  storage: 20, // storage pressure
  stale: 30, // proportion of stale documents
  exposure: 35, // external and "Anyone" sharing
  frecency: 15, // how long since anything changed
} as const;

/** Thresholds where each penalty begins and saturates. */
export const SCORE_THRESHOLDS = {
  storageStartPct: 70, // storage penalty starts above 70% used
  storageFullPct: 100, // and saturates at 100%
  staleFullPct: 50, // stale penalty saturates when half the docs are stale
  exposureFullCount: 20, // exposure penalty saturates at 20 weighted items
  frecencyStartDays: 90, // frecency penalty starts after 90 idle days
  frecencyFullDays: 365, // and saturates at one idle year
  anyoneLinkWeight: 2, // "Anyone" links count double toward exposure
} as const;

/** Clamp a number into a range. */
const clamp = (n: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, n));

/** Linear ramp from 0 at `start` to 1 at `full`. */
const ramp = (value: number, start: number, full: number): number => {
  if (full === start) return value >= full ? 1 : 0;
  return clamp((value - start) / (full - start), 0, 1);
};

const round1 = (n: number): number => Math.round(n * 10) / 10;

/**
 * Compute the transparent health score. Pure function: same input, same
 * output. Everything the UI needs to explain the number is returned.
 */
export function computeHealthScore(m: ISnapshotMetrics): ISnapshotScore {
  const t = SCORE_THRESHOLDS;
  const w = SCORE_WEIGHTS;

  // storage pressure
  const usedPct =
    m.storageTotalBytes > 0
      ? (m.storageUsedBytes / m.storageTotalBytes) * 100
      : 0;
  const storagePenalty =
    ramp(usedPct, t.storageStartPct, t.storageFullPct) * w.storage;

  // staleness
  const stalePct = m.totalDocs > 0 ? (m.staleDocs / m.totalDocs) * 100 : 0;
  const stalePenalty = ramp(stalePct, 0, t.staleFullPct) * w.stale;

  // external exposure ("Anyone" links weigh double)
  const weightedExposure =
    m.externalItemCount + m.anyoneLinkCount * t.anyoneLinkWeight;
  const exposurePenalty =
    ramp(weightedExposure, 0, t.exposureFullCount) * w.exposure;

  // frecency (idle time)
  const frecencyPenalty =
    ramp(m.daysSinceLastActivity, t.frecencyStartDays, t.frecencyFullDays) *
    w.frecency;

  const score = clamp(
    Math.round(100 - storagePenalty - stalePenalty - exposurePenalty - frecencyPenalty),
    0,
    100
  );

  return {
    score,
    verdict: score >= 80 ? 'Healthy' : score >= 55 ? 'Watch' : 'At risk',
    subScores: {
      storage: round1(w.storage - storagePenalty),
      stale: round1(w.stale - stalePenalty),
      exposure: round1(w.exposure - exposurePenalty),
      frecency: round1(w.frecency - frecencyPenalty),
    },
    penalties: {
      storage: round1(storagePenalty),
      stale: round1(stalePenalty),
      exposure: round1(exposurePenalty),
      frecency: round1(frecencyPenalty),
    },
  };
}
