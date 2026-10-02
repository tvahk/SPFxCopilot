# Scenario 01 · Site Snapshot - your first *useful* Copilot App

> **Status:** SPFx **1.24 public preview**. Graph v1.0 endpoints used here are stable; the SPFx Copilot Component APIs are preview.

> **Ready to build it?** Follow the step-by-step build-along, [`learn/vol2-site-snapshot.html`](../learn/vol2-site-snapshot.html), which walks the full solution (Fluent UI, PnPjs, PnP controls, a presentation-first data seam) milestone by milestone. This doc is the spec behind it. The finished skeleton lives in [`../reference/scenario-site-snapshot/`](../reference/scenario-site-snapshot/).

This is your first build: a SharePoint governance co-pilot that gives an **on-demand health snapshot** of a site - storage pressure, stale documents, external sharing, largest files, last activity - rolled into a single **opinionated health score**, right inside Microsoft 365 Copilot. It can **export** the snapshot to CSV and **email** it to you.

It's a deliberate first project because it teaches *every* core mechanic while producing something you'd actually keep and run against real client sites.

---

## Why this one (and why it isn't a community clone)

- **Useful on day one:** any site owner or consultant wants "how healthy / risky is this site?" in ten seconds. You'll use it in real tenants.
- **It computes, it doesn't just display.** Community samples (`react-copilot-apis-explorer`, `react-copilot-retrieval-api`) are read-only *viewers* of Graph/Copilot APIs. Site Snapshot applies an **opinionated, transparent scoring model** and produces an actionable worklist - that's the novel part.
- **It takes a real action:** `emailSnapshot` actually sends mail via Graph. Not a "look, it rendered" demo.
- **Right permission weight for a first app:** mostly **read** scopes (you approve them once as tenant admin), plus one delegated write (`Mail.Send`). Because it's delegated, it only ever sees what *you* can see - a nice governance property.

---

## What it teaches (the learning payload)

| Concept | Where you hit it |
|---------|------------------|
| Copilot Component class, `inline` vs `fullscreen` | render branch |
| Multiple **tools** + **Zod** parameter schemas | `analyzeSite`, `exportSnapshot`, `emailSnapshot` |
| Declarative agent **instructions** shaping behavior | `instruction.txt` |
| Real **Graph** calls via SPFx `AadHttpClient` | storage, items, permissions |
| A **side-effecting action** (send mail) | `emailSnapshot` |
| **Throttle-safe** enumeration (batching, caps, caching) | items + permissions scan |
| **CSV export**, friendly errors, theme-aware UI | fullscreen |
| Approving **`webApiPermissionRequests`** | deployment |

---

## Permissions (what to request & approve)

Declare in `config/package-solution.json`:

```json
"webApiPermissionRequests": [
  { "resource": "Microsoft Graph", "scope": "Sites.Read.All" },
  { "resource": "Microsoft Graph", "scope": "Files.Read.All" },
  { "resource": "Microsoft Graph", "scope": "Mail.Send" }
]
```

Approve once after deploy: **SharePoint Admin Center → Advanced → API Access**. (See [04-build-run-deploy.md](04-build-run-deploy.md).) `Mail.Send` is delegated - it sends *as you*, no service account.

> **Governance win:** everything is delegated, so the snapshot reflects only what the running user can access. No elevation, no seeing other people's private sites.

---

## The three tools

| Tool | Params (Zod) | Returns / effect |
|------|--------------|------------------|
| `analyzeSite` | `siteUrl?` (default: current site), `staleMonths?` (default 6), `topN?` (default 10) | The `SiteSnapshot` object (score + sub-scores + detail lists). |
| `exportSnapshot` | - | Triggers a client-side CSV download of the detail rows. |
| `emailSnapshot` | `recipient?` (default: me) | Sends an HTML summary via Graph `/me/sendMail`. Real side effect. |

Keep tool names + `ai-plugin.json` functions + component manifest `tools[]` in sync (see [03-project-anatomy.md](03-project-anatomy.md)).

---

## The health-score model (opinionated but transparent)

A 0-100 score from four weighted penalties. **Make the weights constants** so the score is explainable and tunable - always show the sub-scores in fullscreen so it's never a black box.

```
score = 100
  − storagePenalty     (used% over 70% → up to −20)
  − stalePenalty       (% of docs not modified in > staleMonths → up to −30)
  − exposurePenalty    (externally-shared items; "Anyone" links weigh double → up to −35)
  − frecencyPenalty    (days since last activity over 90 → up to −15)
clamp to 0..100
```

Liftable, fully-working implementation: [`../reference/scenario-site-snapshot/src/copilotComponents/siteSnapshot/models/health.ts`](../reference/scenario-site-snapshot/src/copilotComponents/siteSnapshot/models/health.ts). It's pure (no Graph, no React) so you can unit-test it first (see `models/health.test.ts`) - a nice TDD entry point.

---

## Inline vs fullscreen UI plan

**Inline** (glanceable, one action):
```
🏥 Site Snapshot · "Project X"
Health 72/100 · 4.2 GB used · 18 stale · 5 external shares
[ Open breakdown ]        ← requestDisplayModeAsync('fullscreen')
```

