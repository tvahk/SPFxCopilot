/**
 * Site Snapshot - fullscreen dashboard.
 * ===========================================================================
 * The full app the agent opens. Fluent CommandBar for the actions, a score ring
 * and sub-score bars so the number is explainable, and a Pivot over the three
 * detail panels. Presentation only: export is pure client-side, and email is
 * handed up to the parent, which owns the data source.
 */

import * as React from 'react';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { CommandBar, ICommandBarItemProps } from '@fluentui/react/lib/CommandBar';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { Pivot, PivotItem } from '@fluentui/react/lib/Pivot';

import styles from './Dashboard.module.scss';
import { ScoreRing } from './ScoreRing';
import { StorageBar } from './StorageBar';
import { SubScoreBars } from './SubScoreBars';
import { DetailPanel } from './DetailPanel';
import { ISiteSnapshot } from '../../models/types';
import { formatDate } from '../../utils/formatters';
import { exportToCsv } from '../../utils/csvExport';

export interface IDashboardProps {
  snapshot: ISiteSnapshot;
  onEmail?: () => void;
}

const verdictClass: Record<string, string> = {
  Healthy: styles.healthy,
  Watch: styles.watch,
  'At risk': styles.atRisk,
};

export const Dashboard: React.FC<IDashboardProps> = ({ snapshot, onEmail }) => {
  const { detail, score } = snapshot;

  const onExport = React.useCallback(() => {
    const rows = detail.staleDocs.map((d) => ['Stale', d.name, formatDate(d.modifiedIso), '']);
    detail.externalShares.forEach((s) => rows.push(['External share', s.name, s.kind, s.sharedWith]));
    detail.largestFiles.forEach((f) => rows.push(['Largest file', f.name, String(f.sizeBytes), '']));
    exportToCsv(`site-snapshot-${snapshot.siteName}`, ['Category', 'Name', 'Detail', 'Extra'], rows);
  }, [detail, snapshot.siteName]);

  const commands: ICommandBarItemProps[] = [
    { key: 'export', text: 'Export CSV', iconProps: { iconName: 'ExcelDocument' }, onClick: onExport },
    { key: 'email', text: 'Email me this', iconProps: { iconName: 'Mail' }, onClick: onEmail, disabled: !onEmail },
  ];

  return (
    <Stack tokens={{ childrenGap: 18 }}>
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 20 }} wrap>
        <ScoreRing score={score.score} verdictClassName={verdictClass[score.verdict]} />
        <Stack>
          <Text variant="xxLarge">{snapshot.siteName}</Text>
          <Text variant="mediumPlus">Health {score.verdict}</Text>
          <Text variant="small">Generated {formatDate(snapshot.generatedAtIso)}</Text>
        </Stack>
      </Stack>

      <CommandBar items={commands} className={styles.commandBar} />

      {detail.truncated && (
        <MessageBar messageBarType={MessageBarType.warning}>
          Showing the first {detail.totalScanned} items. Some files were not scanned.
        </MessageBar>
      )}

      <Stack horizontal tokens={{ childrenGap: 24 }} wrap>
        <Stack.Item grow className={styles.barsCol}>
          <StorageBar usedBytes={snapshot.storageUsedBytes} totalBytes={snapshot.storageTotalBytes} />
        </Stack.Item>
        <Stack.Item grow className={styles.barsCol}>
          <SubScoreBars score={score} />
        </Stack.Item>
      </Stack>

      <Pivot>
        <PivotItem headerText={`Stale docs (${detail.staleDocs.length})`}>
          <DetailPanel kind="stale" staleDocs={detail.staleDocs} />
        </PivotItem>
        <PivotItem headerText={`External shares (${detail.externalShares.length})`}>
          <DetailPanel kind="external" externalShares={detail.externalShares} />
        </PivotItem>
        <PivotItem headerText={`Largest files (${detail.largestFiles.length})`}>
          <DetailPanel kind="largest" largestFiles={detail.largestFiles} />
        </PivotItem>
      </Pivot>
    </Stack>
  );
};
