# reference/ - annotated study code (READ, don't build)

> ⚠️ **This is NOT a scaffolded, buildable SPFx project.** It's hand-written, heavily-commented study material showing the *shape* of a SharePoint Copilot App on **SPFx 1.24 preview**. Use it to understand what the generator produces and why. To build for real, scaffold in [`../agents/`](../agents/) following [`../docs/02-scaffold-first-agent.md`](../docs/02-scaffold-first-agent.md), then compare your generated files against these.

## Why hand-written and not scaffolded here

The 1.24 generator is a moving **public preview**. Committing a "frozen" scaffold would drift from whatever beta you install and mislead you. Instead these files:

- show the **key files** (not the full generated tree),
- are **annotated line-by-line** with the *why*,
- demonstrate the **`inline` + `fullscreen` ("open the full app")** pattern in React.

Names, schema versions, and exact APIs **will differ** from your scaffold. When they do, trust your scaffold.

## What's here

```
reference/
├── copilot/                                   # the declarative agent definition
│   ├── manifest.json                          # M365/Teams app manifest (agent identity)
│   ├── declarativeAgent.json                  # agent brain-config (schema v1.8)
│   ├── ai-plugin.json                         # actions → your component's tools
│   └── instruction.txt                        # natural-language agent behavior
└── copilotComponents/helloAgent/              # your UI + logic
    ├── HelloAgentCopilotComponent.tsx         # BaseCopilotComponent class; mounts React; display modes
    ├── HelloAgentCopilotComponent.manifest.json  # componentType/copilotType/displayModes/tools
    ├── HelloAgentCopilotComponentProperties.ts   # Zod tool-parameter schema
    └── components/
        └── HelloAgent.tsx                      # the actual React UI (inline vs fullscreen)
```

Read them in this order: `instruction.txt` → `declarativeAgent.json` → `ai-plugin.json` → the component `.manifest.json` → `...Properties.ts` → the `.tsx` files. That mirrors the request flow in [`../docs/03-project-anatomy.md`](../docs/03-project-anatomy.md).
