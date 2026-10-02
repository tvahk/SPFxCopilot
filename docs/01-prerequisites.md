# 01 · Prerequisites - get your machine and tenant ready

> **Status:** SPFx **1.24 public preview**. The versions below are the current preview requirements and can change before general availability.

Work through this once. Every later doc assumes it's done.

---

## 1. Node.js 22 (exact major matters)

SPFx 1.22-1.24 require **Node.js v22**. Not 18, not 20.

Use a version manager so this project doesn't fight your other SPFx work (the `spfx-development` skill's Provisioner solution is on Node 18 for SPFx 1.20 - keep them separate):

```powershell
# nvm-windows
nvm install 22
nvm use 22
node -v      # expect v22.x
```

> **Why pinned:** the SPFx build toolchain validates the Node major at build time and refuses to run on an unsupported one.

---

## 2. The preview Yeoman generator

The Copilot Component type only exists in the **preview** generator channel:

```powershell
npm install @microsoft/generator-sharepoint@next --global
# verify it resolved to a 1.24.x beta:
npm ls -g @microsoft/generator-sharepoint
```

You also need Yeoman itself if you don't have it:

```powershell
npm install yo --global
```

> The tutorial requires **SPFx 1.24 beta 2 or newer**. If your `@next` resolves to something older, uninstall and reinstall to force the newest beta.

> **Heads-up:** `@next` moves. If a scaffold suddenly behaves differently from these docs, check which beta you're on - beta.3 (Aug 27 2026) bumped the declarative-agent manifest to **schema v1.8** and added build-time manifest validation.

---

## 3. Trust the dev certificate (once per machine)

Same as classic SPFx - the local dev server serves over HTTPS from `https://localhost:4321`:

```powershell
npx @microsoft/spfx-heft-plugins@latest trust-dev-cert
```

> On older setups you may know this as `gulp trust-dev-cert`. On 1.22+ (Heft) it's a heft/rushstack command. If unsure, the generator prints the exact command after scaffolding - use that one.

---

## 4. An M365 tenant with the pieces switched on

You need a tenant where you can:

- **Provision a SharePoint app catalog** (Apps for SharePoint). Tenant admin, or a dev tenant where you are admin.
- **Upload and deploy a `.sppkg`.**
- **Access Microsoft 365 Copilot preview** so the agent actually surfaces (Copilot Chat).

> **Licensing during preview:** **no Copilot license is required** to *build, deploy, or run* Copilot Apps - for makers or end users. GA licensing is "not yet finalized". Don't assume it stays free.

A **Microsoft 365 Developer tenant** (with sample data) is the cleanest sandbox. Use a throwaway tenant, not a client's production.

---

## 5. The Copilot Workbench (your local test surface)

This is where you test a Component before deploying anything:

```
https://<your-tenant>.sharepoint.com/_layouts/15/copilotworkbench.aspx
```

You'll use it after `npx heft start --nobrowser` - see [04-build-run-deploy.md](04-build-run-deploy.md).

---

## 6. Editor + optional tooling

- **VS Code** (recommended).
- **Microsoft 365 Agents Toolkit** (the evolution of Teams Toolkit) - optional but useful for validating the packaged agent: `atk validate --package-file agent-file.zip`.

---

## Readiness checklist

- [ ] `node -v` → `v22.x`
- [ ] `@microsoft/generator-sharepoint@next` installed globally, resolves to **1.24 beta 2+**
- [ ] `yo` installed
- [ ] Dev cert trusted
- [ ] Tenant with **app catalog** + you can deploy `.sppkg`
- [ ] Tenant has **M365 Copilot** available
- [ ] You can open the **Copilot Workbench** URL above

When all boxes are checked → [02-scaffold-first-agent.md](02-scaffold-first-agent.md).
