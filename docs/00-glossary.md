# 00 · Glossary - words you must get straight first

> **Status:** SPFx **1.24 is in public preview**. The names and schemas below can still shift before general availability, so treat every term as "current preview".

The single biggest source of confusion here is that four different things all sound like "an agent". They are not the same. Read this once and the rest of the repo makes sense.

---

## The one-sentence mental model

> A **SharePoint Copilot App** is an **SPFx solution** that bundles one or more **Copilot Components** (your React UI that renders *inside* Microsoft 365 Copilot) together with a **declarative agent** definition (the manifest + instructions that make Copilot discover, describe, and call them).

Everything else is a detail of that sentence.

---

## Core terms

| Term | What it actually is | Where it lives |
|------|--------------------|----------------|
| **Microsoft 365 Copilot** | The host chat surface (the "canvas") your agent shows up in. | The product; the tenant. |
| **Declarative agent** | A Copilot agent *described by config, not code that runs a model*: a manifest, instructions, knowledge sources, conversation starters, and **actions**. You author it as JSON + text. | `copilot/declarativeAgent.json` (+ `manifest.json`, `instruction.txt`) |
| **Copilot Component** | Your **client-side UI** (React) that renders **inside** the Copilot canvas. This is the SPFx-specific piece. Extends `BaseCopilotComponent`. | `src/copilotComponents/<name>/` |
| **Tool** | A named, typed capability your Copilot Component exposes. Each tool's parameters are described with a **Zod** schema. | `<Name>CopilotComponent.manifest.json` → `tools[]` + `...Properties.ts` |
| **Action (API plugin)** | How the declarative agent tells the *model* "you can call this". Each Component **tool** surfaces to the agent as an **action**. | `copilot/ai-plugin.json` |
| **SharePoint Copilot App** | The whole packaged thing = declarative agent + Component(s), shipped as one `.sppkg`. Also being renamed to **"Copilot Components"** (product name, TBD at GA). | The `.sppkg` |

---

## `inline` vs `fullscreen` - this is your "opens a full app"

A Copilot Component declares which **display modes** it supports (`capabilities.availableDisplayModes` in its manifest) and renders differently in each:

- **`inline`** - renders compactly *inside the chat conversation*. The default. Think: a card, a small interactive widget in the message stream.
- **`fullscreen`** - **expands to occupy the full Copilot surface**. This is the *"the agent opens a full app"* experience - a real, full-canvas React app launched from a chat.

Your code reads the current mode and can request expansion:

```ts
// current mode
const mode = this.hostContext.displayMode;          // 'inline' | 'fullscreen'

// ask the host to go full-screen (host grants it)
await this.requestDisplayModeAsync('fullscreen');

// collapse is ALWAYS host-initiated - you get notified, you don't force it
protected onHostContextChanged(): void { /* re-read displayMode, re-render */ }
```

> **Rule:** you can *request* fullscreen; only the host *collapses* you. Design both layouts.

---

## "Build once, reach every surface"

Microsoft's stated direction: the same underlying framework-agnostic UX can back **both** a Copilot Component (`BaseCopilotComponent`) **and** a classic web part (`BaseClientSideWebPart`), so one `.sppkg` serves Copilot, pages, and Teams.

> **Preview caveat:** *today* Components render **only** in the Copilot UX. Cross-surface reuse is the roadmap, not shipped. Don't promise a client a web-part + Copilot twofer yet.

---

## Declarative agent vs the *other* ways to build a Copilot agent

You will see these in the docs - know which lane you're in:

| Path | What it is | Use it when |
|------|-----------|-------------|
| **SharePoint Copilot App (SPFx)** ← *this repo* | Declarative agent **+ your own React UI inside Copilot**. Pro-code, hosted automatically in your tenant. | You want **interactive UI in Copilot** (dashboards/wizards/forms) or a **full-screen app** + real SharePoint/Graph actions, and you already do SPFx/React. |
| **Agent Builder (in Copilot)** | No-code declarative agent grounded on your files/sites. | Fastest path; instructions + starters + knowledge, **no custom UI**. |
| **Declarative agent via Agents Toolkit / TypeSpec** | Same declarative-agent concept, authored in VS Code / TypeSpec - **no custom in-canvas UI**. | Pro-code instructions + knowledge + **API actions**, source-controlled, no bespoke UI. |
| **Copilot Studio agent** | Low-code agent builder. | Citizen devs; conversational flows over connectors; no SPFx. |
| **Custom engine agent** | You bring your *own* model/orchestration. | Full control over the LLM loop. Most effort. |

This repo is entirely about the **first row**.

> **Rule of thumb - when to pick SPFx:** choose it when the value is in **rich interactive UI rendered inside Copilot** (or a full-screen app) plus real SharePoint/Graph actions, and your team is a pro-dev SPFx shop. If there's **no custom-UI requirement**, a lighter option ships faster - Agent Builder for Q&A over docs, Copilot Studio for citizen-dev flows, Agents Toolkit for API-action agents with no UI, custom engine only when you need your own model.

---

## Toolchain words that trip people up

| Term | Note |
|------|------|
| **Heft** | The rushstack build tool. **Replaces gulp** as of SPFx **1.22**. You run `heft ...`, not `gulp ...`. |
| **Yeoman generator** | `@microsoft/generator-sharepoint`. For Copilot you need the **preview** channel: `@next`. A dedicated **SPFx CLI** is planned for ~v1.25 to replace it. |
| **Copilot Workbench** | The local test surface at `/_layouts/15/copilotworkbench.aspx` - the Copilot equivalent of the classic SPFx Workbench. |
| **Zod** | Runtime schema library used to describe each tool's parameters (so Copilot knows what args to pass). |

See [01-prerequisites.md](01-prerequisites.md) next.
