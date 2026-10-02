/**
 * Site Snapshot - inline score card.
 * ===========================================================================
 * The compact, glanceable view shown inside the Copilot conversation. One
 * headline number and one clear action. Built from Fluent UI so it matches the
 * Microsoft look; layout via the SCSS module.
 */

import * as React from 'react';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { ProgressIndicator } from '@fluentui/react/lib/ProgressIndicator';

import styles from './ScoreCard.module.scss';
import { ISiteSnapshot } from '../../models/types';
import { BUTTON_STYLES } from '../../models/colors';
import { formatBytes, usedPercent } from '../../utils/formatters';

export interface IScoreCardProps {
  snapshot: ISiteSnapshot;
  onOpen: () => void;
}

/** Map a verdict to its SCSS modifier class so colors stay in the stylesheet. */
const verdictClass: Record<string, string> = {
  Healthy: styles.healthy,
  Watch: styles.watch,
  'At risk': styles.atRisk,
};

export const ScoreCard: React.FC<IScoreCardProps> = ({ snapshot, onOpen }) => {
  const { score, verdict } = snapshot.score;
  const usedPct = usedPercent(snapshot.storageUsedBytes, snapshot.storageTotalBytes);

  return (
    <Stack tokens={{ childrenGap: 10 }}>
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 10 }}>
        <span className={`${styles.scoreBadge} ${verdictClass[verdict]}`}>{score}</span>
        <Stack>
          <Text variant="mediumPlus" className={styles.siteName}>
            {snapshot.siteName}
          </Text>
          <Text variant="small">Health {verdict}</Text>
        </Stack>
      </Stack>

      <ProgressIndicator
        label="Storage used"
        description={`${formatBytes(snapshot.storageUsedBytes)} of ${formatBytes(snapshot.storageTotalBytes)}`}
        percentComplete={usedPct / 100}
      />

      <Stack horizontal tokens={{ childrenGap: 16 }}>
        <Text variant="small">{snapshot.detail.staleDocs.length} stale</Text>
        <Text variant="small">{snapshot.detail.externalShares.length} external shares</Text>
      </Stack>

      <PrimaryButton text="Open breakdown" onClick={onOpen} styles={BUTTON_STYLES} />
    </Stack>
  );
};