**Fullscreen** (the app):
- Header: site name + big score + one-line verdict.
- Storage bar (used / quota) with the storage sub-score.
- Sub-score breakdown (four bars, so the number is explainable).
- Three detail panels (tabs or stacked): **Stale docs**, **External shares**, **Largest files** - each sortable, each row linking to the item.
- Actions row: **[Export CSV]** · **[Email me this snapshot]**.

Design both from the start; handle host-initiated collapse in `onHostContextChanged()`. Theme-aware colors via CSS custom properties (see [05-best-practices.md](05-best-practices.md)).

---

## Graph calls (v1.0 - stable)

Service and PnPjs data source: [`../reference/scenario-site-snapshot/src/copilotComponents/siteSnapshot/services/`](../reference/scenario-site-snapshot/src/copilotComponents/siteSnapshot/services/). Core endpoints:

| Need | Endpoint |
|------|----------|
| Resolve site by URL | `GET /sites/{hostname}:/sites/{path}` |
| Storage quota | `GET /sites/{site-id}/drive` → `quota.used` / `quota.total` |
| Enumerate library items | `GET /sites/{site-id}/drive/root/children` (page via `@odata.nextLink`) |
| Per-item modified/size | `driveItem.lastModifiedDateTime`, `driveItem.size` |
| External sharing on an item | `GET /drives/{drive-id}/items/{item-id}/permissions` → inspect `link.scope` (`anonymous` = Anyone), `grantedToIdentitiesV2` (external) |
| Send the report | `POST /me/sendMail` |

**Throttle-safe rules (bake in from M3):**
- Cap enumeration (e.g. first 500 items) and **show "showing first N of M"** - never silently truncate (a best-practice rule).
- Batch permission lookups in groups of ~10; cache reads 5 min.
- Reuse the skill's `graphGet`/`cached()`/`getFriendlyError()` helpers rather than hand-rolling.

---

## `instruction.txt` (agent behavior)

```
You are "Site Snapshot", a SharePoint governance assistant. When the user asks
about a site's health, storage, stale content, external sharing, largest files,
or cleanup, call the analyzeSite tool. If they don't name a site, use the
current site; if it's ambiguous, ask for the site URL before analyzing.

After showing a snapshot, offer to export it to CSV or email it to them.
Never invent numbers - only report values returned by the tools. Explain the
health score using its sub-scores; don't present it as a black box.

Stay on topic: site governance snapshots. Politely decline unrelated requests
and say what you can do. Never expose tool names, JSON, or internal fields.
```

---

## Build it in milestones (each one is independently useful)

Do these in order - every milestone leaves you with something real, so you learn incrementally instead of big-bang.

- **M0 · Plumbing.** Scaffold (Copilot Component → React, see [02](02-scaffold-first-agent.md)). Render "Hello" in both `inline` and `fullscreen`. Proves the pipeline end-to-end in the Copilot Workbench.
- **M1 · First real data.** `analyzeSite` reads **storage quota + last activity** for the current site → inline score card (storage sub-score only). Already useful.
- **M2 · Stale + largest.** Enumerate library items (capped, paged); compute stale % and top-N largest; add the stale + frecency sub-scores; show the two lists in fullscreen.
- **M3 · External exposure.** Scan permissions (batched) for Anyone/external; add exposure sub-score + the external-shares list. Now it's a genuine governance tool.
- **M4 · Export.** `exportSnapshot` → CSV of the detail rows (reuse the skill's `exportToCsv`).
- **M5 · The real action.** `emailSnapshot` → `POST /me/sendMail` with an HTML summary. This is the "does something" milestone.
- **M6 · Polish.** Theming, `getFriendlyError`, 5-min caching, batch tuning, tool args for `staleMonths`/`topN`, empty/erroring states.

---

## Definition of *useful* (acceptance - don't stop at "it renders")

You're done when, against a **real** site, you can:

- [ ] See an **accurate** storage used/quota % and a health score whose sub-scores add up and make sense.
- [ ] Get a **stale-docs list you would actually act on** (correct dates, real files, capped-with-count).
- [ ] Get an **external-sharing list you'd actually review** (Anyone links flagged higher-risk).
- [ ] **Email yourself** the snapshot and receive a readable HTML summary.
- [ ] Handle a site you can't access / an empty library **gracefully** (friendly message, no stack trace).

If it only renders sample data, it's not finished - the whole point is that it tells you something true and lets you act.

---

## Reuse, don't reinvent (the assignment's real constraint)

- **Component shape:** copy the pattern in [`../reference/`](../reference/) (thin class, React UI, display-mode wiring).
- **Graph/Zod/scoring:** lift [`../reference/scenario-site-snapshot/`](../reference/scenario-site-snapshot/) - health scoring is complete; service + schemas are ready to adapt.
- **Cross-cutting helpers:** pull `graphGet`, `cached()`, `exportToCsv`, `getFriendlyError`, `getThemeColors` from the `spfx-development` skill conventions (in [05-best-practices.md](05-best-practices.md)) - don't rewrite them.
- **Graph-call patterns:** peek at `react-copilot-apis-explorer` for how it calls Graph from a component - borrow the technique, not the app.

When you're ready to build, scaffold in [`../agents/`](../agents/) and work through the milestones in this file. The finished result is in [`../agents/site-snapshot/`](../agents/site-snapshot/).
