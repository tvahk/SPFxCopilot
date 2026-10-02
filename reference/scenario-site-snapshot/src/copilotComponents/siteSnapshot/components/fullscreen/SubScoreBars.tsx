/**
 * Site Snapshot - sub-score bars.
 * ===========================================================================
 * Four Fluent ProgressIndicators, one per health factor, so the overall score
 * is explainable and never a black box. Each bar shows points retained out of
 * that factor's weight.
 */

import * as React from 'react';
import { Stack } from '@fluentui/react/lib/Stack';
import { ProgressIndicator } from '@fluentui/react/lib/ProgressIndicator';
import { ISnapshotScore } from '../../models/types';
import { SCORE_WEIGHTS } from '../../models/health';

export interface ISubScoreBarsProps {
  score: ISnapshotScore;
}

export const SubScoreBars: React.FC<ISubScoreBarsProps> = ({ score }) => {
  const rows: { label: string; retained: number; weight: number }[] = [
    { label: 'Storage', retained: score.subScores.storage, weight: SCORE_WEIGHTS.storage },
    { label: 'Freshness', retained: score.subScores.stale, weight: SCORE_WEIGHTS.stale },
    { label: 'Sharing', retained: score.subScores.exposure, weight: SCORE_WEIGHTS.exposure },
    { label: 'Activity', retained: score.subScores.frecency, weight: SCORE_WEIGHTS.frecency },
  ];

  return (
    <Stack tokens={{ childrenGap: 8 }}>
      {rows.map((r) => (
        <ProgressIndicator
          key={r.label}
          label={r.label}
          description={`${r.retained} of ${r.weight}`}
          percentComplete={r.weight > 0 ? r.retained / r.weight : 0}
        />
      ))}
    </Stack>
  );
};
