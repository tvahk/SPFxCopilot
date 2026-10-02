# SPFxCopilot

A repository for building and testing SPFx Copilot extensions and custom solutions for Microsoft 365 Copilot.

## What's here

| Folder | What it is |
|--------|------------|
| [`learn/`](learn/) | A single-page learning hub I put together: links, prerequisites, the scaffold flow, project anatomy, and build and deploy notes. Open [`learn/index.html`](learn/index.html) in a browser, or view it online at [tvahk.github.io/SPFxCopilot](https://tvahk.github.io/SPFxCopilot/). |
| [`docs/`](docs/) | My longer notes: [glossary](docs/00-glossary.md), [prerequisites](docs/01-prerequisites.md), [scaffolding](docs/02-scaffold-first-agent.md), [project anatomy](docs/03-project-anatomy.md), [build, run and deploy](docs/04-build-run-deploy.md), [best practices](docs/05-best-practices.md), [declarative agent JSON](docs/06-declarative-agent-schema.md), [skills and tooling](docs/07-skills-and-tooling.md), and the [Site Snapshot scenario](docs/scenario-01-site-snapshot.md). |
| [`reference/`](reference/) | Annotated study code I used to understand the moving parts. Read it, but it's not a buildable project. |
| [`agents/site-snapshot/`](agents/site-snapshot/) | The agent I built: a SharePoint site health check. See below. |

## Site Snapshot

My first real build. Ask Copilot to check a site, and it shows a health score with the detail behind it: stale documents, external and "Anyone" sharing, duplicates, large and empty files, and a breakdown by file type and owner. The inline card expands to a fullscreen dashboard where you can export to CSV or email yourself a summary, and you can ask follow-up questions about the results in chat.

Under the hood it uses the brokered Microsoft Graph client, Fluent UI v9, Zod tool parameters, and Jest tests for the scoring. The [README](agents/site-snapshot/README.md) explains how to build and deploy it.

## Versions I'm using

Node 22 · React 18 · TypeScript 5.8 · Fluent UI v9 · Heft (not gulp) · `@microsoft/generator-sharepoint@next` (1.24.0-beta.3)

To scaffold your own, the walkthrough is in [`docs/02-scaffold-first-agent.md`](docs/02-scaffold-first-agent.md):

```powershell
nvm use 22
npm i @microsoft/generator-sharepoint@next -g
cd agents && mkdir my-first-copilot-app && cd my-first-copilot-app
yo @microsoft/sharepoint      # Copilot Component, then React
npx heft start --nobrowser    # test in the Copilot Workbench
```

## Things I learned the hard way

- **Copilot can't see your card.** When the agent calls a component tool, the model only learns that a card was shown, not what's in it. To let it answer follow-ups, push the results back with `copilotBridge.updateModelContextAsync`.
- **Give each agent its own Teams app ID.** If you copy `copilot/manifest.json` between projects, Teams treats both as the same app and the sync quietly does nothing.
- **Bump both versions on every deploy:** `solution.version` in `package-solution.json` and `version` in `copilot/manifest.json`.
- **Don't upload the `teams/*.zip` by hand.** It contains a `{{TENANT_MCP_URL}}` placeholder that only **Add to Teams** fills in.
- **Custom apps may need approving.** In Teams admin center the agent can show up as *Submitted* or *Blocked* until you publish and allow it.

## Caveats

- Preview only: build on a sandbox or developer tenant. APIs, file names and schemas may change before general availability.
- When my notes and your scaffold disagree, trust the scaffold. The generator moves quickly.

## License

[MIT](LICENSE)
