/**
 * STUDY MATERIAL — SPFx 1.24 preview. Read for the pattern.
 *
 * THE ACTUAL REACT UI. This is a plain functional component — this is where
 * you spend most of your time. It knows nothing about SPFx/Copilot plumbing;
 * it just receives props and renders. That separation (thin class <-> pure UI)
 * is what keeps a Copilot Component testable and portable.
 *
 * It demonstrates the two display modes:
 *   - inline    → a compact greeting card with a "Open dashboard" button
 *   - fullscreen → a full "app" surface (the thing the agent "opens")
 */

import * as React from 'react';
import { PrimaryButton } from '@fluentui/react/lib/Button'; // per-module import = smaller bundle
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';

export interface IHelloAgentProps {
  /** Name to greet (from the tool's Zod-validated args). */
  name: string;
  /** True when the host is currently showing us full-screen. */
  isFullscreen: boolean;
  /** Ask the host to expand (the class wires this to requestDisplayModeAsync). */
  onRequestFullscreen: () => void;
  /** If the tool arg requested fullscreen, expand on first mount. */
  autoExpand?: boolean;
}

export const HelloAgent: React.FC<IHelloAgentProps> = (props) => {
  const { name, isFullscreen, onRequestFullscreen, autoExpand } = props;

  // All hooks at the TOP — never after an early return (avoids React #300).
  React.useEffect(() => {
    if (autoExpand && !isFullscreen) {
      onRequestFullscreen();
    }
    // run once on mount for the initial tool-driven request
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- INLINE: compact, glanceable, one clear action ----------------------
  if (!isFullscreen) {
    return (
      <Stack tokens={{ childrenGap: 8 }} styles={{ root: { padding: 12, maxWidth: 360 } }}>
        <Text variant="large">👋 Hi {name || 'there'}!</Text>
        <Text variant="small">I can open a full dashboard right here in Copilot.</Text>
        <PrimaryButton text="Open dashboard" onClick={onRequestFullscreen} />
      </Stack>
    );
  }

  // ---- FULLSCREEN: the "full app" the agent opened ------------------------
  return (
    <Stack
      tokens={{ childrenGap: 16 }}
      styles={{ root: { padding: 24, height: '100%', boxSizing: 'border-box' } }}
    >
      <Text variant="xxLarge">Welcome, {name || 'friend'} 🎉</Text>
      <Text variant="medium">
        This is a full-screen Copilot Component — a real React app rendered
        inside the Microsoft 365 Copilot canvas. Build your dashboard, wizard,
        or workspace here. Wire data via a centralized PnPjs/Graph service
        (see docs/05-best-practices.md).
      </Text>

      {/* Demo content grid — replace with your real UI */}
      <Stack horizontal wrap tokens={{ childrenGap: 12 }}>
        {['Tasks', 'Recent', 'Insights'].map((label) => (
          <Stack
            key={label}
            styles={{
              root: {
                width: 200,
                minHeight: 120,
                padding: 16,
                borderRadius: 8,
                // Theme-aware: use a CSS custom property set from host theme,
                // not a hardcoded hex (see theming best practices).
                border: '1px solid var(--neutralQuaternary, #d0d0d0)',
              },
            }}
          >
            <Text variant="mediumPlus">{label}</Text>
            <Text variant="small">Your {label.toLowerCase()} panel.</Text>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};
