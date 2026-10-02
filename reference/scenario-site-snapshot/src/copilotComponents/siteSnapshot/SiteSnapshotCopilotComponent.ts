/**
 * Site Snapshot - the Copilot component class (thin entry point).
 * ===========================================================================
 * SPFx 1.24 preview study material. Keep this class small. Its only jobs are:
 *   1. read the tool arguments and the host display mode,
 *   2. build a Fluent theme from the host theme,
 *   3. mount the React app,
 *   4. re-render when the host context changes (for example a collapse).
 *
 * All real UI lives in components/. All data access lives behind the data-source
 * seam in services/.
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BaseCopilotComponent } from '@microsoft/sp-copilot-component';

import { SiteSnapshotApp } from './components/SiteSnapshotApp';
import {
  AnalyzeSiteProperties,
  AnalyzeSiteArgs,
} from './SiteSnapshotCopilotComponentProperties';

export default class SiteSnapshotCopilotComponent extends BaseCopilotComponent<
  typeof AnalyzeSiteProperties
> {
  public render(): void {
    const args = this.properties as AnalyzeSiteArgs;
    const isFullscreen = this.hostContext.displayMode === 'fullscreen';
    const isDark = this.hostContext.theme === 'dark';

    const element = React.createElement(SiteSnapshotApp, {
      siteUrl: args.siteUrl,
      staleMonths: args.staleMonths ?? 6,
      topN: args.topN ?? 10,
      isFullscreen,
      isDark,
      onRequestFullscreen: this._goFullscreen,
    });

    ReactDOM.render(element, this.context.domElement);
  }

  private _goFullscreen = async (): Promise<void> => {
    try {
      await this.requestDisplayModeAsync('fullscreen');
    } catch {
      // request may be declined by the host; nothing to surface to the user
    }
  };

  protected onHostContextChanged(): void {
    // Re-render so the layout matches the new display mode or theme.
    this.render();
  }

  protected onDispose(): void {
    ReactDOM.unmountComponentAtNode(this.context.domElement);
  }
}
