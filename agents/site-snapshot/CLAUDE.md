# CLAUDE.md - Site Snapshot

Read this first when working on this solution. It gives you everything needed to iterate quickly and safely.

## What this is

An SPFx 1.24 **Copilot Component** (a Microsoft 365 Copilot agent) that produces an on-demand **health snapshot** of a SharePoint site: a health score, storage, stale docs, external/"Anyone" sharing, largest files, duplicates, empty files, and a file-type breakdown - across **all user document libraries** on the site. It can export to CSV, email a summary, and remove a sharing link. Inline card in chat; full dashboard in fullscreen.

Standalone project. The sibling `../my-first-copilot-app` is the untouched hello playground - do not change it.

## Stack (pinned by the scaffold - do not "upgrade")

- SPFx **1.24.0-beta.3**, Node **22**, TypeScript **5.8**, React **18.3**.
- UI: **Fluent UI v9** (`@fluentui/react-components`) + `makeStyles` (Griffel) + `@fluentui/react-icons`. Theme via `FluentProvider` from a brand ramp, injected into the iframe with `targetDocument`. Do NOT use Fluent v8 or SCSS modules here (this project is v9).
- Data: brokered **`MSGraphClientV3`** from `this.context.msGraphClientFactory` - no PnPjs, no token code. `this.context.spHttpClient` and `this.context.pageContext` are also available.
- Zod for tool parameters (`zodToJsonSchema` default export; the manifest points at the compiled `.js`).

## Commands (heft is local - use npx)

```powershell
npx heft build          # compile + lint + webpack + build the agent package
npx heft test --clean   # build + run Jest tests
npx heft start --nobrowser   # dev server for the Copilot Workbench
npm run build           # production build + package-solution (.sppkg)
```

Test in the Workbench: `https://<tenant>.sharepoint.com/_layouts/15/copilotworkbench.aspx`.
Keep the build at **0 errors, 0 warnings** and tests green before finishing.

## Architecture (presentation vs data)

- **Class** `SiteSnapshotCopilotComponent.tsx` is thin: `onInit` creates the service + fetches the snapshot (and the user's email), `render` mounts React with `createRoot`, `onTeardown` unmounts. It wires the actions (open fullscreen, export, email, revoke).
- **Data** lives behind `ISiteSnapshotService`. `SiteSnapshotService` uses `MSGraphClientV3`. Every call is wrapped; on any failure it returns **sample data** (`sampleData.ts`) so the UI always renders. `isSample` is surfaced in the UI.
- **Scoring** is a pure function (`models/health.ts`) - unit-tested, no Graph, no React.
- **UI** is all in `components/`. One folder per component with `X.tsx` + `IXProps.ts` + `useXStyles.ts`.

## File map

```
src/copilotComponents/siteSnapshot/
  SiteSnapshotCopilotComponent.tsx / .manifest.json / ...Properties.ts   (host + tool)
  components/
    SiteSnapshot/  root (FluentProvider, inline vs fullscreen)
    ScoreCard/     inline card
    Dashboard/     fullscreen (header card, breakdown card, KPI tiles, tabs)
    DetailTable/   one reusable table for every list + the revoke dialog
  services/  ISiteSnapshotService, SiteSnapshotService (Graph), sampleData
  models/    ISnapshot (types), health (scoring + tests), index (barrel)
  utils/     Formatters, CsvExport, FileTypes (+ tests)
copilot/   declarativeAgent.json, ai-plugin.json, instruction.txt, manifest.json
config/    config.json, copilot-agent.json, package-solution.json
```

## Conventions (match these)

- Functional components + hooks; **all hooks at the top**, before any early return (React #300). Never define a component inside render.
- Interfaces are `I`-prefixed and in their own `I<Name>Props.ts`. Styling in `use<Name>Styles.ts` via `makeStyles`. **No inline `style={{}}`** - use a class.
- Types over `any`. Graph responses are typed with small `...Lite` interfaces.
- Reuse `Formatters`, `CsvExport`, `FileTypes`. Add new shared helpers to `utils/`.
- Keep the class thin and all data access in the service. Keep `health.ts` pure and add a test when you change scoring.

## Graph permissions (config/package-solution.json)

`Sites.Read.All`, `Files.Read.All`, `Files.ReadWrite.All` (revoke link), `Mail.Send`. Approved once in SharePoint admin center after deploying. Until then the agent runs on sample data.

## Scale limits (important)

A client component cannot enumerate 100k+ files. The scan is bounded: **MAX_ITEMS 1000**, **MAX_FOLDERS 400**, **PERM_CAP 80**, across all non-system libraries (`SYSTEM_LIBRARIES` set). When capped, `truncated` is true and the UI says so. For true full-site coverage see the roadmap (search aggregations or a background job).

## How to add a feature (typical loop)

1. Add/extend a type in `models/ISnapshot.ts`.
2. Compute it in `SiteSnapshotService` (real) and `sampleData.ts` (fallback) - keep both in sync.
3. Surface it in `Dashboard` (a KPI tile or a new `DetailTable` kind).
4. `npx heft test --clean` to confirm green; test in the Workbench.

## Gotchas

- Every new `ISnapshotDetail` field must be added to **both** the service return and `sampleData.ts`, or the build breaks.
- `no-unescaped-entities`: don't put raw `"`/`'` in JSX text.
- Agent-facing wording lives in `copilot/instruction.txt`, `declarativeAgent.json`, `ai-plugin.json` - keep them consistent.

See `ROADMAP.md` for what's next.
