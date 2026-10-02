# 07 · Skills, and the tooling around agents

> **Status:** Preview era. Names and features move. Verify against the linked docs.

Can you build "skills" for Copilot? Yes, but the word "skill" means three different things in this ecosystem, and only one of them is literally an artifact you author. This doc separates them clearly, then lists the helper tools worth having.

## The word "skill" means three different things

### 1. SharePoint Skills (a `SKILL.md` file) - no-code, site-scoped

This is the only thing literally called a "skill" that you author as a file.

- **What it is:** a repeatable, multi-step workflow saved as a Markdown file, used by **Copilot in SharePoint** (the first-party experience, currently preview). It captures your rules, such as a document standard or a review checklist, so Copilot behaves consistently instead of relying on one-off prompts.
- **Where it lives:** in the site's Agent Assets library, at `/Agent Assets/Skills/<skill-name>/SKILL.md`. Each skill is its own folder.
- **How you build one:** open Copilot in SharePoint and say "create a skill to ...". Review the draft and save. It writes the `SKILL.md` for you. You can also edit the Markdown directly, or install a community skill by uploading its folder.
- **How you run it:** Copilot loads a relevant skill automatically, or you invoke it by name. Type `/skills` in chat to list the built-in ones.
- **The hard limit:** a SharePoint Skill **cannot call external systems or run custom code**. It only reuses Copilot in SharePoint's built-in abilities, within the user's existing permissions. So this is not where your SPFx code runs.
- Docs: https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills
- Community gallery (about 50 skills): https://pnp.github.io/sharepoint-skills/ and https://github.com/pnp/sharepoint-skills

### 2. Agent "skills" in Copilot Studio and Agents Toolkit - a loose word for capabilities and actions

In the declarative agent world there is **no file named "skill"**. Microsoft's own tutorial called "add skills" redirects to "add capabilities and custom actions". So here, "skills" just means the two things you attach to an agent:

- **Capabilities**: built-in features you switch on in `declarativeAgent.json`, such as `WebSearch` or `CodeInterpreter` (full list in [06-declarative-agent-schema.md](06-declarative-agent-schema.md)).
- **Actions, which are plugins**: an **API plugin** (a REST API described by OpenAPI) or an **MCP plugin** (a Model Context Protocol server). These let the agent do things, not just read. They are defined in `ai-plugin.json` and referenced from the agent's `actions`.
- Tutorial: https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/build-declarative-agents-add-skills

### 3. Your SPFx Copilot Component's tools - the pro-code equivalent

This is the one that matters most for you. A Copilot Component declares **tools** in its manifest. **Each tool becomes an action the declarative agent can invoke.** So the closest pro-code thing to "a skill you build" is a **tool or action on a declarative agent**, and the SPFx Copilot App is the way to attach your own React UI to it.

### How the terms line up

| Term | Meaning in the declarative agent model |
|------|----------------------------------------|
| Capability | A built-in agent feature you toggle in the manifest. |
| Action | An entry in `actions[]` that binds the agent to a plugin. |
| Plugin | The implementation behind an action (API plugin or MCP plugin), defined in `ai-plugin.json`. |
| Tool | A single callable operation. Your SPFx component declares tools, and each one surfaces as an action. |
| "Skill" | No single meaning. In SharePoint it is a `SKILL.md`. In Copilot Studio and Agents Toolkit it loosely means capabilities plus actions. |

---

## How to build each one

**A SharePoint Skill (`SKILL.md`).** No code. In Copilot in SharePoint, say "create a skill to ...", review, and save. To share it, zip the skill folder so an admin can upload it into another site's Agent Assets.

**A declarative agent with actions.** Pro-code, using the Agents Toolkit. Scaffold an agent (`atk new -c declarative-agent`), edit `declarativeAgent.json` to add capabilities and conversation starters, then add an action from an OpenAPI document or an MCP server, and provision it. Optionally author the whole thing in TypeSpec.

**A SharePoint Copilot App (the main path in this hub).** Pro-code, using SPFx. This is covered end to end in [02-scaffold-first-agent.md](02-scaffold-first-agent.md) through [04-build-run-deploy.md](04-build-run-deploy.md). Your tools live in the component manifest, and they become the agent's actions.

---

## Knowledge sources an agent can be grounded on

Set these through the `capabilities` array (or a builder UI). Current limits are worth knowing:

- **SharePoint and OneDrive** files, folders, or sites. Up to 100 SharePoint items and 50 OneDrive items.
- **Public web**, up to 4 site URLs.
- **Teams chats**, up to 5 URLs.
- **Copilot (Graph) connectors** for line-of-business data.
- **Dataverse, People, Meetings, and Email** per the v1.8 schema.

Docs: https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/knowledge-sources

---

## Helper materials and tooling

### JSON schemas (for editor validation)

- Declarative agent v1.8: `https://developer.microsoft.com/json-schemas/copilot/declarative-agent/v1.8/schema.json`
- API plugin v2.4: `https://developer.microsoft.com/json-schemas/copilot/plugin/v2.4/schema.json`
- Teams app manifest: `https://developer.microsoft.com/json-schemas/teams/v1.19/MicrosoftTeams.schema.json`
- Schema source repo: https://github.com/microsoft/AgentSchema

### Microsoft 365 Agents Toolkit (VS Code extension and `atk` CLI)

- Install the CLI: `npm i -g @microsoft/m365agentstoolkit-cli`
- Useful commands: `atk new -c declarative-agent`, `atk provision --env dev`, and `atk validate --package-file agent-file.zip`.
- Use `atk validate` on your packaged agent, because the SPFx build does not yet validate the agent definition.
- CLI docs: https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/microsoft-365-agents-toolkit-cli

### No-code and low-code makers

- **Agent Builder**, the lightweight declarative agent maker inside Microsoft 365 Copilot.
- **Copilot Studio**, which offers more capabilities and also full custom-engine agents.

### TypeSpec for Microsoft 365 Copilot

Author agents in a typed language instead of hand-editing JSON.
- Overview: https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/overview-typespec
- Build a declarative agent with TypeSpec: https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/build-declarative-agents-typespec

### Debugging

- **Developer mode in Copilot chat:** type `-developer on` to get a debug card showing the knowledge consulted, the capabilities used, and the actions matched and executed, including the HTTP request and response. Turn it off with `-developer off`.
- **Copilot Workbench** for testing SPFx Copilot Components locally (see [04-build-run-deploy.md](04-build-run-deploy.md)).
- Docs: https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/debugging-agents-copilot-studio

### Sample galleries

- SPFx Copilot Components: https://github.com/pnp/spfx-copilot-components
- SharePoint Copilot Apps: https://github.com/pnp/spfx-copilot-apps
- Pro-dev Copilot samples (declarative agents, plugins): https://github.com/pnp/copilot-pro-dev-samples
- Agents Toolkit samples: https://github.com/OfficeDev/microsoft-365-agents-toolkit-samples
- Copilot Developer Camp labs: https://microsoft.github.io/copilot-camp/

---

## Bottom line

If you want a pro-code, buildable "skill", what you actually build is a **tool or action on a declarative agent**, and the **SharePoint Copilot App** is the best way to do it because your React UI renders inside Copilot. **SharePoint Skills (`SKILL.md`)** are a separate, no-code, site-scoped feature - useful to know and to package for admins, but not where your SPFx code lives.
