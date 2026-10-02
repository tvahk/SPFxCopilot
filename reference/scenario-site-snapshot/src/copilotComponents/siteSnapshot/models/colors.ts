/**
 * Site Snapshot - shared colors and button styles.
 * ===========================================================================
 * Following the convention from your Provisioner app: define button styles and
 * status colors once here and import them everywhere. Never redefine a button
 * style locally.
 *
 * These hex values are sensible defaults. Inside a Copilot component the live
 * colors come from the host theme (see SiteSnapshotCopilotComponent.ts, which
 * maps hostContext.theme to Fluent's ThemeProvider), so use these mainly for
 * the score verdict and risk chips that are semantic rather than themed.
 */

import { IButtonStyles } from '@fluentui/react/lib/Button';

/** Verdict color per health band. */
export const VERDICT_COLORS: Record<'Healthy' | 'Watch' | 'At risk', string> = {
  Healthy: '#107c10', // green
  Watch: '#797775', // neutral
  'At risk': '#a4262c', // red
};

/** Risk color for a sharing row. "Anyone" links are the higher risk. */
export const RISK_COLORS: Record<'anyone' | 'external', string> = {
  anyone: '#a4262c', // red
  external: '#8a6d00', // amber
};

/** Shared primary button styling. Import this, do not redefine per component. */
export const BUTTON_STYLES: IButtonStyles = {
  root: { borderRadius: 4 },
};
