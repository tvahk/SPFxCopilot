# Site Snapshot - solution skeleton

The full best-practice skeleton for the Site Snapshot Copilot App, built to look native (Fluent UI v8), use common libraries (PnPjs, PnP controls), and follow a clean structure. Follow the build-along page [`learn/vol2-site-snapshot.html`](../../learn/vol2-site-snapshot.html) to build it milestone by milestone. The spec is [`docs/scenario-01-site-snapshot.md`](../../docs/scenario-01-site-snapshot.md).

> **Study material for SPFx 1.24 preview.** Read and adapt it into a real `yo` scaffold in `agents/`. It is not guaranteed to compile untouched, and the PnPjs Graph path inside a Copilot component must be verified in preview (see the note in `graphDataSource.ts`).

## The tree

```
reference/scenario-site-snapshot/
├── copilot/                                   the declarative agent
│   ├── declarativeAgent.json  ai-plugin.json  instruction.txt  manifest.json
└── src/copilotComponents/siteSnapshot/
    ├── SiteSnapshotCopilotComponent.ts        thin class; builds a Fluent theme from the host theme
    ├── SiteSnapshotCopilotComponent.manifest.json
    ├── SiteSnapshotCopilotComponentProperties.ts   Zod tool schemas
    ├── components/
    │   ├── SiteSnapshotApp.tsx (+scss)        ThemeProvider; picks data source; inline vs fullscreen
    │   ├── inline/ScoreCard.tsx (+scss)       compact card (Fluent)
    │   └── fullscreen/
    │       ├── Dashboard.tsx (+scss)          CommandBar + Pivot + ScoreRing
    │       ├── ScoreRing.tsx  StorageBar.tsx  SubScoreBars.tsx
    │       └── DetailPanel.tsx (+scss)        Fluent DetailsList + FileTypeIcon + Persona
    ├── services/
    │   ├── dataSource.ts                      the seam (ISnapshotDataSource)
    │   ├── mockDataSource.ts                  sample data (build the UI first)
    │   ├── graphDataSource.ts                 PnPjs @pnp/graph (preview caveat + fallback)
    │   └── siteSnapshotService.ts             buildSnapshot / emailSnapshot (any data source)
    ├── models/  health.ts  types.ts  colors.ts  health.test.ts
    ├── utils/   formatters.ts  cache.ts  csvExport.ts  errorMessages.ts
    ├── hooks/useSnapshot.ts
    └── loc/  en-us.js  mystrings.d.ts
```

## The key idea: a data-source seam

The UI depends on `ISnapshotDataSource`, not on Graph. Two implementations satisfy it:

- **`mockDataSource.ts`** - sample data, no tenant needed. Build and demo the whole UI with this.
- **`graphDataSource.ts`** - real data via PnPjs. Swap it in by changing one line in `SiteSnapshotApp.tsx`.

This exists because a Copilot component's context is only documented to expose `domElement`, `hostContext`, and `requestDisplayModeAsync`. It is **not** documented to expose the token or Graph factories PnPjs needs, so calling Graph from the component may not work in preview. Building presentation-first keeps you moving and honest about that risk.

## Dependencies

```powershell
npm install @fluentui/react@^8 @pnp/sp@^4 @pnp/graph@^4 @pnp/spfx-controls-react@^3
```

Note: `@pnp/spfx-controls-react` v3 officially reaches SPFx 1.23 and is not yet validated on 1.24/React 18. Use only context-free controls inside a Copilot component (this skeleton uses `FileTypeIcon`).

## Milestone map (matches the build-along page)

| Milestone | Files |
|-----------|-------|
| M0 Plumbing + deps | `SiteSnapshotCopilotComponent.ts`, `.manifest.json`, `...Properties.ts`, `components/SiteSnapshotApp.tsx` |
| M1 UI on mock data | `models/types.ts`, `models/health.ts` (+`health.test.ts`), `services/dataSource.ts`, `services/mockDataSource.ts`, `hooks/useSnapshot.ts`, `components/inline/ScoreCard.tsx` |
| M2 Fullscreen dashboard | `components/fullscreen/*`, `utils/formatters.ts` |
| M3 Real data via PnPjs | `services/graphDataSource.ts` |
| M4 CSV export | `utils/csvExport.ts` (wired in `Dashboard.tsx`) |
| M5 Email action | `services/siteSnapshotService.ts` (`emailSnapshot`), `copilot/ai-plugin.json`, `copilot/instruction.txt` |
| M6 Polish | `utils/errorMessages.ts`, `models/colors.ts`, `loc/`, empty/error states |

## Start with the pure core

`models/health.ts` has no Graph and no React. Copy it in and run `models/health.test.ts` first, before any UI. That is your TDD entry point.
