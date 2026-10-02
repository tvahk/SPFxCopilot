# 02 · Scaffold your first agent - the exact `yo` flow

> **Status:** SPFx **1.24 public preview**. Prompt wording may vary slightly by beta; the **Copilot Component** path is the confirmed one.

You will scaffold a real Copilot App called `my-first-copilot-app`. You run this yourself (guided path) so you learn the actual generator and stay current with the moving preview. The [reference/](../reference/) folder is annotated study code to compare against - not a substitute for scaffolding.

---

## Step 1 - new folder, inside the workspace

Always scaffold *inside* an empty folder - the generator drops files into the current directory.

```powershell
nvm use 22
cd <your-workspace>\agents
mkdir my-first-copilot-app
cd my-first-copilot-app
```

---

## Step 2 - run the generator

```powershell
yo @microsoft/sharepoint
```

Answer the prompts (Copilot-relevant path shown):

| Prompt | Answer | Why |
|--------|--------|-----|
| **What is your solution name?** | `my-first-copilot-app` | Names the `.sppkg` and the solution folder. |
| **Which type of client-side component to create?** | **Copilot Component** | The new agent component type. (Web Part / Extension / Library / ACE still appear - ignore them here.) |
| **What is your Copilot component name?** | `HelloAgent` | Becomes the class + manifest name. Keep it PascalCase, meaningful. |
| **Which template would you like to use?** | **React** | Your preference. Options are **Minimal** (barest render), **No framework** (plain TS), **React** (React 18 in 1.24 templates). |

> The generator then runs `npm install`. On the preview beta this can take a few minutes and may print peer-dependency warnings - those are expected on a beta.

---

## Step 3 - pin React (important on preview)

SPFx GA is React 17; the **1.24 preview templates use React 18**, but transitive installs can drift. If the template didn't already pin them, pin exact:

```powershell
npm install react@18 react-dom@18 --save-exact
```

> Check `package.json` - if React 18 is already exact-pinned by the template, skip this. Never leave React on a caret range in an SPFx project; mismatches cause the classic React #300 hook error.

---

## Step 4 - open it and orient

```powershell
code .
```

Now read [03-project-anatomy.md](03-project-anatomy.md) with the generated files open side-by-side. That doc explains **every folder and file and why it exists**.

---

## What you should see (top-level)

A successful scaffold produces roughly:

```
my-first-copilot-app/
├── config/                 # build + packaging config, incl. copilot-agent.json
├── copilot/                # the DECLARATIVE AGENT definition (manifest, DA json, ai-plugin, instructions)
├── src/
│   └── copilotComponents/
│       └── helloAgent/     # YOUR component: .ts/.tsx, .manifest.json, Properties (Zod)
├── teams/ or appManifests/ # app-package assets (icons etc.) - name varies by beta
├── package.json            # deps + scripts (heft-based)
├── tsconfig.json
└── .yo-rc.json             # records the generator answers (SPFx version, component type)
```

> Exact folder names (e.g. `teams/` vs `appManifests/`) can differ between betas. Trust *your* scaffold over any doc - then update [03-project-anatomy.md](03-project-anatomy.md) if yours differs, so future-you isn't confused.

---

## Common scaffold problems

| Symptom | Cause | Fix |
|---------|-------|-----|
| No "Copilot Component" option | Wrong generator channel/version | Reinstall `@microsoft/generator-sharepoint@next`; confirm 1.24 beta 2+ |
| `yo` not found | Yeoman missing | `npm install yo --global` |
| Node engine error during scaffold | Not on Node 22 | `nvm use 22` |
| React #300 at runtime later | React version drift | Exact-pin `react`/`react-dom` (Step 3) |

Next: [03-project-anatomy.md](03-project-anatomy.md).
