/**
 * Site Snapshot - storage bar.
 * ===========================================================================
 * A Fluent ProgressIndicator showing storage used against the quota. Small,
 * focused, presentation-only.
 */

import * as React from 'react';
import { ProgressIndicator } from '@fluentui/react/lib/ProgressIndicator';
import { formatBytes, usedPercent } from '../../utils/formatters';

export interface IStorageBarProps {
  usedBytes: number;
  totalBytes: number;
}

export const StorageBar: React.FC<IStorageBarProps> = ({ usedBytes, totalBytes }) => {
  const pct = usedPercent(usedBytes, totalBytes);
  return (
    <ProgressIndicator
      label="Storage used"
      description={`${formatBytes(usedBytes)} of ${formatBytes(totalBytes)} (${pct}%)`}
      percentComplete={pct / 100}
    />
  );
};
