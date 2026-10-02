# 04 · Build, run & deploy - Heft, Workbench, Copilot

> **Status:** SPFx **1.24 public preview**. Commands are the Heft-based toolchain used on SPFx **1.22+**. **Do not use gulp** - it's gone from this toolchain.

Three loops: **local test** (fast, in the Workbench), **package**, **deploy**.

---

## First: install dependencies, and know how to run Heft

`heft` is **not** a global command. It installs *inside* the project as a dev-dependency (`@rushstack/heft`), so typing a bare `heft` in the terminal gives you `'heft' is not recognized`.

Two things fix this:

1. **Install the project's packages once** (creates `node_modules`, including the local `heft`):

   ```powershell
   cd <your-workspace>\agents\my-first-copilot-app
   npm install
   ```

2. **Run heft through the project**, using one of these - both find the local copy:

   - `npx heft <command>` - runs the project's pinned Heft directly. Use this form everywhere below.
   - `npm start` - runs the `start` script from `package.json`. Pass extra flags after `--`, e.g. `npm start -- --nobrowser`.

> **Do not** `npm install -g @rushstack/heft`. A global Heft can drift from the version this project pins (`1.2.22`) and cause confusing build errors. Always use the local copy via `npx` or an `npm` script.

---

## Local test loop - the Copilot Workbench

```powershell
nvm use 22
cd <your-workspace>\agents\my-first-copilot-app
npx heft start --nobrowser
```

This serves your component from `https://localhost:4321`. Then:

1. Open the **Copilot Workbench**:
   `https://<your-tenant>.sharepoint.com/_layouts/15/copilotworkbench.aspx`
2. When prompted, **accept the debug manifests** (loading local scripts).
3. **Activate** your `HelloAgent` component.
4. **"Fire turn"** to simulate a Copilot invocation and see your UI render (test both `inline` and `fullscreen`).

> **Why the Workbench and not real Copilot:** it loads your local build without deploying, so the edit→refresh loop is seconds, not a deploy cycle. Same idea as the classic SPFx Workbench, Copilot-flavored.

### Heft command reference

Prefix each with `npx ` (e.g. `npx heft start --nobrowser`) so it runs the project's local Heft.

| Command | Does |
|---------|------|
| `npx heft start --nobrowser` | Dev server + watch (local Workbench testing). |
| `npx heft build` | Compile + lint, no bundle. |
| `npx heft build --production` | Production compile. |
| `npx heft package-solution --production` | Produce the shippable `.sppkg`. |
| `npx heft clean` | Clear `lib/`, `dist/`, `temp/` (fixes stale-bundle weirdness). |

> If you hit a stale/`ControlStrings`-type error: `npx heft clean` then `npx heft start` again.

---

## Package loop - make the `.sppkg`

```powershell
npx heft clean
npx heft build --production
npx heft package-solution --production
```

Output lands at:

```
sharepoint/solution/my-first-copilot-app.sppkg
```

> **Bump the version first.** In `config/package-solution.json` increment `solution.version` (`1.0.0.1` → `1.0.0.2`, etc.) *every* time you re-deploy. SharePoint distinguishes packages by this number; skip it and the tenant may not pick up your new code. (Same rule as classic SPFx - see the `spfx-development` skill.)

### Optional: validate the agent package

```powershell
atk validate --package-file agent-file.zip
```

(Microsoft 365 Agents Toolkit CLI. beta.3 also validates the declarative-agent manifest at build time.)

---

## Deploy loop - into the tenant & Copilot

1. Go to your **App Catalog** → **Apps for SharePoint**.
2. **Upload** `my-first-copilot-app.sppkg`. Choose to make it available (tenant-wide if appropriate).
3. Approve any **API permission requests** (SharePoint Admin Center → Advanced → API Access) if your component calls Graph.
4. Click **Add to Teams** on the package. This **auto-syncs the declarative agent into the tenant agent catalog** - no separate publish step.
5. Open **Microsoft 365 Copilot / Copilot Chat** → your agent appears in the agent list. Start a conversation; trigger a conversation starter; watch your Component render (and expand to `fullscreen`).

> Admins can also push it via the **M365 admin center** to speed availability to users.

> **Preview limits:** **no marketplace / AppSource distribution** during preview. Distribution is within your tenant only.

---

## The whole cycle at a glance

```
edit code
  → npx heft start --nobrowser → test in Copilot Workbench   (seconds)
  → happy?
     → bump version in package-solution.json
     → npx heft clean && npx heft build --production && npx heft package-solution --production
     → upload .sppkg to app catalog → Add to Teams
     → appears in M365 Copilot
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `'heft' is not recognized` | Heft is a local dev-dependency, not global | Run `npm install` once, then use `npx heft ...` (or `npm start`) |
| Component won't load in Workbench | Debug manifest not accepted / server not running | Re-run `npx heft start`, accept manifests, hard-refresh |
| Old code after re-deploy | Version not bumped | Bump `solution.version`, re-package, re-upload |
| Node engine error | Not on Node 22 | `nvm use 22` |
| Stale bundle errors | Cached build artifacts | `npx heft clean` then rebuild |
| Agent not in Copilot after upload | "Add to Teams" not clicked / sync delay | Click Add to Teams; wait; or push via admin center |
| Graph 401/403 in component | API permissions not approved | Approve in SharePoint Admin Center → API Access |

Next: [05-best-practices.md](05-best-practices.md).
