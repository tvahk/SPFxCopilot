# CLAUDE.md - SPFxCopilot project context

Read this first before helping in this repo. It pins the versions, tools, and conventions for **building Microsoft 365 Copilot agents with SPFx**. Do not regress the user to older SPFx defaults.

## What this repo is

A personal **learning hub + build workspace** for **SharePoint Copilot Apps** - SPFx client-side UI components ("Copilot Components") that render *inside* Microsoft 365 Copilot, packaged with a **declarative agent**, capable of expanding to a full-screen app.

- `learn/index.html` - self-contained learning hub (open in a browser).
- `docs/` - deep-dive reference (glossary → prerequisites → scaffold → anatomy → build/deploy → best practices).
- `reference/` - hand-written, annotated **study code** (not buildable; shows the shape).
- `agents/` - where the user scaffolds **real** SPFx Copilot App solutions (one per subfolder).

## Hard facts (PREVIEW - details can shift before general availability)

- Feature ships in **SPFx 1.24 (public preview)** - **NOT 1.21**. It's called "SharePoint Copilot Apps" / "Copilot Components".
- **"Opens a full app"** = a Copilot Component's **`fullscreen` display mode** (vs `inline`). Request via `requestDisplayModeAsync('fullscreen')`; collapse is host-initiated (`onHostContextChanged`).

## Pinned toolchain - use these, not older defaults

| Thing | Value | NOT |
|-------|-------|-----|
| Node.js | **22** | not 18/20 |
| React | **18** (`--save-exact`) | not 17 |
| TypeScript | **5.x** | - |
| Fluent UI | **v8** (`@fluentui/react`, per-module imports) | never v9 |
| Build tool | **Heft** (`heft start / build / package-solution`) | **not gulp** |
| Generator | `@microsoft/generator-sharepoint@next` | not `@latest` |
| Base class | `BaseCopilotComponent` (`@microsoft/sp-copilot-component`) | not `BaseClientSideWebPart` (unless a web part) |
| Tool params | **Zod** schema in `...Properties.ts` | - |

## Key file set of a scaffolded Copilot App

- `src/copilotComponents/<name>/` - component class (thin), `.manifest.json` (`componentType:"CopilotComponent"`, `copilotType:"Ux"`, `availableDisplayModes`, `tools[]`), `...Properties.ts` (Zod), `components/` (React UI).
- `copilot/` - `manifest.json`, `declarativeAgent.json` (schema v1.8), `ai-plugin.json`, `instruction.txt`.
- `config/copilot-agent.json` (groups components into the agent), `config/package-solution.json` (bump `version` every deploy).

## Local test + deploy

- Test: `heft start --nobrowser` → Copilot Workbench `https://<tenant>.sharepoint.com/_layouts/15/copilotworkbench.aspx` → accept manifests → activate → Fire turn.
- Deploy: bump version → `heft clean && heft build --production && heft package-solution --production` → upload `.sppkg` to app catalog → **Add to Teams** (auto-syncs the agent into Copilot).
- No Copilot license needed during preview; no marketplace distribution in preview; sandbox tenant only.

## Conventions to enforce when writing code here

- **Thin component class**, all UI in `components/` React functional components + hooks.
- Design **both** `inline` and `fullscreen` layouts.
- All hooks at top (avoid React #300); never define components inside render.
- **Centralize PnPjs** in a `services/` module; selective sub-imports; cache Graph reads; batch 3+ SP calls (don't combine batch+cache).
- **Theme-aware** via CSS custom properties set from host theme - no hardcoded hex; add `.darkTheme` overrides.
- Route errors through a friendly-error helper - never raw stack traces in the Copilot UI.
- CSP-safe: no inline scripts / `eval`; sanitize any user HTML with DOMPurify.
- Bundle discipline: per-module Fluent UI imports; dynamic-import heavy features.
- Git: ignore `node_modules/ lib/ dist/ temp/ *.sppkg sharepoint/solution/ .heft/ .claude/`; conventional commits; **bump `solution.version` on every deploy** and note it in the commit message.

## Relationship to the global `spfx-development` skill

That skill is excellent but built on **SPFx 1.20** (Node 18, React 17, gulp, Fluent v8). Reuse its patterns (theming, PnPjs, hooks, bundle discipline, provisioning, error handling) but **override** the version/toolchain rows above for this repo (Node 22, React 18, TS 5.x, Heft, `@next` generator, Copilot Component base class).

## When behavior diverges from the docs

The generator `@next` moves. Ask the user which beta they scaffolded on (`.yo-rc.json`), trust their actual scaffold over any doc here, and update `docs/03-project-anatomy.md` if file names differ.
