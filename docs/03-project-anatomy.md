# 03 · Project anatomy - every folder & file, and *why*

> **Status:** SPFx **1.24 public preview**. File names and schemas can shift between betas. Where a name varies by beta, it is noted.

This is the heart of "understand what the scaffold made". Open your `agents/my-first-copilot-app` and read along.

---

## The three zones of a Copilot App

Every Copilot App solution splits into three concerns. Keep them straight and nothing is mysterious:

1. **The Component** (`src/copilotComponents/...`) - *your UI + logic* that renders inside Copilot.
2. **The Agent definition** (`copilot/...`) - *the declarative agent* that makes Copilot find, describe, and call your Component.
3. **Build & packaging** (`config/`, `package.json`, `tsconfig.json`) - *how it all becomes one `.sppkg`*.

---

## Zone 1 - `src/copilotComponents/helloAgent/`  (your code)

| File | Purpose |
|------|---------|
| `HelloAgentCopilotComponent.ts` (or `.tsx`) | **The component class.** Extends `BaseCopilotComponent` from `@microsoft/sp-copilot-component`. Its `render()` reads host context (display mode, theme) and mounts your UI. For the React template it mounts a React tree into the host element. This is where `inline` vs `fullscreen` branching lives. |
| `HelloAgentCopilotComponent.manifest.json` | **The component manifest.** Declares `id` (GUID), `componentType: "CopilotComponent"`, `copilotType: "Ux"`, `capabilities.availableDisplayModes` (`inline` / `fullscreen`), and `tools[]` - each tool names a capability and points at a Zod `propertiesSchema`. This is what makes your Component *callable*. |
| `HelloAgentCopilotComponentProperties.ts` | **The tool parameter schema (Zod).** Describes the arguments Copilot will pass when it invokes a tool (the default template usually has a single `message: string`). Zod gives runtime validation + tells the model the shape. |
| `components/` (React template) | Your actual React components (e.g. `HelloAgent.tsx`). Keep UI here; keep the `BaseCopilotComponent` class thin. |
| `loc/` | Localized strings (`en-us.js` + `mystrings.d.ts`), same pattern as classic SPFx. |

> **Why a separate manifest per component:** one `.sppkg` can contain several Copilot Components (and web parts). Each needs its own identity, display modes, and tool list.

---

## Zone 2 - `copilot/`  (the declarative agent)

This folder is the *agent*, independent of any single Component. It's mostly JSON + one text file.

| File | Purpose |
|------|---------|
| `manifest.json` | **The M365 / Teams app manifest.** Registers the agent as an app: name, description, icons, IDs, and points at the declarative agent definition. This is the package's identity in the tenant. |
| `declarativeAgent.json` | **The declarative agent definition** (schema **v1.8** on beta.3). The brain-config: `name`, `description`, `instructions` (often `"$[file('instruction.txt')]"`), `conversation_starters`, `capabilities`, `knowledge` sources, and `actions`. This is where you make the agent feel purposeful. |
| `ai-plugin.json` | **The plugin/action definition.** Describes your Component's tools *to the model* as callable **actions** - the bridge between "the agent" and "your tool". |
| `instruction.txt` | **Natural-language instructions** that shape the agent's behavior/persona/guardrails. Referenced from `declarativeAgent.json`. Editing this is the fastest way to change agent behavior. |

> **Mental picture:** `declarativeAgent.json` + `instruction.txt` = *what the agent is and how it behaves*. `ai-plugin.json` = *what it can do (your tools)*. `manifest.json` = *how the tenant installs it*.

---

## Zone 3 - build & packaging

| File / folder | Purpose |
|---------------|---------|
| `config/copilot-agent.json` | **Groups Component(s) into the agent** by referencing their component `id` values. At build time the toolchain **merges** `declarativeAgent.json` with the component/tool details here to emit the final agent package. |
| `config/package-solution.json` | Standard SPFx packaging: solution `id`, `version` (bump every deploy!), features, and `includeClientSideAssets: true` (bundles your JS into the `.sppkg` for **automatic in-tenant hosting** - no CDN needed). |
| `config/config.json` | Bundle entry points, externals, localized resources. |
| `config/serve.json` | Local dev-server settings (port 4321, initial page). |
| `package.json` | Dependencies + **Heft** scripts (`heft start`, `heft build`, `heft package-solution`). Note: **no gulp** on 1.22+. |
| `tsconfig.json` | TypeScript config (TS 5.x on 1.24). |
| `.yo-rc.json` | Records your generator answers (SPFx version, component type) so re-runs stay consistent. Don't hand-edit. |
| `teams/` or `appManifests/` | App-package assets: agent icons (color/outline), sometimes a Teams manifest. Name varies by beta. |

### Generated at build time (don't edit, usually git-ignored)

| Path | What it is |
|------|-----------|
| `lib/` | Compiled JS. |
| `dist/` | Bundled output. |
| `temp/` | Intermediate build output; `temp/copilot/` holds the **merged** agent package before packaging. |
| `sharepoint/solution/<name>.sppkg` | **The final deployable package.** This is what you upload to the app catalog. |

---

## How a request actually flows (ties it together)

```
User types in Copilot
   → declarative agent (declarativeAgent.json + instruction.txt) decides to act
   → invokes an ACTION (ai-plugin.json)
   → which maps to a TOOL on your Copilot Component (component manifest tools[])
   → your component class render()s UI in the Copilot canvas
   → inline by default; requestDisplayModeAsync('fullscreen') to "open the full app"
```

---

## What to put where (as you grow the app)

- **UI + interaction** → `src/copilotComponents/<name>/components/` (React).
- **Data access** (PnPjs, Graph) → a `services/` folder inside the component; centralize PnPjs setup (see [05-best-practices.md](05-best-practices.md)).
- **Agent behavior/persona** → `copilot/instruction.txt` + `declarativeAgent.json`.
- **New capability the agent can call** → add a tool (component manifest + Zod props) *and* surface it in `ai-plugin.json`.

Next: [04-build-run-deploy.md](04-build-run-deploy.md).
