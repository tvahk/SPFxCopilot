# SPFxCopilot

Learn to build **Microsoft 365 Copilot agents with the SharePoint Framework (SPFx) + React**, and build your own here - without re-inventing what the community already ships.

> **What this actually is:** "SharePoint Copilot Apps" / "Copilot Components" - SPFx client-side UI that renders *inside* Microsoft 365 Copilot, packaged with a **declarative agent**, that can expand to **open a full app** (the component's `fullscreen` display mode). Ships in **SPFx 1.24 public preview**. Not 1.21.

## Start here

1. **Open the learning hub:** online at **[tvahk.github.io/spfx-copilot-learning-hub](https://tvahk.github.io/spfx-copilot-learning-hub/)**, or open [`learn/index.html`](learn/index.html) locally. Curated links, guided path, prerequisites, scaffold flow, project anatomy, build/deploy cheat-sheet, best practices.
2. **Follow the docs** as you go - see below.
3. **Scaffold your first agent** in [`agents/`](agents/).

## Layout

| Folder | What's in it |
|--------|--------------|
| [`learn/`](learn/) | The self-contained HTML learning hub (offline, theme-aware). |
| [`docs/`](docs/) | Deep-dive reference: [00 glossary](docs/00-glossary.md), [01 prerequisites](docs/01-prerequisites.md), [02 scaffold](docs/02-scaffold-first-agent.md), [03 anatomy](docs/03-project-anatomy.md), [04 build/run/deploy](docs/04-build-run-deploy.md), [05 best practices](docs/05-best-practices.md), [06 declarative agent JSON reference](docs/06-declarative-agent-schema.md), [07 skills and tooling](docs/07-skills-and-tooling.md), and **[Scenario 01 - Site Snapshot](docs/scenario-01-site-snapshot.md)** (your first build). |
| [`reference/`](reference/) | Hand-written **annotated study code** (read to learn - not a buildable project). |
| [`agents/`](agents/) | Your real scaffolded SPFx Copilot App solutions (one per subfolder). |
| [`CLAUDE.md`](CLAUDE.md) | Pinned versions/commands so Claude helps correctly. Point Claude here first. |

## The stack (pinned)

Node **22** · React **18** · TypeScript **5.x** · Fluent UI **v8** · build with **Heft** (not gulp) · generator `@microsoft/generator-sharepoint@next`.

## Quick scaffold

```powershell
nvm use 22
npm i @microsoft/generator-sharepoint@next -g
cd agents && mkdir my-first-copilot-app && cd my-first-copilot-app
yo @microsoft/sharepoint      # → Copilot Component → HelloAgent → React (runs npm install for you)
npx heft start --nobrowser    # test in the Copilot Workbench (heft is local - prefix with npx)
```

Full walkthrough: [`docs/02-scaffold-first-agent.md`](docs/02-scaffold-first-agent.md).

## What to build first

**[Scenario 01 - Site Snapshot](docs/scenario-01-site-snapshot.md):** a SharePoint governance co-pilot that gives an on-demand **health snapshot** of a site (storage, stale docs, external sharing, largest files) as an opinionated score inside Copilot - and can **export/email** it. Useful day one, teaches every core mechanic, and ships with liftable code in [`reference/scenario-site-snapshot/`](reference/scenario-site-snapshot/) (the health-score model is ready to use). Build it in milestones M0→M6.

Then build it hands-on with the **[Vol 2 build-along page](learn/vol2-site-snapshot.html)**: a full solution skeleton using Fluent UI, PnPjs, and the PnP React controls, with a presentation-first data seam (build on mock data, then swap in real Graph). Skeleton in [`reference/scenario-site-snapshot/`](reference/scenario-site-snapshot/).

## Finished example

[`agents/site-snapshot/`](agents/site-snapshot/) is the complete, buildable Site Snapshot solution built from Scenario 01: inline score card and fullscreen dashboard, brokered Microsoft Graph, model context for follow-up questions, and Jest tests. See its [README](agents/site-snapshot/README.md) to build and deploy it.

## Caveats

- **Public preview** - APIs, file names, and schema versions change. Trust your scaffold over the docs when they disagree, and update the docs.
- **Sandbox/dev tenant only** until GA. No marketplace distribution in preview. No Copilot license required during preview.

---
*This feature is in preview. Verify against the official Microsoft Learn links in the hub.*

## License

[MIT](LICENSE)
