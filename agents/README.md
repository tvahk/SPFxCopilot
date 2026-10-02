# agents/ - your build workspace

This is where your **real** SPFx Copilot App solutions live. Each agent is its own scaffolded SPFx project in a subfolder here.

## Scaffold your first one

```powershell
nvm use 22
cd <your-workspace>\agents
mkdir my-first-copilot-app
cd my-first-copilot-app
yo @microsoft/sharepoint
#   → Which type of client-side component to create?  →  Copilot Component
#   → Copilot component name?                          →  HelloAgent
#   → Which template?                                  →  React
```

Full step-by-step: [`../docs/02-scaffold-first-agent.md`](../docs/02-scaffold-first-agent.md).
Understand what got generated: [`../docs/03-project-anatomy.md`](../docs/03-project-anatomy.md).
Compare against annotated study code: [`../reference/`](../reference/).

## Layout as it grows

```
agents/
├── my-first-copilot-app/     # scaffolded SPFx Copilot App (React)
├── <next-agent>/             # future custom agents, same pattern
└── ...
```

## Ground rules

- **One SPFx solution per subfolder.** Don't scaffold into `agents/` directly.
- **Node 22 + `@next` generator + React 18** - see [`../docs/01-prerequisites.md`](../docs/01-prerequisites.md).
- **Build with Heft, not gulp** - see [`../docs/04-build-run-deploy.md`](../docs/04-build-run-deploy.md).
- **Preview** feature - sandbox/dev tenant only until GA.
- Each scaffolded solution brings its own `.gitignore`; keep `node_modules/`, `lib/`, `dist/`, `temp/`, `*.sppkg` out of git.

> Using an AI coding assistant? Give it the pinned stack in [`../docs/05-best-practices.md`](../docs/05-best-practices.md) first, so it uses the right versions and commands.
