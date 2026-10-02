/**
 * Site Snapshot - health scoring tests.
 * ===========================================================================
 * The TDD entry point. `computeHealthScore` is pure, so you can test it before
 * any Graph or UI exists. SPFx projects run Jest, so these use the Jest globals
 * (describe / it / expect). Run with your project's test script once scaffolded.
 *
 * Arrange, Act, Assert - one behaviour per test, named for the behaviour.
 */

import { computeHealthScore, SCORE_WEIGHTS } from './health';
import { ISnapshotMetrics } from './types';

/** A perfectly healthy site: empty storage, fresh, nothing shared out. */
const healthyMetrics = (): ISnapshotMetrics => ({
  storageUsedBytes: 0,
  storageTotalBytes: 25 * 1024 ** 3,
  totalDocs: 100,
  staleDocs: 0,
  externalItemCount: 0,
  anyoneLinkCount: 0,
  daysSinceLastActivity: 1,
});

describe('computeHealthScore', () => {
  it('returns 100 and Healthy for a pristine site', () => {
    const result = computeHealthScore(healthyMetrics());

    expect(result.score).toBe(100);
    expect(result.verdict).toBe('Healthy');
  });

  it('penalises storage only after the 70% threshold', () => {
    const under = computeHealthScore({
      ...healthyMetrics(),
      storageUsedBytes: 60,
      storageTotalBytes: 100,
    });
    const over = computeHealthScore({
      ...healthyMetrics(),
      storageUsedBytes: 90,
      storageTotalBytes: 100,
    });

    expect(under.penalties.storage).toBe(0);
    expect(over.penalties.storage).toBeGreaterThan(0);
  });

  it('weighs an Anyone link twice as heavily as an external share', () => {
    const external = computeHealthScore({
      ...healthyMetrics(),
      externalItemCount: 1,
      anyoneLinkCount: 0,
    });
    const anyone = computeHealthScore({
      ...healthyMetrics(),
      externalItemCount: 0,
      anyoneLinkCount: 1,
    });

    expect(anyone.penalties.exposure).toBeCloseTo(external.penalties.exposure * 2, 1);
  });

  it('never drops below zero even when everything is wrong', () => {
    const result = computeHealthScore({
      storageUsedBytes: 100,
      storageTotalBytes: 100,
      totalDocs: 100,
      staleDocs: 100,
      externalItemCount: 50,
      anyoneLinkCount: 50,
      daysSinceLastActivity: 3650,
    });

    expect(result.score).toBe(0);
    expect(result.verdict).toBe('At risk');
  });

  it('keeps each sub-score within its weight', () => {
    const result = computeHealthScore(healthyMetrics());

    expect(result.subScores.storage).toBeLessThanOrEqual(SCORE_WEIGHTS.storage);
    expect(result.subScores.exposure).toBeLessThanOrEqual(SCORE_WEIGHTS.exposure);
  });
});
