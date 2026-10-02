/**
 * STUDY MATERIAL — SPFx 1.24 preview. Illustrative, not guaranteed to compile
 * against your scaffolded beta. Read for the SHAPE, then diff against the file
 * the generator produces for you.
 *
 * WHAT THIS FILE IS
 * -----------------------------------------------------------------------------
 * The Copilot Component "class" — the SPFx entry point that the Copilot host
 * instantiates. It extends BaseCopilotComponent (from @microsoft/sp-copilot-component).
 *
 * KEEP THIS CLASS THIN. Its only jobs:
 *   1. read host context (display mode + theme),
 *   2. mount the React UI into the host element,
 *   3. react to host context changes (e.g. host collapses you from fullscreen),
 *   4. expose the tool handler(s).
 * All real UI lives in ./components/HelloAgent.tsx.
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom'; // React 18: consider createRoot; template may differ
import { BaseCopilotComponent } from '@microsoft/sp-copilot-component';

import { HelloAgent } from './components/HelloAgent';
import {
  HelloAgentCopilotComponentProperties,
  type HelloAgentToolProps,
} from './HelloAgentCopilotComponentProperties';

export default class HelloAgentCopilotComponent extends BaseCopilotComponent<
  typeof HelloAgentCopilotComponentProperties
> {
  /**
   * render() is called by the host. `this.hostContext` gives you:
   *   - displayMode: 'inline' | 'fullscreen'
   *   - theme info (respect it — don't hardcode colors)
   *   - the DOM element to render into (this.context.domElement)
   *
   * NOTE: exact host-context property names can vary by beta. Log
   * `this.hostContext` once against your scaffold and adjust.
   */
  public render(): void {
    // Arguments the model passed for the invoked tool, validated by the Zod schema.
    const props = this.properties as HelloAgentToolProps;

    const isFullscreen = this.hostContext.displayMode === 'fullscreen';

    const element = React.createElement(HelloAgent, {
      name: props.name,
      isFullscreen,
      // Let the UI ask the host to expand — the "open the full app" affordance.
      onRequestFullscreen: this._goFullscreen,
      // Optional: honor a tool argument that pre-requests fullscreen.
      autoExpand: !!props.openFullscreen,
    });

    ReactDOM.render(element, this.context.domElement);
  }

  /**
   * Ask the host to expand to full-screen. You REQUEST; the host GRANTS.
   * Collapse is always host-initiated (see onHostContextChanged).
   */
  private _goFullscreen = async (): Promise<void> => {
    try {
      await this.requestDisplayModeAsync('fullscreen');
    } catch (err) {
      // Never dump raw errors into the Copilot UI — log for yourself only.
      // (In production, route through a friendly-error helper.)
    }
  };

  /**
   * The host calls this when context changes — most importantly when it
   * COLLAPSES you back to inline. Re-render so your layout matches the mode.
   */
  protected onHostContextChanged(): void {
    this.render();
  }

  /** Clean up React when the host tears the component down. */
  protected onDispose(): void {
    ReactDOM.unmountComponentAtNode(this.context.domElement);
  }
}
