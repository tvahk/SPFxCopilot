/**
 * Site Snapshot - the React root.
 * ===========================================================================
 * Presentation-first. It wraps the tree in a Fluent ThemeProvider built from the
 * host theme, chooses a data source, runs the useSnapshot hook, and renders the
 * inline card or the fullscreen dashboard. It knows nothing about Graph.
 *
 * To switch from sample data to real data, change one line: swap MockDataSource
 * for `new GraphDataSource(context)` (see services/graphDataSource.ts and its
 * preview caveat). Nothing else in the UI changes.
 */

import * as React from 'react';
import { ThemeProvider } from '@fluentui/react/lib/Theme';
import { createTheme } from '@fluentui/react/lib/Styling';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';

import styles from './SiteSnapshotApp.module.scss';
import { ScoreCard } from './inline/ScoreCard';
import { Dashboard } from './fullscreen/Dashboard';
import { useSnapshot } from '../hooks/useSnapshot';
import { MockDataSource } from '../services/mockDataSource';
import { ISnapshotDataSource } from '../services/dataSource';
import { emailSnapshot } from '../services/siteSnapshotService';
import { ISiteSnapshot } from '../models/types';

export interface ISiteSnapshotAppProps {
  siteUrl?: string;
  staleMonths: number;
  topN: number;
  isFullscreen: boolean;
  isDark: boolean;
  onRequestFullscreen: () => void;
}

// A light and a dark Fluent theme. In production, refine these from the exact
// host palette; the host only gives us "light" or "dark" today.
const lightTheme = createTheme({ palette: { themePrimary: '#0f6cbd' } });
const darkTheme = createTheme({
  palette: { themePrimary: '#4aa3e6', neutralPrimary: '#f3f2f1', white: '#1b1a19' },
});

// Build the data source once. Swap this for the Graph source when ready.
const dataSource: ISnapshotDataSource = new MockDataSource();

export const SiteSnapshotApp: React.FC<ISiteSnapshotAppProps> = (props) => {
  const { isFullscreen, isDark, onRequestFullscreen } = props;

  // All hooks at the top, before any early return (avoids React #300).
  const args = React.useMemo(
    () => ({
      siteUrl: props.siteUrl || 'https://contoso.sharepoint.com/sites/current',
      staleMonths: props.staleMonths,
      topN: props.topN,
    }),
    [props.siteUrl, props.staleMonths, props.topN]
  );
  // Pass a fixed timestamp for the render pass; the hook treats it as "now".
  const nowMs = React.useMemo(() => Date.parse('2026-09-10T00:00:00Z'), []);
  const { snapshot, loading, error } = useSnapshot(dataSource, args, nowMs);

  // Email is a real side effect, so the parent owns it (it has the data source).
  // In production, resolve the current user's address rather than hardcoding.
  const onEmail = React.useCallback((snap: ISiteSnapshot) => {
    emailSnapshot(dataSource, snap, 'me@contoso.com').catch(() => undefined);
  }, []);

  return (
    <ThemeProvider
      theme={isDark ? darkTheme : lightTheme}
      className={isFullscreen ? styles.rootFull : styles.rootInline}
    >
      {loading && <Spinner size={SpinnerSize.large} label="Analysing site..." />}

      {!loading && error && (
        <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
      )}

      {!loading && !error && snapshot && !isFullscreen && (
        <ScoreCard snapshot={snapshot} onOpen={onRequestFullscreen} />
      )}

      {!loading && !error && snapshot && isFullscreen && (
        <Dashboard snapshot={snapshot} onEmail={() => onEmail(snapshot)} />
      )}
    </ThemeProvider>
  );
};
