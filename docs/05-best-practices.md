# 05 · Best practices & gotchas (React-first)

> **Status:** SPFx **1.24 public preview**. This distils the proven `spfx-development` conventions (built on SPFx 1.20) and marks where **1.24 differs**.

---

## Version discipline (the #1 source of pain)

| Thing | This project (1.24 preview) | The old skill baseline (1.20) |
|-------|------------------------------|-------------------------------|
| Node | **22** | 18.20.4 |
| React | **18** (exact-pin) | 17.0.1 |
| TypeScript | **5.x** | 4.7.4 |
| Fluent UI | **v8** (`@fluentui/react`) | v8 |
| Build tool | **Heft** | gulp |
| Generator | `@microsoft/generator-sharepoint@next` | `@latest` |

- **Exact-pin React**: `npm install react@18 react-dom@18 --save-exact`. Version drift → React #300.
- **Never install Fluent UI v9** (`@fluentui/react-components` / `@fluentui/react-icons`) - conflicts with SPFx loading. Import v8 per-module: `import { PrimaryButton } from '@fluentui/react/lib/Button'` (tree-shakes ~60-80%).
- **Don't reach for gulp muscle-memory** - it's `heft` now.

---

## Preview hygiene

- **Assume APIs move.** Pin your generator beta and write down which one you scaffolded on (it's in `.yo-rc.json`). When docs and your scaffold disagree, trust the scaffold and update our docs.
- **Don't ship preview code to a client's production tenant.** Use a sandbox or developer tenant until the feature reaches general availability.
- **No marketplace distribution** in preview - tenant-internal only.

---

## Copilot Component design

- **Keep the `BaseCopilotComponent` class thin.** It should read host context, mount React, and wire display-mode changes - nothing more. All UI lives in `components/` React files.
- **Design both display modes from day one.** `inline` = compact, glanceable, one action. `fullscreen` = the "full app". Don't cram a full app into inline; don't waste fullscreen on a single label.
  ```ts
  const isFull = this.hostContext.displayMode === 'fullscreen';
  // render <CompactCard/> vs <FullApp/>
  ```
- **Request, don't force, fullscreen.** `await this.requestDisplayModeAsync('fullscreen')`. Handle host-initiated collapse in `onHostContextChanged()` by re-reading `displayMode` and re-rendering.
- **Respect host theme.** Read theme from host context; don't hardcode hex. Reuse the theming pattern below.

---

## Tools & the agent

- **One tool = one clear capability.** Give tools precise names + descriptions; the model uses them to decide when to call you.
- **Model the Zod schema tightly.** Narrow types + descriptions in `...Properties.ts` make the model pass correct args. Avoid free-form `string` when an enum fits.
- **Behavior lives in `instruction.txt`.** To change how the agent acts, edit instructions before touching code. Keep instructions specific, scoped, and testable (see MS "best practices for declarative agents").
- **Keep `ai-plugin.json` in sync** with your component tools - a tool with no action is invisible to the agent.

---

## Theming (carry over from the skill - still true)

SPFx theme tokens are unreliable in CSS shorthand. Use **CSS custom properties** set from host theme, and `var()` in SCSS:

```scss
.sectionTitle { border-left: 3px solid var(--themePrimary, #0078d4); } // works everywhere
```

For inline styles, derive colors from the host theme rather than literals. Add `.darkTheme` overrides.

---

## Libraries for a Microsoft-native Copilot component

- **Fluent UI v8** (`@fluentui/react@^8`) for the controls, so it looks native. Per-module imports. Theme it with `ThemeProvider` built from `hostContext.theme`. Never v9.
- **`@pnp/spfx-controls-react@^3`** for reusable controls, but **only the context-free ones** (`FileTypeIcon`, `Placeholder`, `Pagination`) inside a Copilot component. Controls that need a full `WebPartContext` (ListView, the pickers) will not have one here. Note: v3 is validated up to SPFx 1.23, not yet 1.24.
- **PnPjs v4** (`@pnp/graph`) for Graph reads and `me.sendMail`. See the caveat below.
- **Presentation-first data seam.** A Copilot component's context is not documented to expose the token or Graph factories PnPjs needs, so do not couple the UI to Graph. Put an `ISnapshotDataSource`-style interface in `services/`, build the UI against a mock implementation, then swap in a PnPjs one. If `SPFx(context)` will not bind in the canvas, fall back to `AadHttpClient` or fetch in the agent tool layer and pass results in as properties. Worked example: `reference/scenario-site-snapshot/`.

## Data access

- **Centralize PnPjs** in one `services/spService.ts` and import it - never configure PnPjs in the component class.
- **Selective PnPjs sub-imports** (`@pnp/sp/webs`, `/lists`, `/items` …) to keep the bundle small.
- **Cache Graph reads** (5-min TTL pattern); **batch** 3+ related SP requests; **don't combine batching + caching** (known bug).
- **Friendly errors**: wrap PnP/Graph errors through a `getFriendlyError()` helper; never dump raw stack traces into the Copilot UI.

---

## React correctness (avoid #300)

- All hooks at the **top** of the component - never after an early return, never conditionally.
- **Never define a component inside another component's render** - extract it to a module.
- `useMemo`/`useCallback` for expensive derivations and handlers passed to memoized children.
- Prefer **functional components + hooks** (SPFx 1.13+ norm); extract SP/Graph calls into custom hooks (`useListItems`, etc.).

---

## Bundle & performance

- Target < 250KB gzipped for a medium component; watch Fluent UI bloat.
- **Dynamic-import heavy features** (charts, editors): `await import(/* webpackChunkName: "charts" */ 'chart.js')`.
- Analyze: `npx heft build --production` then inspect the emitted stats.

---

## CSP (mandatory from March 2026)

- No inline `<script>`, no `eval`/`new Function`, no runtime script-tag injection.
- SPFx bundles hosted in `ClientSideAssets` (via `includeClientSideAssets: true`) are trusted automatically.
- Sanitize any user HTML with DOMPurify before `dangerouslySetInnerHTML`.

---

## Git & versioning

- `.gitignore`: `node_modules/`, `lib/`, `dist/`, `temp/`, `*.sppkg`, `sharepoint/solution/`, `.heft/`, `.claude/`.
- **Bump `solution.version` on every deploy** and put the new version in the commit message.
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.

---

## When you use an AI coding assistant

Give it the pinned stack from this page (Node 22, Heft, the `@next` generator, React 18) before you start, so it doesn't fall back to older SPFx defaults such as gulp, Node 18 or React 17. Tell it which generator beta you scaffolded on (see `.yo-rc.json`) if behavior diverges from these docs.
