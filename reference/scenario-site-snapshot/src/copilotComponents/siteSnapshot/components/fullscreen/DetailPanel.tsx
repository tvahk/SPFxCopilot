/**
 * Site Snapshot - detail panel (reused for all three lists).
 * ===========================================================================
 * A Fluent DetailsList that renders the stale docs, largest files, or external
 * shares. It uses FileTypeIcon from @pnp/spfx-controls-react for the file icon
 * (a native Microsoft touch) and a Persona for external people. FileTypeIcon is
 * context-free, so it is safe inside a Copilot component.
 */

import * as React from 'react';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
} from '@fluentui/react/lib/DetailsList';
import { Link } from '@fluentui/react/lib/Link';
import { Persona, PersonaSize } from '@fluentui/react/lib/Persona';
import { Text } from '@fluentui/react/lib/Text';
import { FileTypeIcon, IconType } from '@pnp/spfx-controls-react/lib/FileTypeIcon';

import styles from './DetailPanel.module.scss';
import { IStaleDoc, ILargeFile, IExternalShare } from '../../models/types';
import { formatDate, formatBytes } from '../../utils/formatters';

export type DetailKind = 'stale' | 'largest' | 'external';

export interface IDetailPanelProps {
  kind: DetailKind;
  staleDocs?: IStaleDoc[];
  largestFiles?: ILargeFile[];
  externalShares?: IExternalShare[];
}

const nameColumn = (): IColumn => ({
  key: 'name',
  name: 'File',
  minWidth: 220,
  isResizable: true,
  onRender: (item: { name: string; webUrl: string }) => (
    <span className={styles.fileCell}>
      <FileTypeIcon type={IconType.font} path={item.name} />
      <Link href={item.webUrl} target="_blank" className={styles.fileName}>
        {item.name}
      </Link>
    </span>
  ),
});

export const DetailPanel: React.FC<IDetailPanelProps> = (props) => {
  if (props.kind === 'stale') {
    const columns: IColumn[] = [
      nameColumn(),
      {
        key: 'modified',
        name: 'Last modified',
        minWidth: 120,
        onRender: (item: IStaleDoc) => <Text variant="small">{formatDate(item.modifiedIso)}</Text>,
      },
    ];
    return renderList(props.staleDocs || [], columns);
  }

  if (props.kind === 'largest') {
    const columns: IColumn[] = [
      nameColumn(),
      {
        key: 'size',
        name: 'Size',
        minWidth: 100,
        onRender: (item: ILargeFile) => <Text variant="small">{formatBytes(item.sizeBytes)}</Text>,
      },
    ];
    return renderList(props.largestFiles || [], columns);
  }

  // external
  const columns: IColumn[] = [
    nameColumn(),
    {
      key: 'kind',
      name: 'Link type',
      minWidth: 90,
      onRender: (item: IExternalShare) => (
        <Text variant="small">{item.kind === 'anyone' ? 'Anyone' : 'Specific'}</Text>
      ),
    },
    {
      key: 'sharedWith',
      name: 'Shared with',
      minWidth: 200,
      onRender: (item: IExternalShare) => <Persona text={item.sharedWith} size={PersonaSize.size24} />,
    },
  ];
  return renderList(props.externalShares || [], columns);
};

function renderList(items: object[], columns: IColumn[]): JSX.Element {
  if (!items.length) {
    return <Text variant="small">Nothing to show here. That is a good sign.</Text>;
  }
  return (
    <div className={styles.listWrap}>
      <DetailsList
        items={items}
        columns={columns}
        selectionMode={SelectionMode.none}
        layoutMode={DetailsListLayoutMode.justified}
        isHeaderVisible
      />
    </div>
  );
}
