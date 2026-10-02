/**
 * Site Snapshot - score ring.
 * ===========================================================================
 * A dependency-free ring built with a CSS conic-gradient. The fill percentage
 * is passed as a CSS custom property, which is the one place inline style is
 * appropriate (a data-driven variable, not styling).
 *
 * Prefer a chart? Swap this for @pnp/spfx-controls-react ChartControl (a Chart.js
 * doughnut), lazy-imported so Chart.js is not in the initial bundle:
 *   const { ChartControl } = await import('@pnp/spfx-controls-react/lib/ChartControl');
 */

import * as React from 'react';
import { Text } from '@fluentui/react/lib/Text';
import styles from './Dashboard.module.scss';

export interface IScoreRingProps {
  score: number; // 0 to 100
  verdictClassName: string;
}

export const ScoreRing: React.FC<IScoreRingProps> = ({ score, verdictClassName }) => {
  // CSS variable drives the conic-gradient fill; not styling, just a value.
  const ringStyle = { ['--pct' as string]: `${score}` } as React.CSSProperties;
  return (
    <div className={`${styles.ring} ${verdictClassName}`} style={ringStyle}>
      <div className={styles.ringInner}>
        <Text variant="xxLarge">{score}</Text>
      </div>
    </div>
  );
};
